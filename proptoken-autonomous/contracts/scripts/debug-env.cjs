const hre = require("hardhat");

async function main() {
    console.log("Debug Env Vars:");
    console.log("PRIVATE_KEY present:", process.env.PRIVATE_KEY ? "YES (" + process.env.PRIVATE_KEY.length + " chars)" : "NO");
    console.log("BASE_SEPOLIA_RPC_URL:", process.env.BASE_SEPOLIA_RPC_URL || "Using Default");

    const [signer] = await hre.ethers.getSigners();
    if (!signer) {
        console.error("No signers found! Check PRIVATE_KEY in .env");
    } else {
        console.log("Signer found:", signer.address);
    }
}

main().catch(console.error);
