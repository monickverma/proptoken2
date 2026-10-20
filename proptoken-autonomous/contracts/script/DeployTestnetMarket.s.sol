// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AssetRegistry.sol";
import "../src/OracleAttestationVerifier.sol";
import "../src/TokenFactory.sol";
import "../src/tokens/RWASecurityToken.sol";
import "../src/redemption/AsyncRedemptionController.sol";
import "../src/testnet/TestUSD.sol";
import "../src/testnet/PropTokenMarket.sol";

/**
 * Deploys the full testnet stack and lists the five demo assets:
 * registry, verifier, factory, redemption controller, TestUSD, market,
 * one RWASecurityToken per asset, and a funded buyback reserve.
 *
 * The signer comes from the command line (no key in this file or in env):
 *   forge script script/DeployTestnetMarket.s.sol --rpc-url base_sepolia \
 *     --account <keystore-name> --sender <deployer-address> --broadcast
 *
 * Optional env: ORACLE_ADDRESS (gets CONSENSUS_ROLE on the registry),
 * DEPLOYMENTS_OUT (default deployments/base-sepolia.json).
 */
contract DeployTestnetMarket is Script {

    struct DemoAsset {
        string id;
        string name;
        string symbol;
        uint256 priceUsd;      // whole tUSD per whole token
        uint256 totalTokens;
    }

    uint16 constant SELL_SPREAD_BPS = 200;          // 2%
    uint256 constant RESERVE = 1_000_000 * 1e6;     // 1M tUSD buyback reserve

    function _assets() internal pure returns (DemoAsset[5] memory a) {
        // Ids and names match DUMMY_ASSETS in constants.tsx; prices are the
        // rupee prices divided by 100, in tUSD.
        a[0] = DemoAsset("ASSET-GGM-001", "DLF Cyber Hub", "PT-DLFCH", 50, 1_000_000);
        a[1] = DemoAsset("ASSET-GGM-002", "One Horizon Center", "PT-OHC", 120, 2_500_000);
        a[2] = DemoAsset("ASSET-GGM-003", "Ambience Mall Complex", "PT-AMC", 25, 5_000_000);
        a[3] = DemoAsset("ASSET-GGM-004", "Worldmark Gurugram", "PT-WMG", 45, 1_500_000);
        a[4] = DemoAsset("ASSET-GGM-005", "Candor TechSpace", "PT-CTS", 35, 3_000_000);
    }

    function run() external {
        address oracle = vm.envOr("ORACLE_ADDRESS", address(0));
        string memory out = vm.envOr("DEPLOYMENTS_OUT", string("deployments/base-sepolia.json"));

        vm.startBroadcast();
        address deployer = msg.sender;

        AssetRegistry registry = new AssetRegistry(deployer);
        OracleAttestationVerifier verifier = new OracleAttestationVerifier(deployer);
        TokenFactory factory = new TokenFactory(address(registry), deployer);
        AsyncRedemptionController redemption = new AsyncRedemptionController(deployer);
        TestUSD usd = new TestUSD(deployer);
        PropTokenMarket market = new PropTokenMarket(address(usd), deployer, SELL_SPREAD_BPS);

        // Factory marks assets tokenized; deployer registers the demo assets
        registry.grantRole(registry.DEFAULT_ADMIN_ROLE(), address(factory));
        registry.grantRole(registry.CONSENSUS_ROLE(), deployer);
        if (oracle != address(0)) {
            registry.grantRole(registry.CONSENSUS_ROLE(), oracle);
            verifier.authorizeOracle(oracle, true);
        }

        DemoAsset[5] memory assets = _assets();
        address[5] memory tokens;
        for (uint256 i = 0; i < assets.length; i++) {
            DemoAsset memory a = assets[i];
            bytes32 fp = keccak256(bytes(a.id));
            registry.registerAsset(fp, deployer, bytes32(0), bytes32(0), [uint256(1e18), 1e18, 0, 15], true, false);

            RWASecurityToken t = RWASecurityToken(factory.deployToken(
                fp, a.name, a.symbol, "PropToken demo asset on Base Sepolia (testnet, no value)",
                a.priceUsd * a.totalTokens * 1e18
            ));
            t.grantRole(t.MINTER_ROLE(), address(market));
            t.grantRole(t.COMPLIANCE_ROLE(), address(market));
            t.verifyInvestor(address(market), true);
            t.verifyInvestor(address(redemption), true);
            market.setPrice(address(t), a.priceUsd * 1e6);
            tokens[i] = address(t);
        }

        usd.mint(address(market), RESERVE);
        registry.renounceRole(registry.CONSENSUS_ROLE(), deployer);

        vm.stopBroadcast();

        _write(out, deployer, registry, verifier, factory, redemption, usd, market, assets, tokens);
    }

    function _write(
        string memory out,
        address deployer,
        AssetRegistry registry,
        OracleAttestationVerifier verifier,
        TokenFactory factory,
        AsyncRedemptionController redemption,
        TestUSD usd,
        PropTokenMarket market,
        DemoAsset[5] memory assets,
        address[5] memory tokens
    ) internal {
        string memory assetsJson;
        for (uint256 i = 0; i < assets.length; i++) {
            string memory key = assets[i].id;
            vm.serializeString(key, "name", assets[i].name);
            vm.serializeString(key, "symbol", assets[i].symbol);
            vm.serializeUint(key, "priceUsd", assets[i].priceUsd);
            string memory entry = vm.serializeAddress(key, "token", tokens[i]);
            assetsJson = vm.serializeString("assets", key, entry);
        }

        string memory root = "deployment";
        vm.serializeUint(root, "chainId", block.chainid);
        vm.serializeUint(root, "deployedAtBlock", block.number);
        vm.serializeAddress(root, "deployer", deployer);
        vm.serializeAddress(root, "assetRegistry", address(registry));
        vm.serializeAddress(root, "oracleAttestationVerifier", address(verifier));
        vm.serializeAddress(root, "tokenFactory", address(factory));
        vm.serializeAddress(root, "asyncRedemptionController", address(redemption));
        vm.serializeAddress(root, "testUsd", address(usd));
        vm.serializeAddress(root, "market", address(market));
        string memory json = vm.serializeString(root, "assets", assetsJson);
        vm.writeJson(json, out);
        console.log("Wrote", out);
    }
}
