/// <reference types="vite/client" />
import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Public WalletConnect (Reown) project ID from https://cloud.reown.com.
// Without it, only browser-extension wallets (e.g. MetaMask) are offered.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// Read RPC for Base Sepolia; defaults to the public endpoint.
const transports = { [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || undefined) };

const config = projectId
    ? getDefaultConfig({ appName: 'PropToken', projectId, chains: [baseSepolia], transports, ssr: false })
    : createConfig({
        chains: [baseSepolia],
        transports,
        connectors: connectorsForWallets(
            [{ groupName: 'Browser wallets', wallets: [injectedWallet] }],
            { appName: 'PropToken', projectId: 'none' },
        ),
    });

const queryClient = new QueryClient();

interface WalletProviderProps {
    children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
