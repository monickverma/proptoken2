import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const AssetRegistry = await ethers.getContractFactory("AssetRegistry");
    // Pass deployer address as admin
    const registry = await AssetRegistry.deploy(deployer.address);

    await registry.waitForDeployment();

    const address = await registry.getAddress();
    console.log("AssetRegistry deployed to:", address);

    // Grant CONSENSUS_ROLE to the deployer (for backend testing)
    // In production, this would be the address of the Go Oracle wallet
    const CONSENSUS_ROLE = await registry.CONSENSUS_ROLE();
    const grantTx = await registry.grantRole(CONSENSUS_ROLE, deployer.address);
    await grantTx.wait();

    console.log("Granted CONSENSUS_ROLE to:", deployer.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
