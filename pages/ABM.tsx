import React, { useState } from 'react';
import { 
  Brain, Satellite, Shield, Scale, Building2, 
  FileText, ArrowRight, CheckCircle2 
} from 'lucide-react';
import AssetSubmissionForm from '../components/abm/AssetSubmissionForm';
import VerificationProgressView from '../components/abm/VerificationProgress';
import VerificationResults from '../components/abm/VerificationResults';
import EligibleAssetRegistry from '../components/abm/EligibleAssetRegistry';

type View = 'landing' | 'submit' | 'progress' | 'results' | 'registry';

const ABMPage: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string>('');

  const handleSubmissionComplete = (submissionId: string) => {
    setCurrentSubmissionId(submissionId);
    setView('progress');
  };

  const handleProgressComplete = () => {
    setView('results');
  };

  const handleBackToSubmit = () => {
    setCurrentSubmissionId('');
    setView('submit');
  };

  const renderLanding = () => (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
          <Brain className="w-4 h-4" />
          ABM & Asset Intelligence Layer
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
          Autonomous Asset Verification
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Self-verifying asset onboarding where owners submit assets, ABMs evaluate investability, 
          and oracles prove real-world existence. No institutional approval. No discretionary authority.
        </p>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-4">
          "Given all available signals, this asset has a high probability of being real, investable, and correctly priced."
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <button
          onClick={() => setView('submit')}
          className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-8 text-left hover:border-indigo-500 transition-colors group"
        >
          <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
            <FileText className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Submit Asset</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Submit your SPV and asset for autonomous verification through our Oracle Truth Layer and ABM Intelligence.
          </p>
          <span className="inline-flex items-center gap-2 text-indigo-600 font-bold">
            Start Submission <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        <button
          onClick={() => setView('registry')}
          className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-8 text-left hover:border-emerald-500 transition-colors group"
        >
          <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
            <Building2 className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Asset Registry</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Browse verified eligible assets and claim cash flow exposure through tokenized ownership.
          </p>
          <span className="inline-flex items-center gap-2 text-emerald-600 font-bold">
            View Registry <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>

      {/* Pipeline Flow */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8">Verification Pipeline</h2>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {[
            { icon: FileText, label: 'Submit', desc: 'SPV & Asset Data' },
            { icon: Satellite, label: 'Oracle Truth', desc: 'Existence Verification' },
            { icon: Brain, label: 'ABM Intelligence', desc: 'Market Analysis' },
            { icon: Shield, label: 'Fraud Detection', desc: 'Anomaly Check' },
            { icon: Scale, label: 'Consensus', desc: 'Eligibility Decision' },
            { icon: Building2, label: 'Registry', desc: 'Asset Registered' },
          ].map((step, index) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center text-center w-28">
                <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
                  <step.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{step.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
              {index < 5 && (
                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {[
          {
            icon: Satellite,
            title: 'Multi-Oracle Truth',
            desc: 'Satellite imagery, property registries, activity signals, computer vision'
          },
          {
            icon: Brain,
            title: 'ABM Intelligence',
            desc: 'Monte Carlo simulations, market analysis, stress testing, risk modeling'
          },
          {
            icon: Shield,
            title: 'Fraud Detection',
            desc: 'Rule-based anomaly detection, ML models, pattern analysis'
          },
          {
            icon: Scale,
            title: 'Deterministic Consensus',
            desc: 'No human approval, transparent thresholds, automatic eligibility'
          }
        ].map((feature, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <feature.icon className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">What This System Claims</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">✓ Guarantees</p>
            <ul className="text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Asset likely exists</li>
              <li>• Asset is economically sane</li>
              <li>• No obvious fraud patterns</li>
              <li>• Transparent risk metrics</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 mb-1">✗ Does NOT Guarantee</p>
            <ul className="text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Legal ownership enforcement</li>
              <li>• Court enforceability</li>
              <li>• Zero fraud (probabilistic only)</li>
              <li>• Regulatory protection</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-amber-700 dark:text-amber-300 font-bold mt-4">
          This is Uniswap for RWAs, not BlackRock.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      {/* Navigation */}
      {view !== 'landing' && (
        <div className="max-w-6xl mx-auto mb-6">
          <button
            onClick={() => setView('landing')}
            className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-2"
          >
            ← Back to ABM Home
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {view === 'landing' && renderLanding()}
        {view === 'submit' && (
          <AssetSubmissionForm onSubmissionComplete={handleSubmissionComplete} />
        )}
        {view === 'progress' && currentSubmissionId && (
          <VerificationProgressView 
            submissionId={currentSubmissionId} 
            onComplete={handleProgressComplete} 
          />
        )}
        {view === 'results' && currentSubmissionId && (
          <VerificationResults 
            submissionId={currentSubmissionId} 
            onBack={handleBackToSubmit} 
          />
        )}
        {view === 'registry' && <EligibleAssetRegistry />}
      </div>
    </div>
  );
};

export default ABMPage;
