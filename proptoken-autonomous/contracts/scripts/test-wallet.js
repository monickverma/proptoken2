const hre = require("hardhat");

async function main() {
    console.log("Testing wallet connection...\n");

    console.log("Environment variables:");
    console.log("- PRIVATE_KEY exists:", !!process.env.PRIVATE_KEY);
    console.log("- PRIVATE_KEY length:", process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);
    console.log("- RPC URL:", process.env.BASE_SEPOLIA_RPC_URL || "default");

    console.log("\nGetting signers...");
    const signers = await hre.ethers.getSigners();
    console.log("Signers count:", signers.length);

    if (signers.length > 0) {
        const signer = signers[0];
        console.log("\nWallet address:", signer.address);

        const balance = await hre.ethers.provider.getBalance(signer.address);
        console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

        const network = await hre.ethers.provider.getNetwork();
        console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
    } else {
        console.log("❌ No signers found!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error.message);
        process.exit(1);
    });
