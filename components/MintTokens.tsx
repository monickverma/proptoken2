import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MintTokensProps {
    assetId: string;
    pricePerToken: number;
    availableTokens: number;
    onSuccess?: () => void;
}

export const MintTokens: React.FC<MintTokensProps> = ({ assetId, pricePerToken, availableTokens, onSuccess }) => {
    const { wallet, updateBalance } = useAuth();
    const [amount, setAmount] = useState<number>(1);
    const [status, setStatus] = useState<'IDLE' | 'MINTING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [txHash, setTxHash] = useState<string>('');

    const totalCost = amount * pricePerToken;
    const canAfford = true; // wallet.balance >= totalCost; // Mock: always afford for demo

    const handleMint = async () => {
        if (!canAfford) return;

        setStatus('MINTING');

        // Simulate network delay
        setTimeout(() => {
            // Mock Transaction
            const mockHash = `0x${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}...`;
            setTxHash(mockHash);
            setStatus('SUCCESS');

            // Update local wallet mock state
            if (updateBalance) {
                // In a real app this would be event driven
                // updateBalance(totalCost); 
            }

            if (onSuccess) onSuccess();
        }, 2500);
    };

    if (status === 'SUCCESS') {
        return (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Minting Successful!</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">TX: {txHash}</p>
                <button
                    onClick={() => setStatus('IDLE')}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                >
                    Buy More
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Mint Tokens</h3>
                <span className="text-xs font-mono text-slate-400">Bal: ₹{wallet.balance.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quantity</label>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        min="1"
                        max={availableTokens}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-lg px-4 py-2 font-black text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 transition-all"
                    />
                    <div className="text-right shrink-0">
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">₹{totalCost.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-slate-400">Total Cost</div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleMint}
                disabled={status === 'MINTING' || !canAfford}
                className={`
          w-full py-3 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all
          ${canAfford
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
        `}
            >
                {status === 'MINTING' ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Minting on Chain...
                    </>
                ) : (
                    `Mint ${amount} Tokens`
                )}
            </button>

            {!canAfford && (
                <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Insufficient Mock Funds</span>
                </div>
            )}
        </div>
    );
};
