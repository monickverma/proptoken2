import React, { useEffect, useState } from 'react';
import {
  Satellite, FileSearch, Eye, Activity, Users, Brain,
  TrendingUp, LineChart, AlertTriangle, Shield, Scale,
  CheckCircle2, XCircle, Loader2, Clock, ArrowRight
} from 'lucide-react';
import { VerificationProgress } from '../abmTypes';
import { getSubmissionProgress } from '../abmApi';

interface Props {
  submissionId: string;
  onComplete: () => void;
}

const VerificationProgressView: React.FC<Props> = ({ submissionId, onComplete }) => {
  const [progress, setProgress] = useState<VerificationProgress | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getSubmissionProgress(submissionId);
        setProgress(data);
        
        // Check if verification is complete
        if (data.currentStage === 'ELIGIBLE' || data.currentStage === 'REJECTED') {
          setTimeout(onComplete, 1500);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch progress');
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 2000);
    return () => clearInterval(interval);
  }, [submissionId, onComplete]);

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-bold">Loading verification status...</p>
      </div>
    );
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'satellite': return Satellite;
      case 'registry': return FileSearch;
      case 'vision': return Eye;
      case 'activity': return Activity;
      case 'ownership': return Users;
      case 'marketIntelligence': return TrendingUp;
      case 'cashFlowSimulation': return LineChart;
      case 'riskSimulation': return AlertTriangle;
      case 'ruleBased': return Shield;
      case 'mlBased': return Brain;
      case 'patterns': return FileSearch;
      default: return CheckCircle2;
    }
  };

  const renderSubStage = (name: string, data: { completed: boolean; score?: number; anomalies?: number }) => {
    const Icon = getStageIcon(name);
    return (
      <div key={name} className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center gap-2">
          {data.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          )}
          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
            {name.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </div>
        {data.score !== undefined && (
          <span className={`text-sm font-bold ${data.score >= 70 ? 'text-emerald-600' : data.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {data.score.toFixed(0)}%
          </span>
        )}
        {data.anomalies !== undefined && (
          <span className={`text-sm font-bold ${data.anomalies === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {data.anomalies} anomalies
          </span>
        )}
      </div>
    );
  };

  const isComplete = progress.currentStage === 'ELIGIBLE' || progress.currentStage === 'REJECTED';
  const isEligible = progress.currentStage === 'ELIGIBLE';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verification Progress</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Submission ID: {submissionId}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider ${
            isComplete 
              ? isEligible 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
          }`}>
            {progress.currentStage.replace('_', ' ')}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
              isComplete 
                ? isEligible ? 'bg-emerald-500' : 'bg-red-500'
                : 'bg-indigo-600'
            }`}
            style={{ 
              width: `${isComplete ? 100 : 
                (progress.stages.oracleVerification.progress * 0.3 +
                 progress.stages.abmAnalysis.progress * 0.3 +
                 progress.stages.fraudDetection.progress * 0.25 +
                 (progress.stages.consensusScoring.completed ? 15 : 0))}%` 
            }}
          />
        </div>
      </div>

      {/* Stages Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Oracle Verification */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                progress.stages.oracleVerification.completed 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                  : 'bg-indigo-100 dark:bg-indigo-900/30'
              }`}>
                <Satellite className={`w-5 h-5 ${
                  progress.stages.oracleVerification.completed 
                    ? 'text-emerald-600' 
                    : 'text-indigo-600'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Oracle Truth Layer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Multi-source existence verification</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
              {progress.stages.oracleVerification.progress}%
            </span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(progress.stages.oracleVerification.subStages).map(([name, data]) => 
              renderSubStage(name, data)
            )}
          </div>
        </div>

        {/* ABM Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                progress.stages.abmAnalysis.completed 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                  : 'bg-indigo-100 dark:bg-indigo-900/30'
              }`}>
                <Brain className={`w-5 h-5 ${
                  progress.stages.abmAnalysis.completed 
                    ? 'text-emerald-600' 
                    : 'text-indigo-600'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">ABM Intelligence</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Market & cash flow analysis</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
              {progress.stages.abmAnalysis.progress}%
            </span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(progress.stages.abmAnalysis.subStages).map(([name, data]) => 
              renderSubStage(name, data)
            )}
          </div>
        </div>

        {/* Fraud Detection */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                progress.stages.fraudDetection.completed 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                  : 'bg-indigo-100 dark:bg-indigo-900/30'
              }`}>
                <Shield className={`w-5 h-5 ${
                  progress.stages.fraudDetection.completed 
                    ? 'text-emerald-600' 
                    : 'text-indigo-600'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Fraud Detection</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Anomaly & pattern analysis</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
              {progress.stages.fraudDetection.progress}%
            </span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(progress.stages.fraudDetection.subStages).map(([name, data]) => 
              renderSubStage(name, data)
            )}
          </div>
        </div>

        {/* Consensus Scoring */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                progress.stages.consensusScoring.completed 
                  ? progress.stages.consensusScoring.eligible
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <Scale className={`w-5 h-5 ${
                  progress.stages.consensusScoring.completed 
                    ? progress.stages.consensusScoring.eligible
                      ? 'text-emerald-600'
                      : 'text-red-600'
                    : 'text-slate-400'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Consensus Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Deterministic eligibility</p>
              </div>
            </div>
            {progress.stages.consensusScoring.completed && (
              <span className={`text-sm font-bold ${
                progress.stages.consensusScoring.eligible ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {progress.stages.consensusScoring.eligible ? 'ELIGIBLE' : 'REJECTED'}
              </span>
            )}
          </div>

          {progress.stages.consensusScoring.completed ? (
            <div className={`p-4 rounded-lg ${
              progress.stages.consensusScoring.eligible 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {progress.stages.consensusScoring.eligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-bold ${
                  progress.stages.consensusScoring.eligible 
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {progress.stages.consensusScoring.eligible 
                    ? `Asset Eligible (${((progress.stages.consensusScoring.confidence || 0) * 100).toFixed(1)}% confidence)`
                    : 'Asset Rejected'
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 text-slate-400 dark:text-slate-600">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm">Waiting for previous stages...</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Activity Log</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {progress.logs.slice().reverse().map((log, index) => (
            <div key={index} className="flex items-start gap-3 text-sm py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className={`w-2 h-2 rounded-full mt-1.5 ${
                log.level === 'success' ? 'bg-emerald-500' :
                log.level === 'error' ? 'bg-red-500' :
                log.level === 'warning' ? 'bg-amber-500' :
                'bg-slate-400'
              }`} />
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300">{log.message}</p>
                <p className="text-xs text-slate-400 dark:text-slate-600">
                  {new Date(log.timestamp).toLocaleTimeString()} - {log.stage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      {isComplete && (
        <div className="text-center">
          <button
            onClick={onComplete}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-colors ${
              isEligible 
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-600 hover:bg-slate-700'
            }`}
          >
            View Full Results <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationProgressView;
