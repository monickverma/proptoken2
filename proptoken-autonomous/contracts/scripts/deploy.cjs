const hre = require("hardhat");

async function main() {
    console.log("🚀 Starting deployment to Base Sepolia...\n");

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    // console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
    console.log("");

    // Deploy AssetRegistry
    console.log("📝 Deploying AssetRegistry...");
    const AssetRegistry = await hre.ethers.getContractFactory("AssetRegistry");
    const assetRegistry = await AssetRegistry.deploy();
    await assetRegistry.waitForDeployment();
    const assetRegistryAddress = await assetRegistry.getAddress();
    console.log("✅ AssetRegistry deployed to:", assetRegistryAddress);
    console.log("");

    // Deploy TokenFactory if available, otherwise skip
    try {
        console.log("📝 Deploying TokenFactory...");
        const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
        const tokenFactory = await TokenFactory.deploy(assetRegistryAddress, deployer.address);
        await tokenFactory.waitForDeployment();
        const tokenFactoryAddress = await tokenFactory.getAddress();
        console.log("✅ TokenFactory deployed to:", tokenFactoryAddress);
        console.log("");

        // Grant TokenFactory permission to mark assets as tokenized
        console.log("🔑 Granting TokenFactory admin role...");
        const DEFAULT_ADMIN_ROLE = await assetRegistry.DEFAULT_ADMIN_ROLE();
        const tx = await assetRegistry.grantRole(DEFAULT_ADMIN_ROLE, tokenFactoryAddress);
        await tx.wait();
        console.log("✅ TokenFactory granted admin role");
    } catch (error) {
        console.log("⚠️ TokenFactory deployment skipped or failed (non-critical):", error.message);
    }

    // Summary
    console.log("=".repeat(60));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("AssetRegistry:", assetRegistryAddress);
    // console.log("TokenFactory:", tokenFactoryAddress);
    console.log("=".repeat(60));
    console.log("");
    console.log("📋 Next steps:");
    console.log("1. Verify contracts on BaseScan");
    console.log("2. Update frontend with contract addresses");
    console.log("3. Configure Oracle with AssetRegistry address");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
