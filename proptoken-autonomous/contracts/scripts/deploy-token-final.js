const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying RWASecurityToken to Base Sepolia...\n");

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

    // Load AssetRegistry address
    const deploymentInfoPath = path.join(__dirname, "../deployment-info.json");
    let assetRegistryAddress;

    if (fs.existsSync(deploymentInfoPath)) {
        const info = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
        if (info.assetRegistry) {
            assetRegistryAddress = info.assetRegistry;
            console.log("Found AssetRegistry at:", assetRegistryAddress);
        }
    }

    if (!assetRegistryAddress) {
        console.log("⚠️  AssetRegistry address not found in deployment-info.json. Using fallback or previous deployment.");
        assetRegistryAddress = "0x61bfab5D232429512c4D183a05Ec22F7e64B1562"; // From previous step
    }

    // Load compiled contract
    const artifactPath = path.join(__dirname, "../artifacts/contracts/tokens/RWASecurityToken.sol/RWASecurityToken.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    console.log("📝 Preparing deployment...");

    // Token Constructor Args
    const tokenName = "PropToken RWA Test";
    const tokenSymbol = "PRWA";
    const _assetRegistry = assetRegistryAddress;
    // Use a dummy fingerprint for the token template or a specific one
    const _assetFingerprint = ethers.keccak256(ethers.toUtf8Bytes("MOCK-ASSET-TEMPLATE"));
    const _assetDescription = "Test RWA Token backed by Mock Property";
    const _totalAssetValue = ethers.parseUnits("1000000", 18); // 1M valuation

    console.log("Constructor Args:");
    console.log("- Name:", tokenName);
    console.log("- Symbol:", tokenSymbol);
    console.log("- Registry:", _assetRegistry);
    console.log("- Fingerprint:", _assetFingerprint);
    console.log("- Value:", _totalAssetValue.toString());

    // Manually encode constructor arguments
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const encodedArgs = abiCoder.encode(
        ["string", "string", "address", "bytes32", "string", "uint256"],
        [tokenName, tokenSymbol, _assetRegistry, _assetFingerprint, _assetDescription, _totalAssetValue]
    );

    const encodedArgsHex = encodedArgs.slice(2);
    const deploymentData = artifact.bytecode + encodedArgsHex;

    console.log("\nSending deployment transaction...");

    const deployTx = {
        data: deploymentData,
        gasLimit: 5000000
    };

    const txResponse = await wallet.sendTransaction(deployTx);

    console.log("Transaction hash:", txResponse.hash);
    console.log("Waiting for confirmation...");

    const receipt = await txResponse.wait();
    const contractAddress = receipt.contractAddress;

    console.log("✅ RWASecurityToken deployed to:", contractAddress);

    const deploymentInfo = {
        network: "baseSepolia",
        chainId: 84532,
        rwaSecurityToken: contractAddress,
        tokenName,
        tokenSymbol,
        deployer: wallet.address,
        deploymentTxHash: txResponse.hash,
        timestamp: new Date().toISOString(),
        explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}`
    };

    console.log("\n📝 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Update deployment-info.json
    try {
        let existingInfo = {};
        if (fs.existsSync(deploymentInfoPath)) {
            existingInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
        }
        const updatedInfo = { ...existingInfo, ...deploymentInfo };
        fs.writeFileSync(deploymentInfoPath, JSON.stringify(updatedInfo, null, 2));
        console.log("Saved to deployment-info.json");
    } catch (e) {
        console.error("Failed to save info:", e);
    }

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
