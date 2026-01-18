const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying AssetRegistry to Base Sepolia (Alternative Method)...\n");

    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deployer address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH\n");

    // Load artifact
    const artifactPath = path.join(__dirname, "../artifacts/contracts/AssetRegistry.sol/AssetRegistry.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    console.log("📝 Preparing deployment transaction...");

    // Create contract factory
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

    // Get deployment transaction
    const deployTx = await factory.getDeployTransaction(wallet.address);

    console.log("Sending deployment transaction...");
    const txResponse = await wallet.sendTransaction(deployTx);

    console.log("Transaction hash:", txResponse.hash);
    console.log("Waiting for confirmation...");

    const receipt = await txResponse.wait();
    const contractAddress = receipt.contractAddress;

    console.log("✅ AssetRegistry deployed to:", contractAddress);

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

    // Grant CONSENSUS_ROLE
    console.log("\n🔐 Granting CONSENSUS_ROLE...");
    const CONSENSUS_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CONSENSUS_ROLE"));
    const grantTx = await contract.grantRole(CONSENSUS_ROLE, wallet.address);
    console.log("Transaction sent, waiting for confirmation...");
    await grantTx.wait();
    console.log("✅ CONSENSUS_ROLE granted to:", wallet.address);

    // Save deployment info
    const deploymentInfo = {
        network: "baseSepolia",
        chainId: 84532,
        assetRegistry: contractAddress,
        deployer: wallet.address,
        deploymentTxHash: txResponse.hash,
        timestamp: new Date().toISOString(),
        explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}`
    };

    console.log("\n📝 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🔍 View on BaseScan:");
    console.log(deploymentInfo.explorerUrl);

    console.log("\n✅ Deployment completed successfully!");

    // Save to file
    fs.writeFileSync(
        path.join(__dirname, "../deployment-info.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("Deployment info saved to deployment-info.json");

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
