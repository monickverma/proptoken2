'use client';

import { useEffect, useState } from 'react';
import { getSubmissionStatus } from '@/lib/api';

function TruthCard({ evidence }: { evidence: any }) {
    if (!evidence) return null;

    return (
        <div className="p-4 border rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-800 flex items-center">
                    <span className="mr-2">
                        {evidence.source.includes('Satellite') ? '🛰️' : evidence.source.includes('Registry') ? '📄' : '📊'}
                    </span>
                    {evidence.source}
                </h4>
                <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Confidence</span>
                    <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-1000"
                                style={{ width: `${evidence.confidence * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-black text-indigo-600">{(evidence.confidence * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            <div className="text-xs text-gray-600 space-y-3">
                <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 font-medium text-indigo-800 italic">
                    "{evidence.derivedSignal}"
                </div>

                <p className="leading-relaxed">{evidence.explanation}</p>

                {evidence.imageUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-inner mt-2">
                        <img
                            src={evidence.imageUrl}
                            alt={evidence.source}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[8px] text-white px-2 py-0.5 rounded uppercase tracking-tighter">
                            Live Feed Simulation
                        </div>
                    </div>
                )}

                {evidence.rawData && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 bg-gray-900/5 p-3 rounded-xl border border-gray-100 font-mono">
                        {Object.entries(evidence.rawData).filter(([k]) => k !== 'imageUrl').map(([key, value]: [string, any]) => (
                            <div key={key}>
                                <span className="text-[9px] uppercase text-gray-400 block mb-0.5">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-[10px] font-bold text-gray-700 truncate block">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerificationProgress({ submissionId }: { submissionId: string }) {
    const [status, setStatus] = useState<any>(null);
    const [showVault, setShowVault] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!submissionId || submissionId === 'undefined') return;

        const poll = setInterval(async () => {
            try {
                const data = await getSubmissionStatus(submissionId);
                setStatus(data);
                setError(null);
            } catch (e: any) {
                console.error(e);
                setError(e.message || 'Failed to sync with oracle net');
            }
        }, 3000);

        return () => clearInterval(poll);
    }, [submissionId]);

    if (error && error.includes('not found')) {
        return (
            <div className="max-w-4xl mx-auto p-12 bg-white rounded-3xl shadow-xl border border-red-100 text-center space-y-4">
                <div className="text-4xl">🔍</div>
                <h2 className="text-2xl font-black text-gray-900 uppercase">Submission Not Found</h2>
                <p className="text-gray-500">The submission ID <code className="bg-gray-100 px-2 py-1 rounded text-red-600">{submissionId}</code> could not be located on the protocol network.</p>
                <button
                    onClick={() => window.location.href = '/submit'}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                    Create New Submission
                </button>
            </div>
        );
    }

    if (!status) return (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <div className={`animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 ${error ? 'border-t-red-500' : 'border-t-indigo-600'}`}></div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">
                {error ? 'Protocol Error: Attempting to Reconnect...' : 'Syncing with Oracle Network...'}
            </p>
        </div>
    );

    const oracleResults = status.results?.oracle?.results || [];

    return (
        <div className="max-w-4xl mx-auto p-10 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
                        Protocol <span className="text-indigo-600">Trust</span> Pipeline
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">Submission ID: {submissionId}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Final Clearance</span>
                    <div className={`px-6 py-2 rounded-2xl text-sm font-black shadow-xl transition-all duration-500 scale-110 ${status.verificationStatus?.consensus === 'ELIGIBLE'
                        ? 'bg-green-500 text-white shadow-green-200'
                        : 'bg-indigo-600 text-white shadow-indigo-100 animate-pulse'
                        }`}>
                        {status.verificationStatus?.consensus || 'ANALYZING'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { id: 'oracle', label: 'Truths', color: 'green', desc: 'Oracle Evidence' },
                    { id: 'abm', label: 'Risk', color: 'blue', desc: 'Market/Fraud' },
                    { id: 'consensus', label: 'Consensus', color: 'indigo', desc: 'Clearance' },
                    { id: 'legal', label: 'Legal', color: 'purple', desc: 'SPV Wrapping' }
                ].map((step, idx) => (
                    <div key={step.id} className={`group p-6 border rounded-2xl transition-all duration-500 ${status.verificationStatus?.[step.id] === 'DONE' || status.verificationStatus?.[step.id] === 'ELIGIBLE'
                        ? `bg-${step.color}-50/30 border-${step.color}-100 translate-y-[-4px]`
                        : 'bg-gray-50/50 border-gray-100 opacity-60'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${status.verificationStatus?.[step.id] === 'DONE' || status.verificationStatus?.[step.id] === 'ELIGIBLE'
                                ? `text-${step.color}-600`
                                : 'text-gray-400'
                                }`}>Phase 0{idx + 1}</span>
                            <div className={`w-2 h-2 rounded-full ${status.verificationStatus?.[step.id] === 'DONE' || status.verificationStatus?.[step.id] === 'ELIGIBLE'
                                ? `bg-${step.color}-500 shadow-[0_0_10px_#${step.color}]`
                                : 'bg-gray-200'
                                }`} />
                        </div>
                        <h3 className="font-black text-gray-800 mb-1">{step.label}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{step.desc}</p>

                        {step.id === 'oracle' && (status.verificationStatus?.oracle === 'DONE') && (
                            <button
                                onClick={() => setShowVault(!showVault)}
                                className="mt-4 w-full py-2 bg-white border border-green-200 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-green-500 hover:text-white transition-all shadow-sm"
                            >
                                {showVault ? 'Lock Vault' : 'Open Vault'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Evidence Vault Section */}
            {showVault && oracleResults.length > 0 && (
                <div className="p-10 border-4 border-green-500/10 rounded-[2.5rem] bg-gradient-to-br from-white to-green-50/20 animate-in zoom-in-95 duration-700">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Authenticated</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Transparent Evidence Vault</h2>
                            </div>
                            <p className="text-sm text-gray-400 font-medium italic">"Visible integrity for every asset boarding"</p>
                        </div>
                        <div className="text-right bg-white p-4 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                            <span className="text-[10px] text-gray-400 font-black block uppercase tracking-widest mb-1">Vault Health</span>
                            <span className="text-4xl font-black text-green-500">{(status.results.oracle.score * 100).toFixed(0)}%</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {oracleResults.map((result: any, idx: number) => (
                            <div key={idx} className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="h-px flex-1 bg-gray-100" />
                                    <h3 className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">{result.category}</h3>
                                    <div className="h-px flex-1 bg-gray-100" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.evidences.map((evidence: any, eIdx: number) => (
                                        <TruthCard key={eIdx} evidence={evidence} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center py-6 border-t font-mono">
                <div className="text-[9px] text-gray-400 font-bold uppercase">
                    Protocol Node v0.8.2-alpha
                </div>
                <div className="text-[9px] text-gray-400 font-bold uppercase">
                    Blockchain Finality: <span className="text-green-500">CONSENSUS_REACHED</span>
                </div>
            </div>
        </div>
    );
}
