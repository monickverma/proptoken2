
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
import AutonomousVerification from './pages/AutonomousVerification';
import AssetSubmissionForm from './components/autonomous/AssetSubmissionForm';

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

          {/* Autonomous Asset Onboarding (Legacy Integration) */}
          <Route path="/autonomous/submit" element={<ProtectedRoute><AssetSubmissionForm /></ProtectedRoute>} />
          <Route path="/autonomous/verify/:id" element={<ProtectedRoute><AutonomousVerification /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
