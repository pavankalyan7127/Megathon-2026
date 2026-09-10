import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        <p className="text-sm font-medium">Loading session...</p>
      </div>
    );
  }

  if (user) {
    return <DashboardPage />;
  }

  if (authMode === 'signup') {
    return <SignupPage onNavigateToLogin={() => setAuthMode('login')} />;
  }

  return <LoginPage onNavigateToSignup={() => setAuthMode('signup')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

