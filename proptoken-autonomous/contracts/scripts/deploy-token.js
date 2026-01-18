const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying RWASecurityToken to Base Sepolia...\n");

    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deployer address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH\n");

    // Load compiled contract
    const artifactPath = path.join(__dirname, "../artifacts/contracts/tokens/RWASecurityToken.sol/RWASecurityToken.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    console.log("📝 Deploying RWASecurityToken...");

    // Token details
    const tokenName = "PropToken RWA Test";
    const tokenSymbol = "PRWA";
    const decimals = 18;

    // Manually encode constructor arguments
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const encodedArgs = abiCoder.encode(
        ["string", "string", "uint8", "address"],
        [tokenName, tokenSymbol, decimals, wallet.address]
    );

    const encodedArgsHex = encodedArgs.slice(2);
    const deploymentData = artifact.bytecode + encodedArgsHex;

    console.log("Token Name:", tokenName);
    console.log("Token Symbol:", tokenSymbol);
    console.log("Decimals:", decimals);
    console.log("Admin:", wallet.address);
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

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

    // Grant MINTER_ROLE to deployer
    console.log("\n🔐 Granting MINTER_ROLE...");
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const mintTx = await contract.grantRole(MINTER_ROLE, wallet.address);
    await mintTx.wait();
    console.log("✅ MINTER_ROLE granted to:", wallet.address);

    // Verify deployer as investor (for testing)
    console.log("\n👤 Verifying deployer as investor...");
    const verifyTx = await contract.verifyInvestor(wallet.address);
    await verifyTx.wait();
    console.log("✅ Deployer verified as investor");

    // Save deployment info
    const deploymentInfo = {
        network: "baseSepolia",
        chainId: 84532,
        rwaSecurityToken: contractAddress,
        tokenName,
        tokenSymbol,
        decimals,
        deployer: wallet.address,
        deploymentTxHash: txResponse.hash,
        timestamp: new Date().toISOString(),
        explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}`,
        transactionUrl: `https://sepolia.basescan.org/tx/${txResponse.hash}`
    };

    console.log("\n📝 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🔍 View on BaseScan:");
    console.log("Contract:", deploymentInfo.explorerUrl);
    console.log("Transaction:", deploymentInfo.transactionUrl);

    console.log("\n✅ RWASecurityToken deployment completed!");

    // Save to file
    const existingDeployment = JSON.parse(fs.readFileSync(
        path.join(__dirname, "../deployment-info.json"),
        "utf8"
    ));

    const updatedDeployment = {
        ...existingDeployment,
        rwaSecurityToken: contractAddress,
        tokenName,
        tokenSymbol,
        tokenDeploymentTx: txResponse.hash
    };

    fs.writeFileSync(
        path.join(__dirname, "../deployment-info.json"),
        JSON.stringify(updatedDeployment, null, 2)
    );
    console.log("\n💾 Deployment info updated in deployment-info.json");

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error.message || error);
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        process.exit(1);
    });
