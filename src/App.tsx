import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './lib/store'
import { AuthService } from './lib/auth'

// Pages
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ConnectPage from './pages/ConnectPage'
import DatingPage from './pages/DatingPage'
import MessagesPage from './pages/MessagesPage'
import ShippingPage from './pages/ShippingPage'
import DailyMatchPage from './pages/DailyMatchPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import OnboardingPage from './pages/OnboardingPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

function App() {
  const { setLoading } = useAuthStore()

  useEffect(() => {
    // Initialize auth state
    setLoading(false)
  }, [setLoading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/dating" element={<DatingPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/daily-match" element={<DailyMatchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  )
}

export default App