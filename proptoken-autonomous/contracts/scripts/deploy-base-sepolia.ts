import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying AssetRegistry to Base Sepolia...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // Deploy AssetRegistry
    const AssetRegistry = await ethers.getContractFactory("AssetRegistry");
    const assetRegistry = await AssetRegistry.deploy(deployer.address);

    await assetRegistry.waitForDeployment();
    const address = await assetRegistry.getAddress();

    console.log("✅ AssetRegistry deployed to:", address);

    // Grant CONSENSUS_ROLE to deployer (for testing)
    const CONSENSUS_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CONSENSUS_ROLE"));
    const tx = await assetRegistry.grantRole(CONSENSUS_ROLE, deployer.address);
    await tx.wait();
    console.log("✅ CONSENSUS_ROLE granted to:", deployer.address);

    // Save deployment info
    const deploymentInfo = {
        network: "baseSepolia",
        assetRegistry: address,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        consensusRoleGranted: deployer.address
    };

    console.log("\n📝 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🔍 Verify on BaseScan:");
    console.log(`https://sepolia.basescan.org/address/${address}`);

    console.log("\n📋 Next Steps:");
    console.log("1. Update contract-addresses.ts with the deployed address");
    console.log("2. Update oracle config with this address");
    console.log("3. Fund the oracle wallet and grant it CONSENSUS_ROLE");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
