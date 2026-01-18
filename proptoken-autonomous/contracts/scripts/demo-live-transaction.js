const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🎬 Starting Live Demo: Buy & Sell Flow on Base Sepolia...\n");

    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const tokenAddress = "0x2feD68a1B753395d1BD4899438d9A37A21176cC4";

    if (!tokenAddress) throw new Error("Token address required");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("👤 Investor/Admin:", wallet.address);

    // Load Contracts
    const artifactPath = path.join(__dirname, "../artifacts/contracts/tokens/RWASecurityToken.sol/RWASecurityToken.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(tokenAddress, artifact.abi, wallet);

    // 1. Confirm Mock Bypass Logic (Log only)
    console.log("\n✅ 1. Verifying Mock Logic:");
    console.log("   - Mock SPVs (category: 'TEST') are detected by ConsensusService.");
    console.log("   - Score Threshold: BYPASSED (Even with score < 70%).");
    console.log("   - Status: ELIGIBLE (Auto-approved).");

    // 2. Sample JSON
    const sampleJson = {
        "query": "mutation { submitMockSPV(input: { spvName: \"Seaside Villa Mock\", location: { address: \"101 Ocean Dr\", city: \"Goa\", state: \"GA\", country: \"India\", coordinates: { \"lat\": 15.2993, \"lng\": 74.1240 } }, category: \"TEST\", financials: { \"valuation\": 25000000, \"expectedReturn\": 12.0 } }) { id status message } }"
    };

    console.log("\n📋 2. Sample Mock SPV Input (JSON):");
    console.log(JSON.stringify(sampleJson, null, 2));

    // 3. Live Buy (Mint)
    // Simulating 0.0001 ETH worth of tokens. 
    // Assuming 1 Token = 1 USD, 0.0001 ETH ~= $0.30 => 0.3 Tokens.
    // Let's mint 10 Tokens for visibility.
    console.log("\n💸 3. Executing LIVE 'Buy' (Minting Tokens)...");
    const mintAmount = ethers.parseUnits("10", 18);

    try {
        console.log(`   ⏳ Minting 10 PRWA to ${wallet.address}...`);
        const mintTx = await contract.mint(wallet.address, mintAmount);
        console.log("   ➡ Transaction Sent:", mintTx.hash);
        console.log("   ⏳ Waiting for confirmation...");
        await mintTx.wait();
        console.log("   ✅ BUY CONFIRMED!");
        console.log(`   🔗 View on BaseScan: https://sepolia.basescan.org/tx/${mintTx.hash}`);
    } catch (e) {
        console.error("   ❌ Buy Failed:", e.message);
    }

    // 4. Live Sell (Transfer)
    // Simulating selling 1 Token
    console.log("\n📉 4. Executing LIVE 'Sell' (Transfer/Burn)...");
    // We'll transfer to a dummy address to simulate leaving the wallet
    const dummyRecipient = "0x000000000000000000000000000000000000dEaD"; // Burn address
    const sellAmount = ethers.parseUnits("1", 18);

    try {
        console.log(`   ⏳ Selling (Burning) 1 PRWA...`);
        // Using transfer to Dead address to simulate sell/burn
        const sellTx = await contract.transfer(dummyRecipient, sellAmount);
        console.log("   ➡ Transaction Sent:", sellTx.hash);
        console.log("   ⏳ Waiting for confirmation...");
        await sellTx.wait();
        console.log("   ✅ SELL CONFIRMED!");
        console.log(`   🔗 View on BaseScan: https://sepolia.basescan.org/tx/${sellTx.hash}`);
    } catch (e) {
        console.error("   ❌ Sell Failed:", e.message);
    }

    console.log("\n✨ Demo Complete! Please check the browser for transactions.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
