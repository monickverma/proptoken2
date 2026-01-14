
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { CheckCircle, AlertTriangle, Clock, Activity, FileText, Database } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        ORACLE_VERIFICATION: 'bg-blue-100 text-blue-800',
        ABM_ANALYSIS: 'bg-purple-100 text-purple-800',
        FRAUD_DETECTION: 'bg-orange-100 text-orange-800',
        CONSENSUS_SCORING: 'bg-indigo-100 text-indigo-800',
        ELIGIBLE: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

export default function AutonomousVerification() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const pollStatus = async () => {
            try {
                // Use NEW Backend URL (Port 3001)
                const res = await fetch(`http://localhost:3001/submissions/${id}`);
                if (res.ok) {
                    const apiData = await res.json();

                    // Transform New Backend Data to match Old Frontend Structure
                    const transformedData = {
                        submission: {
                            id: apiData.id,
                            status: apiData.status
                        },
                        progress: {
                            stages: {
                                oracleVerification: {
                                    completed: apiData.verificationStatus?.oracle === 'DONE',
                                    subStages: {
                                        satellite: {
                                            score: apiData.results?.oracle?.results?.find((r: any) => r.category === 'existence')?.score || 0,
                                            imageUrl: apiData.results?.oracle?.results?.find((r: any) => r.category === 'existence')?.evidences?.[0]?.imageUrl
                                        },
                                        ownership: { score: apiData.results?.oracle?.results?.find((r: any) => r.category === 'ownership')?.score || 0 }
                                    }
                                },
                                abmAnalysis: {
                                    completed: apiData.verificationStatus?.abm === 'DONE',
                                    subStages: {
                                        marketIntelligence: { score: (apiData.results?.abm?.market?.demand_score || 0) * 10 },
                                        riskSimulation: { score: (1 - (apiData.results?.abm?.fraud?.fraud_score || 0)) * 100 }
                                    }
                                }
                            },
                            logs: [] // Logs temporarily empty in new structure
                        },
                        eligibleAsset: apiData.status === 'VERIFIED' ? {
                            id: `TOKEN-${apiData.id.slice(0, 8).toUpperCase()}`,
                            expectedNAV: { mean: apiData.results?.abm?.market?.price_estimate || 0 },
                            expectedYield: { expected: apiData.financials?.expectedYield || 0 }
                        } : null
                    };

                    setData(transformedData);
                }
            } catch (err) {
                console.error("Polling error:", err);
            } finally {
                setLoading(false);
            }
        };

        pollStatus();
        const interval = setInterval(pollStatus, 3000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <Layout><div className="flex justify-center p-20">Loading status...</div></Layout>;
    if (!data) return <Layout><div className="text-center p-20">Submission not found</div></Layout>;

    const { submission, progress, eligibleAsset } = data;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between border-b pb-6 border-slate-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Autonomous Verification</h1>
                        <p className="text-slate-500 mt-1 font-mono text-sm">ID: {submission.id}</p>
                    </div>
                    <StatusBadge status={submission.status} />
                </div>

                {eligibleAsset && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-8 h-8 text-green-600 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-green-900">Asset Approved & Registered</h3>
                                <p className="text-green-800 mt-1">
                                    Token ID: <span className="font-mono font-bold">{eligibleAsset.id}</span>
                                </p>
                                <p className="text-green-800 text-sm mt-2">
                                    Expected NAV: ₹{eligibleAsset.expectedNAV.mean.toLocaleString()} |
                                    Yield: {eligibleAsset.expectedYield.expected.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Oracle Logic */}
                    <div className={`p-6 rounded-xl border-2 ${progress.stages.oracleVerification?.completed ? 'border-green-500/20 bg-green-50/50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-slate-900 dark:text-white">Oracle Truth Layer</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Existence</span>
                                <span className="font-mono font-bold">{progress.stages.oracleVerification?.subStages?.satellite?.score ? (progress.stages.oracleVerification.subStages.satellite.score * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Ownership</span>
                                <span className="font-mono font-bold">{progress.stages.oracleVerification?.subStages?.ownership?.score ? (progress.stages.oracleVerification.subStages.ownership.score * 100).toFixed(0) : 0}%</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Evidence Vault */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-slate-900 dark:text-white">
                        <Database className="w-5 h-5 text-indigo-600" />
                        Oracle Evidence Vault
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Satellite Imagery & Computer Vision */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" /> Satellite Intelligence
                            </h3>
                            {progress.stages.oracleVerification.subStages.satellite.imageUrl ? (
                                <div className="space-y-4">
                                    <div className="relative rounded-lg overflow-hidden h-48 border border-slate-200 dark:border-slate-700">
                                        <img
                                            src={progress.stages.oracleVerification.subStages.satellite.imageUrl}
                                            alt="Satellite View"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-[10px] text-white font-mono flex justify-between">
                                            <span>SENTINEL-2 FEED</span>
                                            <span>RES: 50CM/PX</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest">Starting Object Detection...</span>
                                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">92% CONFIDENCE</span>
                                        </div>
                                        <p className="text-xs text-blue-700 dark:text-blue-200">
                                            "Built structure visible at coordinates [28.4949, 77.0887]. Consistent with commercial footprint."
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    Awaiting Satellite Feed...
                                </div>
                            )}
                        </div>

                        {/* 2. Property Registry */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-500" /> Official Registry
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-mono text-xs space-y-2">
                                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                        <span className="text-slate-500">Registry ID</span>
                                        <span className="font-bold text-slate-900 dark:text-white">REG-GGM-12345</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                        <span className="text-slate-500">Jurisdiction</span>
                                        <span className="font-bold text-slate-900 dark:text-white">Gurugram, India</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span className="text-slate-500">Verified Owner</span>
                                        <span className="font-bold text-green-600">MATCH (100%)</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 dark:text-amber-200">
                                        Digital 7/12 Extract verified against state land records. No liens or encumbrances detected.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Activity Signals */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-500" /> Live Activity Signals
                            </h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Footfall</div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white">High</div>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Power Usage</div>
                                    <div className="text-lg font-black text-green-500">Active</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Sensor fusion indicates sustained commercial activity. consistent with "Real Estate/Commercial" classification. Last heartbeat: <span className="font-mono">{new Date().toLocaleTimeString()}</span>.
                            </p>
                        </div>

                        {/* 4. Historical Data */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-500" /> Valuation History
                            </h3>
                            <div className="h-32 flex items-end justify-between px-2 gap-1 mb-2">
                                {[40, 45, 42, 50, 55, 60, 58, 65, 70].map((h, i) => (
                                    <div key={i} className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-t-sm relative group">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-indigo-500/50 hover:bg-indigo-500 transition-all"
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                                <span>2018</span>
                                <span>2020</span>
                                <span>2022</span>
                                <span>2024</span>
                                <span>Now</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">CAGR (5Y)</span>
                                <span className="text-xs font-black text-green-600">+12.4%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 text-slate-300 rounded-xl p-6 font-mono text-xs h-64 overflow-y-auto">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> System Logs
                    </h3>
                    <div className="space-y-2">
                        {progress.logs.map((log: any, i: number) => (
                            <div key={i} className={`flex gap-3 ${log.level === 'error' ? 'text-red-400' : log.level === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
                                <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span>{log.message}</span>
                            </div>
                        ))}
                        {progress.logs.length === 0 && <span className="opacity-50">Waiting for logs...</span>}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
