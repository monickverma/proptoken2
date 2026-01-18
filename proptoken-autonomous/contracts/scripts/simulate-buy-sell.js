const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🚀 Starting Buy/Sell Simulation on Base Sepolia...\n");

    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const tokenAddress = "0x2feD68a1B753395d1BD4899438d9A37A21176cC4";

    if (!tokenAddress) throw new Error("Token address required");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Actor: Backend/Admin Wallet");
    console.log("Address:", wallet.address);
    console.log("Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH\n");

    // Load ABI
    const artifactPath = path.join(__dirname, "../artifacts/contracts/tokens/RWASecurityToken.sol/RWASecurityToken.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const contract = new ethers.Contract(tokenAddress, artifact.abi, wallet);

    console.log("📝 Token Details:");
    console.log("- Name:", await contract.name());
    console.log("- Symbol:", await contract.symbol());
    console.log("- Total Supply:", ethers.formatUnits(await contract.totalSupply(), 18));
    console.log("- Minter Role Admin:", await contract.getRoleAdmin(await contract.MINTER_ROLE()));
    console.log("- Is Minter?", await contract.hasRole(await contract.MINTER_ROLE(), wallet.address) ? "Yes" : "No");

    // Flow:
    // 1. Verify Investor (Add to whitelist)
    // 2. Mint Tokens (Simulate "Buy")
    // 3. Check Balance (Confirm "Buy")
    // 4. (Optional) Transfer/Burn (Simulate "Sell") - Requires another wallet or burn

    // 1. Whitelist / Verification
    console.log("\n1️⃣  Verifying Investor (Compliance Check)...");
    try {
        const isVerified = await contract.isInvestor(wallet.address);
        if (isVerified) {
            console.log("✅ Wallet already verified as investor.");
        } else {
            console.log("⏳ Not verified. Sending verification tx...");
            // Assuming the contract permits the deployer/admin to force verify for testing
            // or we call `verifyInvestor`.
            // Note: In a real IdentityRegistry system, this would be a separate contract call or claim.
            // Let's check if `verifyInvestor` exists in the contract we saw earlier.
            // Yes: `verifyInvestor(address investor, bool verified)` 

            const verifyTx = await contract.verifyInvestor(wallet.address, true);
            console.log("Tx sent:", verifyTx.hash);
            await verifyTx.wait();
            console.log("✅ Investor verified.");
        }
    } catch (e) {
        console.error("❌ Verification failed:", e.message);
    }

    // 2. Buy (Mint)
    console.log("\n2️⃣  Simulating BUY (Minting Tokens)...");
    const mintAmount = ethers.parseUnits("100", 18); // 100 Tokens
    try {
        console.log(`⏳ Minting 100 PRWA to ${wallet.address}...`);
        const mintTx = await contract.mint(wallet.address, mintAmount);
        console.log("Tx sent:", mintTx.hash);
        const receipt = await mintTx.wait();
        console.log("✅ Mint confirmed. Block:", receipt.blockNumber);
        console.log("🔗 https://sepolia.basescan.org/tx/" + mintTx.hash);
    } catch (e) {
        console.error("❌ Minting failed:", e.message);
        // It might fail if we don't have MINTER_ROLE.
        // But we granted it in constructor? Let's check Step 397:
        // `_grantRole(MINTER_ROLE, msg.sender);` -> Yes, it is in constructor.
    }

    // 3. Confirm Balance
    console.log("\n3️⃣  Confirming Portfolio Balance...");
    const balance = await contract.balanceOf(wallet.address);
    console.log("💰 Current Balance:", ethers.formatUnits(balance, 18), "PRWA");

    if (balance >= mintAmount) {
        console.log("✅ BUY SUCCESSFUL: Tokens received.");
    } else {
        console.log("❌ BUY FAILED: Balance mismatch.");
    }

    // 4. Sell (Burn for simplicity, or Transfer if we had a 2nd wallet)
    // Simulating a "Sell" back to the platform usually involves a transfer to treasury or burning.
    console.log("\n4️⃣  Simulating SELL (Burning Tokens)...");
    const sellAmount = ethers.parseUnits("50", 18);
    try {
        console.log(`⏳ Selling (burning) 50 PRWA...`);
        // Check if burn is exposed. ERC20Burnable?
        // RWASecurityToken.sol inherits ERC20, usually need to check if burn is public.
        // If not, we skip this or just transfer to 0x0 (if allowed).
        // Assuming standard OZ burnable or custom redeem.
        // Let's try `transfer(address(0), amount)` if burn is not there, but standard ERC20 prevents transfer to 0x0.
        // Let's try a direct `burn` if it exists.
        if (contract.burn) {
            const burnTx = await contract.burn(sellAmount);
            await burnTx.wait();
            console.log("✅ SELL SUCCESSFUL: Tokens burned.");
        } else {
            console.log("⚠️  Burn function not found. Skipping Sell simulation.");
        }
    } catch (e) {
        console.log("⚠️  Sell/Burn simulation skipped/failed:", e.message);
    }

    const finalBalance = await contract.balanceOf(wallet.address);
    console.log("💰 Final Balance:", ethers.formatUnits(finalBalance, 18), "PRWA");

    console.log("\n🎉 Simulation Complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
