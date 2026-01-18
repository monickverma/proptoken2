const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("Testing contract deployment syntax...\n");

    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Wallet:", wallet.address);
    console.log("Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH\n");

    // Load artifact
    const artifactPath = path.join(__dirname, "../artifacts/contracts/AssetRegistry.sol/AssetRegistry.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    console.log("Creating contract factory...");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

    console.log("\nTesting deployment with different syntaxes:");

    try {
        console.log("\n1. Testing: factory.deploy(wallet.address)");
        const tx1 = await factory.getDeployTransaction(wallet.address);
        console.log("✅ getDeployTransaction worked!");
        console.log("Transaction data length:", tx1.data.length);
    } catch (e) {
        console.log("❌ Failed:", e.message);
    }

    try {
        console.log("\n2. Testing: factory.deploy(wallet.address, {})");
        const tx2 = await factory.getDeployTransaction(wallet.address, {});
        console.log("✅ getDeployTransaction worked!");
    } catch (e) {
        console.log("❌ Failed:", e.message);
    }

    console.log("\n3. Attempting actual deployment...");
    try {
        const contract = await factory.deploy(wallet.address);
        console.log("Deployment transaction sent!");
        console.log("Waiting for confirmation...");
        await contract.waitForDeployment();
        console.log("✅ Deployed to:", await contract.getAddress());
    } catch (e) {
        console.log("❌ Deployment failed:", e.message);
        console.log("Error code:", e.code);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
