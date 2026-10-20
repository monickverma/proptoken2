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

    // Fixed vector generated by the Go oracle: TestCrossLanguageVector in
    // oracle-network/internal/crypto/merkle_test.go (`go test ./internal/crypto -run CrossLanguage -v`).
    bytes32 constant GO_ROOT = 0x40ea529ae6e9ca78b662d67e1c79a3d137ec0b7c35a237dffbf0b30504b4789a;
    string constant GO_SUB = "sub-42";

    struct GoSignal {
        string category;
        string signal;
        string source;
        uint256 score;
        bytes32 leaf;
        bytes32[] proof;
    }

    function _goVector() internal pure returns (GoSignal[] memory v) {
        v = new GoSignal[](5);
        v[0] = GoSignal("existence", "satellite_image", "OpenStreetMap/Yandex", 1e18,
            0x2495b3c94dc8ec6227d6ea74e4a7362a487073199ddab3cca7eb595817867264, new bytes32[](3));
        v[0].proof[0] = 0x12d90b09cfb9bfb434559eeb08e4d8aaee2d027c6a234426aeecf95186dc0fc2;
        v[0].proof[1] = 0xe10ad878a8cc7a40ad9b1f04f9d5331f3524411c69158bc544fd93cc990f841d;
        v[0].proof[2] = 0x02fd10a8be8b604a72c5f51074add430143567488da470986b193478ffddcf34;

        v[1] = GoSignal("existence", "vision_analysis", "ComputerVision", 0.9e18,
            0x26a1280e5081fe5994f15acb02dd02dbf94f878020baa6083cae861f16412e2e, new bytes32[](2));
        v[1].proof[0] = 0xd08a8c4cb096d0409ea989bfa442d1bcfea8db4ceb5e1fb5184da2334ffe5aba;
        v[1].proof[1] = 0x1aa3befa791a98036db4a1cc5b1f7b3b8f239096c73d9f1b4d14515e5478d85b;

        v[2] = GoSignal("ownership", "mca_registry", "MCA_Mock", 1e18,
            0xd08a8c4cb096d0409ea989bfa442d1bcfea8db4ceb5e1fb5184da2334ffe5aba, new bytes32[](2));
        v[2].proof[0] = 0x26a1280e5081fe5994f15acb02dd02dbf94f878020baa6083cae861f16412e2e;
        v[2].proof[1] = 0x1aa3befa791a98036db4a1cc5b1f7b3b8f239096c73d9f1b4d14515e5478d85b;

        v[3] = GoSignal("ownership", "deed_integrity", "HashRegistry", 1e18,
            0x12d90b09cfb9bfb434559eeb08e4d8aaee2d027c6a234426aeecf95186dc0fc2, new bytes32[](3));
        v[3].proof[0] = 0x2495b3c94dc8ec6227d6ea74e4a7362a487073199ddab3cca7eb595817867264;
        v[3].proof[1] = 0xe10ad878a8cc7a40ad9b1f04f9d5331f3524411c69158bc544fd93cc990f841d;
        v[3].proof[2] = 0x02fd10a8be8b604a72c5f51074add430143567488da470986b193478ffddcf34;

        v[4] = GoSignal("activity", "foot_traffic", "MockGooglePlaces", 0.9e18,
            0xe10ad878a8cc7a40ad9b1f04f9d5331f3524411c69158bc544fd93cc990f841d, new bytes32[](2));
        v[4].proof[0] = 0x72fc51bf63f2b4655ddf8d3ccc4a6e30ea8f8e175e2ba1b931b449ae2bcf3880;
        v[4].proof[1] = 0x02fd10a8be8b604a72c5f51074add430143567488da470986b193478ffddcf34;
    }

    function _storeGoRoot() internal {
        vm.prank(admin);
        verifier.authorizeOracle(oracle, true);
        vm.prank(oracle);
        verifier.storeAttestation(GO_ROOT);
    }

    /// Cross-language: leaves computed on-chain from the typed fields match the Go
    /// oracle's leaves, and every proof the Go oracle produced verifies against its root.
    function test_Verifier_GoOracleVector() public {
        _storeGoRoot();
        GoSignal[] memory v = _goVector();
        for (uint256 i = 0; i < v.length; i++) {
            assertEq(verifier.signalLeaf(GO_SUB, v[i].category, v[i].signal, v[i].source, v[i].score), v[i].leaf);
            assertTrue(
                verifier.verifyOracleResult(GO_ROOT, GO_SUB, v[i].category, v[i].signal, v[i].source, v[i].score, v[i].proof)
            );
        }
    }

    function test_Verifier_RejectsAlteredSignal() public {
        _storeGoRoot();
        GoSignal memory s = _goVector()[1]; // existence/vision_analysis, 0.9

        assertFalse(verifier.verifyOracleResult(GO_ROOT, GO_SUB, s.category, s.signal, s.source, 0.99e18, s.proof));
        assertFalse(verifier.verifyOracleResult(GO_ROOT, "sub-43", s.category, s.signal, s.source, s.score, s.proof));
        assertFalse(verifier.verifyOracleResult(GO_ROOT, GO_SUB, "ownership", s.signal, s.source, s.score, s.proof));

        vm.expectRevert("Invalid attestation root");
        verifier.verifyOracleResult(keccak256("unknown"), GO_SUB, s.category, s.signal, s.source, s.score, s.proof);
    }

    /// Why the leaf is computed on-chain: with a caller-supplied leaf, an inner node
    /// plus the rest of the path verifies against the root. verifyOracleResult no
    /// longer accepts a raw leaf, only the fields that hash to one.
    function test_Verifier_InnerNodeIsNotALeaf() public pure {
        GoSignal[] memory v = _goVector();
        bytes32 a = v[1].leaf;
        bytes32 b = v[2].leaf;
        bytes32 inner = a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
        bytes32[] memory rest = new bytes32[](1);
        rest[0] = v[1].proof[1];
        assertTrue(MerkleProof.verify(rest, GO_ROOT, inner)); // what the old leaf-taking API allowed
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
