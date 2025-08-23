import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './lib/store'
import { AuthService } from './lib/auth'
import { ServerStatusIndicator } from './components/ui/server-status-indicator'

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

function App() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(false) // Temporarily disable auth for testing
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    initAuth()
  }, [setLoading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <ServerStatusIndicator />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
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