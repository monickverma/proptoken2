// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "../src/AssetRegistry.sol";
import "../src/OracleAttestationVerifier.sol";
import "../src/TokenFactory.sol";
import "../src/tokens/RWASecurityToken.sol";
import "../src/redemption/AsyncRedemptionController.sol";

/// Unit and regression tests for access control, compliance and redemption edge cases.
contract ContractsTest is Test {
    AssetRegistry registry;
    TokenFactory factory;
    AsyncRedemptionController redemption;
    OracleAttestationVerifier verifier;
    RWASecurityToken token;

    address admin = address(0xA11CE);
    address oracle = address(0x0AC1E);
    address alice = address(0x3);
    address bob = address(0x4);
    address carol = address(0x5);
    address mallory = address(0xBAD);

    bytes32 constant FP = keccak256("Asset Data");

    event NAVUpdated(uint256 newNAV, uint256 navPerToken); // mirrors RWASecurityToken

    function setUp() public {
        vm.startPrank(admin);
        registry = new AssetRegistry(admin);
        factory = new TokenFactory(address(registry), admin);
        redemption = new AsyncRedemptionController(admin);
        verifier = new OracleAttestationVerifier(admin);
        registry.grantRole(registry.CONSENSUS_ROLE(), oracle);
        registry.grantRole(registry.DEFAULT_ADMIN_ROLE(), address(factory));
        redemption.grantRole(redemption.OPERATOR_ROLE(), admin);
        vm.stopPrank();

        _register(FP, true);

        vm.startPrank(admin);
        token = RWASecurityToken(factory.deployToken(FP, "Real Estate Token", "RWA", "Test Asset", 1_000_000e18));
        token.verifyInvestor(alice, true);
        token.verifyInvestor(bob, true);
        token.verifyInvestor(address(redemption), true);
        token.mint(alice, 100e18);
        vm.stopPrank();
    }

    function _register(bytes32 fp, bool eligible) internal {
        vm.prank(oracle);
        registry.registerAsset(fp, admin, bytes32(0), bytes32(0), [uint256(1e18), 1e18, 0, 10], eligible, false);
    }

    function _expectMissingRole(address account, bytes32 role) internal {
        vm.expectRevert(abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, account, role));
    }

    // ---------------------------------------------------------------- AssetRegistry

    function test_Registry_OnlyConsensusCanRegister() public {
        _expectMissingRole(mallory, registry.CONSENSUS_ROLE());
        vm.prank(mallory);
        registry.registerAsset(keccak256("x"), mallory, 0, 0, [uint256(1e18), 1e18, 0, 10], true, false);
    }

    function test_Registry_RejectsDuplicateZeroAndOutOfRange() public {
        vm.startPrank(oracle);
        vm.expectRevert("Asset already registered");
        registry.registerAsset(FP, admin, 0, 0, [uint256(1e18), 1e18, 0, 10], true, false);

        vm.expectRevert("Invalid fingerprint");
        registry.registerAsset(bytes32(0), admin, 0, 0, [uint256(1e18), 1e18, 0, 10], true, false);

        vm.expectRevert("Invalid owner");
        registry.registerAsset(keccak256("y"), address(0), 0, 0, [uint256(1e18), 1e18, 0, 10], true, false);

        vm.expectRevert("Invalid existence score");
        registry.registerAsset(keccak256("y"), admin, 0, 0, [uint256(1e18 + 1), 1e18, 0, 10], true, false);

        vm.expectRevert("Invalid risk score");
        registry.registerAsset(keccak256("y"), admin, 0, 0, [uint256(1e18), 1e18, 0, 101], true, false);
        vm.stopPrank();
    }

    function test_Registry_DetectsMockPrefix() public {
        bytes32 mockFp = bytes32(abi.encodePacked(bytes4(0x74657374), bytes28(keccak256("spv"))));
        _register(mockFp, true);
        assertTrue(registry.getAsset(mockFp).isMock);
        assertFalse(registry.getAsset(FP).isMock);
    }

    // ---------------------------------------------------------------- TokenFactory

    function test_Factory_RejectsIneligibleAndDuplicate() public {
        bytes32 bad = keccak256("ineligible");
        _register(bad, false);
        vm.startPrank(admin);
        vm.expectRevert("Asset not eligible");
        factory.deployToken(bad, "N", "N", "d", 1);
        vm.expectRevert("Token already exists");
        factory.deployToken(FP, "N", "N", "d", 1);
        vm.stopPrank();
    }

    /// Regression: the factory used to keep DEFAULT_ADMIN and MINTER on every token it deployed.
    function test_Factory_DoesNotKeepRolesOnToken() public view {
        assertFalse(token.hasRole(token.DEFAULT_ADMIN_ROLE(), address(factory)));
        assertFalse(token.hasRole(token.MINTER_ROLE(), address(factory)));
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(token.hasRole(token.MINTER_ROLE(), admin));
        assertTrue(registry.isTokenized(FP));
        assertEq(registry.getTokenAddress(FP), address(token));
    }

    // ---------------------------------------------------------------- RWASecurityToken compliance

    function test_Token_OnlyMinterCanMint() public {
        _expectMissingRole(mallory, token.MINTER_ROLE());
        vm.prank(mallory);
        token.mint(mallory, 1);
    }

    function test_Token_MintRequiresVerifiedInvestor() public {
        vm.prank(admin);
        vm.expectRevert("Investor not verified");
        token.mint(carol, 1e18);
    }

    function test_Token_TransferToUnverifiedReverts() public {
        vm.prank(alice);
        vm.expectRevert("Transfer not compliant");
        token.transfer(carol, 1e18);
    }

    function test_Token_FrozenAndPausedBlockTransfers() public {
        vm.prank(admin);
        token.freezeWallet(alice, true);
        vm.prank(alice);
        vm.expectRevert("Transfer not compliant");
        token.transfer(bob, 1e18);

        vm.startPrank(admin);
        token.freezeWallet(alice, false);
        token.pause(true);
        vm.stopPrank();
        vm.prank(alice);
        vm.expectRevert("Transfer not compliant");
        token.transfer(bob, 1e18);
    }

    function test_Token_ForcedTransferRequiresAgent() public {
        _expectMissingRole(mallory, token.AGENT_ROLE());
        vm.prank(mallory);
        token.forcedTransfer(alice, mallory, 1e18, "steal");
    }

    /// Regression: investors who received tokens by transfer were never counted, so the cap could be bypassed.
    function test_Token_InvestorCapHoldsForTransfers() public {
        // Lower the cap to 2 (alice + bob) by writing the storage slot directly; there is no setter.
        uint256 slot = _slotOf("maxInvestorsCount()");
        vm.store(address(token), bytes32(slot), bytes32(uint256(2)));
        assertEq(token.maxInvestorsCount(), 2);

        vm.prank(admin);
        token.verifyInvestor(carol, true);

        vm.prank(alice);
        token.transfer(bob, 10e18);
        assertEq(token.currentInvestorsCount(), 2);
        assertTrue(token.isInvestor(bob));

        vm.prank(alice);
        vm.expectRevert("Transfer not compliant");
        token.transfer(carol, 1e18);
    }

    function test_Token_InvestorCountDropsWhenBalanceReachesZero() public {
        vm.prank(alice);
        token.transfer(bob, 100e18);
        assertEq(token.currentInvestorsCount(), 1);
        assertFalse(token.isInvestor(alice));

        vm.prank(bob);
        token.burn(100e18);
        assertEq(token.currentInvestorsCount(), 0);
    }

    function test_Token_UpdateNAVEmitsEvent() public {
        vm.expectEmit(address(token));
        emit NAVUpdated(2_000_000e18, 20_000e18);
        vm.prank(admin);
        token.updateNAV(2_000_000e18);
    }

    // ---------------------------------------------------------------- AsyncRedemptionController

    function _request(address who, uint256 amount) internal returns (bytes32 id) {
        vm.startPrank(who);
        token.approve(address(redemption), amount);
        id = redemption.requestRedemption(address(token), amount);
        vm.stopPrank();
    }

    /// Regression: two identical requests in the same block got the same ID and the first was overwritten.
    function test_Redemption_IdenticalRequestsInOneBlockAreDistinct() public {
        bytes32 a = _request(alice, 10e18);
        bytes32 b = _request(alice, 10e18);
        assertTrue(a != b);
        assertEq(redemption.getInvestorRequests(alice).length, 2);
        assertEq(redemption.pendingRedemptions(address(token)), 20e18);
        assertEq(redemption.getRedemptionRequest(a).tokenAmount, 10e18);
        assertEq(redemption.getRedemptionRequest(b).tokenAmount, 10e18);
    }

    function test_Redemption_RejectsZeroAndOverBalance() public {
        vm.startPrank(alice);
        vm.expectRevert("Invalid amount");
        redemption.requestRedemption(address(token), 0);
        vm.expectRevert("Insufficient balance");
        redemption.requestRedemption(address(token), 101e18);
        vm.stopPrank();
    }

    function test_Redemption_OnlyOperatorCanApproveSettleCancel() public {
        bytes32 id = _request(alice, 10e18);
        bytes32 role = redemption.OPERATOR_ROLE();
        vm.startPrank(mallory);
        _expectMissingRole(mallory, role);
        redemption.approveRedemption(id, 1, bytes32(0));
        _expectMissingRole(mallory, role);
        redemption.settleRedemption(id);
        _expectMissingRole(mallory, role);
        redemption.cancelRedemption(id, "no");
        vm.stopPrank();
    }

    function test_Redemption_SettleRequiresApproval() public {
        bytes32 id = _request(alice, 10e18);
        vm.prank(admin);
        vm.expectRevert("Not approved");
        redemption.settleRedemption(id);
    }

    function test_Redemption_CancelReturnsTokens() public {
        bytes32 id = _request(alice, 10e18);
        assertEq(token.balanceOf(alice), 90e18);

        vm.prank(admin);
        redemption.cancelRedemption(id, "investor withdrew");

        assertEq(token.balanceOf(alice), 100e18);
        assertEq(redemption.pendingRedemptions(address(token)), 0);
        assertEq(uint256(redemption.getRedemptionRequest(id).status), uint256(AsyncRedemptionController.RedemptionStatus.Cancelled));

        vm.prank(admin);
        vm.expectRevert("Cannot cancel");
        redemption.cancelRedemption(id, "again");
    }

    // ---------------------------------------------------------------- OracleAttestationVerifier

    /// Regression: authorizeOracle(oracle, false) used to grant ORACLE_ROLE instead of revoking it.
    function test_Verifier_DeauthorizeRevokesRole() public {
        vm.startPrank(admin);
        verifier.authorizeOracle(oracle, true);
        assertTrue(verifier.hasRole(verifier.ORACLE_ROLE(), oracle));
        verifier.authorizeOracle(oracle, false);
        vm.stopPrank();

        assertFalse(verifier.hasRole(verifier.ORACLE_ROLE(), oracle));
        assertFalse(verifier.authorizedOracles(oracle));

        _expectMissingRole(oracle, verifier.ORACLE_ROLE());
        vm.prank(oracle);
        verifier.storeAttestation(keccak256("root"));
    }

    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    function test_Verifier_VerifiesMerkleProofAgainstStoredRoot() public {
        // 4-leaf tree built the way OpenZeppelin's MerkleProof expects (sorted pairs, keccak256)
        bytes32 l0 = keccak256("existence:0.97");
        bytes32 l1 = keccak256("ownership:0.95");
        bytes32 l2 = keccak256("activity:0.80");
        bytes32 l3 = keccak256("registry:ok");
        bytes32 n01 = _hashPair(l0, l1);
        bytes32 n23 = _hashPair(l2, l3);
        bytes32 root = _hashPair(n01, n23);

        vm.prank(admin);
        verifier.authorizeOracle(oracle, true);
        vm.prank(oracle);
        verifier.storeAttestation(root);

        bytes32[] memory proof = new bytes32[](2);
        proof[0] = l3;
        proof[1] = n01;
        assertTrue(verifier.verifyOracleResult(root, l2, proof));
        assertFalse(verifier.verifyOracleResult(root, keccak256("activity:0.99"), proof));

        vm.expectRevert("Invalid attestation root");
        verifier.verifyOracleResult(keccak256("unknown"), l2, proof);
    }

    // ---------------------------------------------------------------- helpers

    function _slotOf(string memory getter) internal returns (uint256) {
        // Find the storage slot behind a public uint256 getter by probing slots.
        uint256 current = abi.decode(_staticcall(getter), (uint256));
        for (uint256 i = 0; i < 64; i++) {
            bytes32 before = vm.load(address(token), bytes32(i));
            if (uint256(before) != current) continue;
            vm.store(address(token), bytes32(i), bytes32(current + 1));
            bool hit = abi.decode(_staticcall(getter), (uint256)) == current + 1;
            vm.store(address(token), bytes32(i), before);
            if (hit) return i;
        }
        revert("slot not found");
    }

    function _staticcall(string memory getter) internal view returns (bytes memory out) {
        bool ok;
        (ok, out) = address(token).staticcall(abi.encodeWithSignature(getter));
        require(ok, "getter failed");
    }
}
