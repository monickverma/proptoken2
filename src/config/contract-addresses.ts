// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
    baseSepolia: {
        chainId: 84532,
        AssetRegistry: "0x61bfab5D232429512c4D183a05Ec22F7e64B1562", // ✅ Deployed 2026-01-18
        TokenFactory: "0x0000000000000000000000000000000000000000",  // To be deployed
        OracleAttestationVerifier: "0x0000000000000000000000000000000000000000", // To be deployed
        RWASecurityToken: "0x2feD68a1B753395d1BD4899438d9A37A21176cC4" // ✅ Deployed 2026-01-18
    },
    foundry: {
        chainId: 31337,
        AssetRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        TokenFactory: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        OracleAttestationVerifier: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        RWASecurityToken: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    }
} as const;

export type NetworkName = keyof typeof CONTRACT_ADDRESSES;

export function getContractAddress(
    network: NetworkName,
    contractName: keyof typeof CONTRACT_ADDRESSES.baseSepolia
): string {
    const address = CONTRACT_ADDRESSES[network][contractName];
    if (typeof address !== 'string') {
        throw new Error(`Invalid contract name: ${String(contractName)}`);
    }
    if (address === "0x0000000000000000000000000000000000000000") {
        console.warn(`⚠️  Contract ${contractName} not deployed on ${network} yet`);
    }
    return address;
}

// Helper to get current network from chain ID
export function getNetworkFromChainId(chainId: number): NetworkName | null {
    for (const [network, config] of Object.entries(CONTRACT_ADDRESSES)) {
        if (config.chainId === chainId) {
            return network as NetworkName;
        }
    }
    return null;
}

// Helper to get BaseScan URL for transaction
export function getExplorerUrl(chainId: number, txHash: string): string {
    if (chainId === 84532) {
        return `https://sepolia.basescan.org/tx/${txHash}`;
    }
    return `https://etherscan.io/tx/${txHash}`;
}

// Helper to get BaseScan URL for address
export function getAddressExplorerUrl(chainId: number, address: string): string {
    if (chainId === 84532) {
        return `https://sepolia.basescan.org/address/${address}`;
    }
    return `https://etherscan.io/address/${address}`;
}
