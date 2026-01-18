const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying AssetRegistry to Base Sepolia...");

    // Get signer from private key
    const signers = await hre.ethers.getSigners();

    if (!signers || signers.length === 0) {
        throw new Error("❌ No signers available! Check your PRIVATE_KEY in .env file");
    }

    const deployer = signers[0];
    console.log("Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        throw new Error("❌ Deployer account has no ETH! Fund it from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
    }

    // Deploy AssetRegistry
    console.log("\n📝 Deploying AssetRegistry...");
    const AssetRegistry = await hre.ethers.getContractFactory("AssetRegistry");

    console.log("Sending deployment transaction...");
    const assetRegistry = await AssetRegistry.deploy(deployer.address);

    console.log("Waiting for deployment confirmation...");
    await assetRegistry.waitForDeployment();

    const address = await assetRegistry.getAddress();
    console.log("✅ AssetRegistry deployed to:", address);

    // Grant CONSENSUS_ROLE to deployer (for testing)
    console.log("\n🔐 Granting CONSENSUS_ROLE...");
    const CONSENSUS_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("CONSENSUS_ROLE"));
    const tx = await assetRegistry.grantRole(CONSENSUS_ROLE, deployer.address);
    console.log("Transaction sent, waiting for confirmation...");
    await tx.wait();
    console.log("✅ CONSENSUS_ROLE granted to:", deployer.address);

    // Save deployment info
    const deploymentInfo = {
        network: "baseSepolia",
        chainId: 84532,
        assetRegistry: address,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        consensusRoleGranted: deployer.address,
        explorerUrl: `https://sepolia.basescan.org/address/${address}`
    };

    console.log("\n📝 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🔍 Verify on BaseScan:");
    console.log(`https://sepolia.basescan.org/address/${address}`);

    console.log("\n📋 Next Steps:");
    console.log("1. Update src/config/contract-addresses.ts with:", address);
    console.log("2. Update oracle config with this address");
    console.log("3. Grant CONSENSUS_ROLE to oracle wallet if different");

    return deploymentInfo;
}

main()
    .then((info) => {
        console.log("\n✅ Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error.message || error);
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        process.exit(1);
    });
