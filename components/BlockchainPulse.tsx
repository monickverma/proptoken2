import React, { useState, useEffect } from 'react';
import { useWatchContractEvent, useBlockNumber } from 'wagmi';
import { Activity, ExternalLink, Box, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ABI for AssetRegistry (Partial)
const assetRegistryAbi = [
    {
        "type": "event",
        "name": "AssetRegistered",
        "inputs": [
            { "name": "fingerprint", "type": "bytes32", "indexed": true },
            { "name": "owner", "type": "address", "indexed": true },
            { "name": "eligible", "type": "bool", "indexed": false },
            { "name": "isMock", "type": "bool", "indexed": false },
            { "name": "timestamp", "type": "uint256", "indexed": false }
        ],
        "anonymous": false
    }
] as const;

// Replace with your deployed contract address
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

interface EventLog {
    id: string;
    type: string;
    hash: string;
    timestamp: number;
    details: string;
    isMock: boolean;
}

export const BlockchainPulse: React.FC = () => {
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const [events, setEvents] = useState<EventLog[]>([]);

    // Listen for AssetRegistered events
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: assetRegistryAbi,
        eventName: 'AssetRegistered',
        onLogs(logs) {
            const newEvents = logs.map((log: any) => ({
                id: log.transactionHash + log.logIndex,
                type: 'Asset Registration',
                hash: log.transactionHash,
                timestamp: Date.now(),
                details: `Asset ${log.args.fingerprint?.slice(0, 10)}... registered`,
                isMock: log.args.isMock || false
            }));
            setEvents(prev => [...newEvents, ...prev].slice(0, 5));
        },
    });

    return (
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        <Activity className="w-4 h-4 text-emerald-600 relative z-10" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Base Sepolia Live Feed
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Box className="w-3 h-3" />
                    <span>BLOCK: #{blockNumber?.toString() || 'Loading...'}</span>
                </div>
            </div>

            {/* Feed */}
            <div className="relative h-48 overflow-hidden bg-slate-50 dark:bg-slate-900">
                <div className="absolute inset-0 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {events.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic opacity-60">
                                <Box className="w-8 h-8 mb-2 opacity-20" />
                                Waiting for transactions...
                            </div>
                        ) : (
                            events.map((event) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    exit={{ opacity: 0, x: 20, height: 0 }}
                                    className={`
                    relative pl-4 py-2 border-l-2 
                    ${event.isMock ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10' : 'border-emerald-500 bg-white dark:bg-slate-800'}
                  `}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                                {event.isMock && <span className="text-[9px] bg-amber-200 text-amber-800 px-1 rounded">TEST</span>}
                                                {event.type}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{event.hash.slice(0, 10)}...{event.hash.slice(-8)}</p>
                                        </div>
                                        <a
                                            href={`https://sepolia.basescan.org/tx/${event.hash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-indigo-500 hover:text-indigo-600 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Confirmed on-chain</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
