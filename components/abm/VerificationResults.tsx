import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, XCircle, Shield, TrendingUp, AlertTriangle,
  DollarSign, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  FileText, MapPin, Building2, Users, ExternalLink, Copy
} from 'lucide-react';
import { getFullVerificationResult } from '../abmApi';
import { ConsensusScore, EligibleAsset } from '../abmTypes';

interface Props {
  submissionId: string;
  onBack: () => void;
}

const VerificationResults: React.FC<Props> = ({ submissionId, onBack }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'oracle' | 'abm' | 'fraud'>('overview');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getFullVerificationResult(submissionId);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [submissionId]);

  if (loading) {
    return <div className="text-center py-12">Loading results...</div>;
  }

  if (error || !result) {
    return <div className="text-center py-12 text-red-600">{error || 'No results found'}</div>;
  }

  const { submission, consensus, oracle, abm, fraud, eligibleAsset } = result;
  const isEligible = consensus?.eligible;

  const renderScoreCard = (label: string, value: number, threshold: number, isMax = false, unit = '%') => {
    const passed = isMax ? value <= threshold : value >= threshold;
    return (
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
          {passed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500">
          {isMax ? 'Max' : 'Min'}: {threshold}{unit}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className={`rounded-xl p-8 ${
        isEligible 
          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
          : 'bg-gradient-to-r from-red-600 to-red-500'
      } text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {isEligible ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
              <div>
                <h1 className="text-3xl font-black">
                  {isEligible ? 'Asset Eligible' : 'Asset Rejected'}
                </h1>
                <p className="text-white/80">
                  {isEligible 
                    ? 'Ready for tokenization'
                    : consensus?.rejectionReason || 'Did not meet eligibility criteria'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">ID: {submissionId}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                Confidence: {((consensus?.confidence || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60">Asset</p>
            <p className="text-xl font-bold">{submission?.assetName}</p>
            <p className="text-white/80">{submission?.location?.city}, {submission?.location?.state}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {(['overview', 'oracle', 'abm', 'fraud'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Consensus Rules */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Consensus Rules</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {renderScoreCard('Existence', (consensus?.existenceScore || 0) * 100, 90)}
              {renderScoreCard('Ownership', (consensus?.ownershipProbability || 0) * 100, 80)}
              {renderScoreCard('Activity', (consensus?.activityScore || 0) * 100, 60)}
              {renderScoreCard('Fraud', consensus?.fraudLikelihood || 0, 5, true)}
              {renderScoreCard('Risk', consensus?.riskScore || 0, 70, true, '')}
            </div>
          </div>

          {/* Asset Summary */}
          {eligibleAsset && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Token Economics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Total Supply</span>
                    <span className="font-bold text-slate-900 dark:text-white">{eligibleAsset.totalTokenSupply.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Token Price</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{eligibleAsset.tokenPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Available</span>
                    <span className="font-bold text-emerald-600">{eligibleAsset.availableTokens.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 dark:text-slate-400">Expected Yield</span>
                    <span className="font-bold text-indigo-600">{eligibleAsset.expectedYield.expected.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">NAV Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Mean NAV</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{eligibleAsset.expectedNAV.mean.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">NAV Range</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{eligibleAsset.expectedNAV.min.toLocaleString()} - ₹{eligibleAsset.expectedNAV.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Risk Score</span>
                    <span className={`font-bold ${eligibleAsset.riskScore <= 40 ? 'text-emerald-600' : eligibleAsset.riskScore <= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {eligibleAsset.riskScore.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 dark:text-slate-400">Fraud Likelihood</span>
                    <span className="font-bold text-emerald-600">{eligibleAsset.fraudLikelihood.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fingerprints */}
          {eligibleAsset && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Attestation Hashes</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Asset Fingerprint</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{eligibleAsset.fingerprint}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Oracle Attestation</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{eligibleAsset.oracleAttestation}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ABM Output Hash</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{eligibleAsset.abmOutputHash}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'oracle' && oracle && (
        <div className="space-y-6">
          {/* Existence Verification */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Existence Verification</h3>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Satellite</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{(oracle.existence.satellite.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">{oracle.existence.satellite.structureDetected ? 'Detected' : 'Not Found'}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Registry</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{(oracle.existence.registry.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">{oracle.existence.registry.recordFound ? 'Found' : 'Not Found'}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Vision</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{(oracle.existence.vision.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">{oracle.existence.vision.buildingType}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Activity</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{(oracle.existence.activity.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">{oracle.existence.activity.utilityActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Historical</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{(oracle.existence.historical.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">{oracle.existence.historical.yearsOfData} years</p>
              </div>
            </div>
          </div>

          {/* Ownership Verification */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Ownership Probability</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">DID Verification</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{(oracle.ownership.didVerification.score * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">Level: {oracle.ownership.didVerification.verificationLevel}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Registry Ownership</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{(oracle.ownership.registryOwnership.score * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">Name Match: {(oracle.ownership.registryOwnership.ownerNameSimilarity * 100).toFixed(0)}%</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Reputation</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{(oracle.ownership.reputation.score * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">Prior: {oracle.ownership.reputation.priorSuccessfulSubmissions} submissions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'abm' && abm && (
        <div className="space-y-6">
          {/* NAV Calculation */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">NAV Calculation</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Mean NAV</p>
                <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">₹{(abm.nav.meanNAV / 100000).toFixed(1)}L</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Upside NAV</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">₹{(abm.nav.upsideNAV / 100000).toFixed(1)}L</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">Downside NAV</p>
                <p className="text-2xl font-black text-red-700 dark:text-red-300">₹{(abm.nav.downsideNAV / 100000).toFixed(1)}L</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Claimed vs Calc</p>
                <p className={`text-2xl font-black ${abm.nav.claimedVsCalculated > 1.2 ? 'text-red-600' : abm.nav.claimedVsCalculated < 0.8 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {(abm.nav.claimedVsCalculated * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Risk Simulation */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Risk Analysis</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Vacancy Risk</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{abm.riskSimulation.vacancyRiskScore}/100</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Market Volatility</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{abm.riskSimulation.marketVolatility}/100</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Liquidity Score</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{abm.riskSimulation.liquidityScore}/100</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Tail Risk</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{(abm.riskSimulation.tailRiskScore * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Stress Tests */}
            <div className="mt-6">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Stress Test Scenarios</h4>
              <div className="space-y-2">
                {abm.riskSimulation.stressTests.map((test: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{test.scenario}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-red-600">NAV: {test.navImpact.toFixed(1)}%</span>
                      <span className="text-sm text-red-600">CF: {test.cfImpact.toFixed(1)}%</span>
                      <span className="text-xs text-slate-500">P: {(test.probability * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fraud' && fraud && (
        <div className="space-y-6">
          {/* Fraud Summary */}
          <div className={`rounded-xl p-6 ${
            fraud.fraudLikelihood <= 5 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800'
              : fraud.fraudLikelihood <= 20
                ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Fraud Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Risk Level: {fraud.riskLevel.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-black ${
                  fraud.fraudLikelihood <= 5 ? 'text-emerald-600' : fraud.fraudLikelihood <= 20 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {fraud.fraudLikelihood.toFixed(2)}%
                </p>
                <p className="text-sm text-slate-500">Fraud Likelihood</p>
              </div>
            </div>
          </div>

          {/* Anomalies */}
          {fraud.ruleBased.anomalies.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Detected Anomalies</h3>
              <div className="space-y-3">
                {fraud.ruleBased.anomalies.map((anomaly: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    anomaly.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    anomaly.severity === 'high' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                    'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                          anomaly.severity === 'critical' ? 'bg-red-200 text-red-800' :
                          anomaly.severity === 'high' ? 'bg-amber-200 text-amber-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {anomaly.severity}
                        </span>
                        <p className="mt-2 font-medium text-slate-900 dark:text-white">{anomaly.detail}</p>
                        <div className="mt-2 text-xs text-slate-500">
                          {anomaly.evidence.map((e: string, i: number) => (
                            <p key={i}>• {e}</p>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-500">+{(anomaly.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ML Detection */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">ML-Based Detection</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Isolation Forest Score</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{(fraud.mlBased.isolationForestScore * 100).toFixed(0)}%</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">XGBoost Fraud Probability</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{(fraud.mlBased.xgboostFraudProb * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="text-center pt-4">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Submit Another Asset
        </button>
      </div>
    </div>
  );
};

export default VerificationResults;
