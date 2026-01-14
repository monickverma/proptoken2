// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetRegistry.sol";
import "../src/OracleAttestationVerifier.sol";
import "../src/TokenFactory.sol";
import "../src/tokens/RWASecurityToken.sol";
import "../src/redemption/AsyncRedemptionController.sol";

contract IntegrationTest is Test {
    AssetRegistry registry;
    TokenFactory factory;
    AsyncRedemptionController redemption;
    
    address admin = address(0x1);
    address oracle = address(0x2);
    address alice = address(0x3);
    address bob = address(0x4);
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy Core
        registry = new AssetRegistry(admin);
        factory = new TokenFactory(address(registry), admin);
        redemption = new AsyncRedemptionController(admin);
        
        // Roles
        registry.grantRole(registry.CONSENSUS_ROLE(), oracle);
        registry.grantRole(registry.DEFAULT_ADMIN_ROLE(), address(factory)); // Factory needs admin to markAsTokenized
        
        vm.stopPrank();
    }
    
    function testEndToEndFlow() public {
        bytes32 fingerprint = keccak256("Asset Data");
        
        // 1. Register Asset (Oracle)
        vm.startPrank(oracle);
        registry.registerAsset(
            fingerprint,
            admin, // owner
            bytes32(0), // attestation root
            bytes32(0), // abm hash
            [uint256(1e18), uint256(1e18), uint256(0), uint256(10)], // scores
            true // eligible
        );
        vm.stopPrank();
        
        assertTrue(registry.isEligible(fingerprint));
        
        // 2. Deploy Token (Admin via Factory)
        vm.startPrank(admin);
        address tokenAddr = factory.deployToken(
            fingerprint,
            "Real Estate Token",
            "RWA",
            "Test Asset",
            1000000 * 1e18 // $1M NAV
        );
        vm.stopPrank();
        
        RWASecurityToken token = RWASecurityToken(tokenAddr);
        assertTrue(registry.isTokenized(fingerprint));
        assertEq(token.navPerToken(), 0); // No supply yet
        
        // 3. Setup Compliance & Mint
        vm.startPrank(admin);
        token.grantRole(token.COMPLIANCE_ROLE(), admin);
        token.verifyInvestor(alice, true);
        token.verifyInvestor(bob, true);
        token.verifyInvestor(address(redemption), true); // Allow controller to hold tokens
        
        token.mint(alice, 100 * 1e18);
        vm.stopPrank();
        
        assertEq(token.balanceOf(alice), 100 * 1e18);
        
        // Verify NAV
        // Supply = 100, Value = 1M. NAV per token = 1M / 100 = 10,000
        assertEq(token.navPerToken(), 10000 * 1e18);
        
        // 4. Compliant Transfer
        vm.prank(alice);
        token.transfer(bob, 50 * 1e18);
        assertEq(token.balanceOf(bob), 50 * 1e18);
        
        // 5. Redemption
        vm.startPrank(bob);
        token.approve(address(redemption), 50 * 1e18);
        bytes32 requestId = redemption.requestRedemption(address(token), 50 * 1e18);
        vm.stopPrank();
        
        // Verify Locked
        assertEq(token.balanceOf(bob), 0);
        assertEq(token.balanceOf(address(redemption)), 50 * 1e18);
        
        (,, uint256 amount,,,,,) = redemption.redemptionRequests(requestId);
        assertEq(amount, 50 * 1e18);
    }
}
