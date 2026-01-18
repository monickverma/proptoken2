import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';

// Minimal ABI for RWASecurityToken
const RWASecurityTokenABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "investor", "type": "address" }
        ],
        "name": "verifiedInvestors",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "investor", "type": "address" }
        ],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export function useTokenMinting(tokenAddress: `0x${string}`) {
    const { address } = useAccount();
    const [error, setError] = useState<string | null>(null);

    // Check verification status
    const { data: isVerified } = useReadContract({
        address: tokenAddress,
        abi: RWASecurityTokenABI,
        functionName: 'verifiedInvestors',
        args: [address || '0x0000000000000000000000000000000000000000'],
        query: {
            enabled: !!address && !!tokenAddress,
        }
    });

    // Check balance
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: tokenAddress,
        abi: RWASecurityTokenABI,
        functionName: 'balanceOf',
        args: [address || '0x0000000000000000000000000000000000000000'],
        query: {
            enabled: !!address && !!tokenAddress,
        }
    });

    const { writeContract, data: hash, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const mint = async (amount: string) => {
        setError(null);
        if (!address) {
            setError('Please connect your wallet first.');
            return;
        }
        if (!isVerified) {
            // Ideally we would trigger verification here, but for now we warn
            // In mock mode, the backend should have verified us or we need a way to self-verify?
            // Actually, the Deployment script verified the Deployer.
            // If user is different, they might fail.
            // But for "Mock" flow, we assume open access or pre-verified.
            // Let's proceed and if it reverts, it reverts.
            console.warn('User not verified on-chain. Transaction may fail.');
        }

        try {
            writeContract({
                address: tokenAddress,
                abi: RWASecurityTokenABI,
                functionName: 'mint',
                args: [address, parseEther(amount)],
            });
        } catch (err: any) {
            setError(err.message || 'Minting failed');
        }
    };

    const burn = async (amount: string) => {
        setError(null);
        if (!address) {
            setError('Please connect wallet');
            return;
        }

        try {
            writeContract({
                address: tokenAddress,
                abi: RWASecurityTokenABI,
                functionName: 'burn',
                args: [parseEther(amount)],
            });
        } catch (err: any) {
            setError(err.message || 'Burning failed');
        }
    };

    return {
        mint,
        burn,
        balance,
        isVerified,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: error || (writeError ? writeError.message : null),
        refetchBalance
    };
}
