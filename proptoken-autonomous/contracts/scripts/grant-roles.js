const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🚀 Granting Roles for RWASecurityToken...\n");

    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const tokenAddress = "0x2feD68a1B753395d1BD4899438d9A37A21176cC4";

    if (!tokenAddress) throw new Error("Token address required");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Admin Wallet:", wallet.address);

    // Load ABI
    const artifactPath = path.join(__dirname, "../artifacts/contracts/tokens/RWASecurityToken.sol/RWASecurityToken.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const contract = new ethers.Contract(tokenAddress, artifact.abi, wallet);

    // Define Roles
    const AGENT_ROLE = ethers.id("AGENT_ROLE"); // keccak256("AGENT_ROLE")
    const COMPLIANCE_ROLE = ethers.id("COMPLIANCE_ROLE");

    console.log("AGENT_ROLE Hash:", AGENT_ROLE);
    console.log("COMPLIANCE_ROLE Hash:", COMPLIANCE_ROLE);

    // Grant AGENT_ROLE (likely needed for verifyInvestor)
    console.log("\n🔐 Granting AGENT_ROLE...");
    try {
        const tx = await contract.grantRole(AGENT_ROLE, wallet.address);
        console.log("Tx sent:", tx.hash);
        await tx.wait();
        console.log("✅ AGENT_ROLE granted.");
    } catch (e) {
        console.log("⚠️  Failed to grant AGENT_ROLE (maybe already granted or unauthorized):", e.message);
    }

    // Grant COMPLIANCE_ROLE
    console.log("\n🔐 Granting COMPLIANCE_ROLE...");
    try {
        const tx = await contract.grantRole(COMPLIANCE_ROLE, wallet.address);
        console.log("Tx sent:", tx.hash);
        await tx.wait();
        console.log("✅ COMPLIANCE_ROLE granted.");
    } catch (e) {
        console.log("⚠️  Failed to grant COMPLIANCE_ROLE:", e.message);
    }

    // Verify Roles
    console.log("\n🔍 Verifying Roles...");
    console.log("Has AGENT_ROLE:", await contract.hasRole(AGENT_ROLE, wallet.address));
    console.log("Has COMPLIANCE_ROLE:", await contract.hasRole(COMPLIANCE_ROLE, wallet.address));
    console.log("Has MINTER_ROLE:", await contract.hasRole(await contract.MINTER_ROLE(), wallet.address));

    console.log("\n🎉 Role setup complete.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
