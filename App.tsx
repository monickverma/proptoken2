
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import Fractional from './pages/Fractional';
import Yield from './pages/Yield';
import Swap from './pages/Swap';
import Pay from './pages/Pay';
import Account from './pages/Account';
import ABM from './pages/ABM';
import InvestorDashboard from './pages/InvestorDashboard';
import IssuerDashboard from './pages/IssuerDashboard';
import TokenDetail from './pages/TokenDetail';
import TradingPage from './pages/TradingPage';
import DeFiPage from './pages/DeFiPage';

// Components
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/verify" element={<ProtectedRoute><Verify /></ProtectedRoute>} />
          <Route path="/fractional" element={<ProtectedRoute><Fractional /></ProtectedRoute>} />
          <Route path="/yield" element={<ProtectedRoute><Yield /></ProtectedRoute>} />
          <Route path="/swap" element={<ProtectedRoute><Swap /></ProtectedRoute>} />
          <Route path="/pay" element={<ProtectedRoute><Pay /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

          {/* ABM & Asset Intelligence Layer - Public Access */}
          <Route path="/abm" element={<ABM />} />

          {/* Autonomous Asset Onboarding: the legacy pages called a separate local-only service
              (localhost:3001), so both routes now open the ABM flow, which uses the deployed API. */}
          <Route path="/autonomous/submit" element={<Navigate to="/abm" replace />} />
          <Route path="/autonomous/verify/:id" element={<Navigate to="/abm" replace />} />

          {/* Step 5: Application & Market Layer */}
          <Route path="/investor" element={<ProtectedRoute><InvestorDashboard /></ProtectedRoute>} />
          <Route path="/issuer" element={<ProtectedRoute><IssuerDashboard /></ProtectedRoute>} />
          <Route path="/tokens/:address" element={<ProtectedRoute><TokenDetail /></ProtectedRoute>} />
          <Route path="/market/:address" element={<ProtectedRoute><TradingPage /></ProtectedRoute>} />
          <Route path="/defi" element={<ProtectedRoute><DeFiPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
