const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying AssetRegistry to Base Sepolia...\n");

    // Setup provider and wallet
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    if (!rpcUrl || !privateKey) {
        throw new Error("Missing BASE_SEPOLIA_RPC_URL or PRIVATE_KEY in .env");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deployer address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH\n");

    if (balance === 0n) {
        throw new Error("Deployer has no ETH!");
    }

    // Load compiled contract
    const artifactPath = path.join(__dirname, "../artifacts/contracts/AssetRegistry.sol/AssetRegistry.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    console.log("📝 Deploying AssetRegistry contract...");

    // Create contract factory
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

    // Deploy contract with explicit gas limit
    console.log("Sending deployment transaction...");
    const contract = await factory.deploy(wallet.address, {
        gasLimit: 3000000
    });

    console.log("Waiting for deployment confirmation...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ AssetRegistry deployed to:", address);

    // Grant CONSENSUS_ROLE
    console.log("\n🔐 Granting CONSENSUS_ROLE...");
    const CONSENSUS_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CONSENSUS_ROLE"));
    const tx = await contract.grantRole(CONSENSUS_ROLE, wallet.address);
    console.log("Transaction sent, waiting for confirmation...");
    await tx.wait();
    console.log("✅ CONSENSUS_ROLE granted to:", wallet.address);

    // Save deployment info
    const deploymentInfo = {
        network: "baseSepolia",
        chainId: 84532,
        assetRegistry: address,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
        explorerUrl: `https://sepolia.basescan.org/address/${address}`
    };

    console.log("\n📝 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🔍 View on BaseScan:");
    console.log(deploymentInfo.explorerUrl);

    console.log("\n✅ Deployment completed successfully!");

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
