import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './lib/store';
import { AuthGuard } from './components/auth/auth-guard';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ConnectPage from './pages/ConnectPage';
import DatingPage from './pages/DatingPage';
import MessagesPage from './pages/MessagesPage';
import ShippingPage from './pages/ShippingPage';
import DailyMatchPage from './pages/DailyMatchPage';
import SettingsPage from './pages/SettingsPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

function App() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          {/* Protected routes */}
          <Route path="/onboarding" element={
            <AuthGuard>
              <OnboardingPage />
            </AuthGuard>
          } />
          <Route path="/dashboard" element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          } />
          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          } />
          <Route path="/connect" element={
            <AuthGuard>
              <ConnectPage />
            </AuthGuard>
          } />
          <Route path="/dating" element={
            <AuthGuard>
              <DatingPage />
            </AuthGuard>
          } />
          <Route path="/messages" element={
            <AuthGuard>
              <MessagesPage />
            </AuthGuard>
          } />
          <Route path="/shipping" element={
            <AuthGuard>
              <ShippingPage />
            </AuthGuard>
          } />
          <Route path="/daily-match" element={
            <AuthGuard>
              <DailyMatchPage />
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          } />
          
          {/* Redirect authenticated users from auth page */}
          <Route path="/auth" element={
            user ? <Navigate to="/dashboard" replace /> : <AuthPage />
          } />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;