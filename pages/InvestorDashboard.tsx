import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TokenHolding {
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    balance: string;
    navPerToken: string;
    totalValue: number;
}

const InvestorDashboard: React.FC = () => {
    const { user, wallet } = useAuth();
    const navigate = useNavigate();
    const [holdings, setHoldings] = useState<TokenHolding[]>([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !wallet) {
            navigate('/signin');
            return;
        }
        loadPortfolio();
    }, [user, wallet]);

    const loadPortfolio = async () => {
        try {
            setLoading(true);

            // Mock data for demonstration
            // In production, this would fetch from The Graph or backend API
            const mockHoldings: TokenHolding[] = [
                {
                    tokenAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                    tokenName: 'DLF Cyber Hub Token',
                    tokenSymbol: 'DLFCH',
                    balance: '100',
                    navPerToken: '10000',
                    totalValue: 1000000,
                },
                {
                    tokenAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                    tokenName: 'One Horizon Token',
                    tokenSymbol: 'OHC',
                    balance: '50',
                    navPerToken: '15000',
                    totalValue: 750000,
                },
            ];

            setHoldings(mockHoldings);

            const total = mockHoldings.reduce((sum, h) => sum + h.totalValue, 0);
            setTotalPortfolioValue(total);

            setLoading(false);
        } catch (error) {
            console.error('Error loading portfolio:', error);
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading portfolio...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Investor Dashboard</h1>
                    <p className="text-gray-300">Welcome back, {user?.email || (wallet?.address ? wallet.address.substring(0, 10) + '...' : 'User')}</p>
                </div>

                {/* Portfolio Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="text-gray-300 text-sm mb-2">Total Portfolio Value</div>
                        <div className="text-3xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
                        <div className="text-green-400 text-sm mt-2">+2.4% (24h)</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="text-gray-300 text-sm mb-2">Assets Held</div>
                        <div className="text-3xl font-bold">{holdings.length}</div>
                        <div className="text-gray-400 text-sm mt-2">Across {holdings.length} tokens</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="text-gray-300 text-sm mb-2">KYC Status</div>
                        <div className="text-3xl font-bold text-green-400">✓ Verified</div>
                        <div className="text-gray-400 text-sm mt-2">Eligible to trade</div>
                    </div>
                </div>

                {/* Holdings Table */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                    <h2 className="text-2xl font-bold mb-6">Your Holdings</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="text-left py-3 px-4">Asset</th>
                                    <th className="text-right py-3 px-4">Balance</th>
                                    <th className="text-right py-3 px-4">NAV per Token</th>
                                    <th className="text-right py-3 px-4">Total Value</th>
                                    <th className="text-right py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.map((holding, index) => (
                                    <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="font-semibold">{holding.tokenName}</div>
                                                <div className="text-sm text-gray-400">{holding.tokenSymbol}</div>
                                            </div>
                                        </td>
                                        <td className="text-right py-4 px-4">{holding.balance}</td>
                                        <td className="text-right py-4 px-4">
                                            {formatCurrency(parseFloat(holding.navPerToken))}
                                        </td>
                                        <td className="text-right py-4 px-4 font-semibold">
                                            {formatCurrency(holding.totalValue)}
                                        </td>
                                        <td className="text-right py-4 px-4">
                                            <button
                                                onClick={() => navigate(`/market/${holding.tokenAddress}`)}
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                                            >
                                                Trade
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-white/10">
                            <div>
                                <div className="font-semibold">Purchased DLFCH</div>
                                <div className="text-sm text-gray-400">2 days ago</div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">+50 tokens</div>
                                <div className="text-sm text-gray-400">$500,000</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-white/10">
                            <div>
                                <div className="font-semibold">NAV Update - DLFCH</div>
                                <div className="text-sm text-gray-400">5 days ago</div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-green-400">+2.1%</div>
                                <div className="text-sm text-gray-400">$9,800 → $10,000</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-semibold">Purchased OHC</div>
                                <div className="text-sm text-gray-400">1 week ago</div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">+50 tokens</div>
                                <div className="text-sm text-gray-400">$750,000</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestorDashboard;
