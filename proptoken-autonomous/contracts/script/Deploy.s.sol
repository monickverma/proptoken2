// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AssetRegistry.sol";
import "../src/OracleAttestationVerifier.sol";
import "../src/TokenFactory.sol";
import "../src/redemption/AsyncRedemptionController.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Asset Registry
        AssetRegistry registry = new AssetRegistry(deployer);
        console.log("AssetRegistry deployed at:", address(registry));

        // 2. Deploy Oracle Verifier
        OracleAttestationVerifier verifier = new OracleAttestationVerifier(deployer);
        console.log("OracleAttestationVerifier deployed at:", address(verifier));

        // 3. Deploy Token Factory
        TokenFactory factory = new TokenFactory(address(registry), deployer);
        console.log("TokenFactory deployed at:", address(factory));

        // 4. Deploy Redemption Controller
        AsyncRedemptionController redemption = new AsyncRedemptionController(deployer);
        console.log("AsyncRedemptionController deployed at:", address(redemption));

        // 5. Setup Permissions
        // specific setup: factory needs admin role on registry to mark assets as tokenized
        // In AssetRegistry, markAsTokenized checks for DEFAULT_ADMIN_ROLE (0x00)
        registry.grantRole(registry.DEFAULT_ADMIN_ROLE(), address(factory));
        console.log("Granted ADMIN role to TokenFactory on AssetRegistry");

        vm.stopBroadcast();
    }
}
