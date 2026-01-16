import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
import { MintTokens } from '../components/MintTokens';
import { MockAssetBadge } from '../components/MockAssetBadge';

interface TokenDetails {
    address: string;
    name: string;
    symbol: string;
    totalSupply: string;
    currentNAV: string;
    navPerToken: string;
    holders: number;
    assetFingerprint: string;
    description: string;
}

interface NAVHistoryPoint {
    date: string;
    nav: number;
}

const TokenDetail: React.FC = () => {
    const { address } = useParams<{ address: string }>();
    const navigate = useNavigate();
    const [token, setToken] = useState<TokenDetails | null>(null);
    const [navHistory, setNavHistory] = useState<NAVHistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyAmount, setBuyAmount] = useState('');

    useEffect(() => {
        loadTokenDetails();
    }, [address]);

    const loadTokenDetails = async () => {
        try {
            setLoading(true);

            // Mock data - in production, fetch from subgraph/backend
            const mockToken: TokenDetails = {
                address: address || '',
                name: 'DLF Cyber Hub Token',
                symbol: 'DLFCH',
                totalSupply: '10000',
                currentNAV: '100000000',
                navPerToken: '10000',
                holders: 45,
                assetFingerprint: '0x1234...5678',
                description: 'Premium commercial real estate in Gurugram Cyber Hub. Grade-A office space with multinational tenants.',
            };

            // Mock NAV history (30 days)
            const mockHistory: NAVHistoryPoint[] = [];
            const baseNAV = 9500;
            for (let i = 30; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const randomVariation = (Math.random() - 0.5) * 500;
                const nav = baseNAV + randomVariation + (30 - i) * 15;
                mockHistory.push({
                    date: date.toLocaleDateString(),
                    nav: Math.round(nav),
                });
            }

            setToken(mockToken);
            setNavHistory(mockHistory);
            setLoading(false);
        } catch (error) {
            console.error('Error loading token details:', error);
            setLoading(false);
        }
    };

    const handleBuy = () => {
        if (!buyAmount || parseFloat(buyAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // In production: check KYC, initiate payment, call mint function
        alert(`Buy request submitted for ${buyAmount} tokens! (Mock - in production this would process payment and mint tokens)`);
        setBuyAmount('');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    if (loading || !token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading token details...</div>
            </div>
        );
    }

    const navPerToken = parseFloat(token.navPerToken);
    const totalCost = parseFloat(buyAmount || '0') * navPerToken;

    const chartData = {
        labels: navHistory.map(h => h.date),
        datasets: [
            {
                label: 'NAV per Token (USD)',
                data: navHistory.map(h => h.nav),
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value: any) {
                        return '$' + value.toLocaleString();
                    },
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            x: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-gray-300 hover:text-white flex items-center gap-2"
                >
                    ← Back
                </button>

                {/* Token Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-bold mb-2">{token.name}</h1>
                        <MockAssetBadge isMock={true} size="md" />
                    </div>
                    <p className="text-gray-300">{token.symbol}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Charts & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* ... (Chart and Details remain same) ... */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h2 className="text-2xl font-bold mb-6">NAV History (30 Days)</h2>
                            <Line data={chartData} options={chartOptions} />
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h2 className="text-2xl font-bold mb-6">Asset Details</h2>
                            {/* ... details ... */}
                            <div className="space-y-4">
                                <div>
                                    <div className="text-gray-400 text-sm">Description</div>
                                    <div className="text-white">{token.description}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-gray-400 text-sm">Total Supply</div>
                                        <div className="text-white font-semibold">{token.totalSupply} tokens</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Token Holders</div>
                                        <div className="text-white font-semibold">{token.holders}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Asset Fingerprint</div>
                                        <div className="text-white font-mono text-sm">{token.assetFingerprint}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Contract Address</div>
                                        <div className="text-white font-mono text-sm">{token.address.substring(0, 10)}...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Buy Form */}
                    <div className="space-y-6">
                        {/* Current Price Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <div className="text-gray-300 text-sm mb-2">Current Price</div>
                            <div className="text-4xl font-bold mb-4">{formatCurrency(navPerToken)}</div>
                            <div className="text-green-400 text-sm">+2.1% (24h)</div>
                        </div>

                        {/* Buy Form using MintTokens */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <MintTokens
                                assetId={token.address}
                                pricePerToken={navPerToken}
                                availableTokens={100}
                                onSuccess={() => alert('Token purchase simulated!')}
                            />
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold mb-4">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Market Cap</span>
                                    <span className="font-semibold">{formatCurrency(parseFloat(token.currentNAV))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">24h Volume</span>
                                    <span className="font-semibold">$245,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Yield (APY)</span>
                                    <span className="font-semibold text-green-400">8.2%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenDetail;
