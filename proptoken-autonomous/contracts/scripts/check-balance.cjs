const hre = require("hardhat");

async function main() {
    console.log("Checking connection to Base Sepolia...");
    try {
        const [signer] = await hre.ethers.getSigners();
        console.log("Signer address:", signer.address);
        const balance = await hre.ethers.provider.getBalance(signer.address);
        console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

        if (balance == 0n) {
            console.error("CRITICAL: Balance is 0. Please fund the wallet.");
        } else {
            console.log("Funds detected. Ready to deploy.");
        }
    } catch (e) {
        console.error("Connection failed:", e.message);
    }
}

main().catch(console.error);
