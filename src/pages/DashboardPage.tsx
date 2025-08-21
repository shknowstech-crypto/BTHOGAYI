import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Heart, Users, Ship, MessageCircle, Dice6, Settings, Bell } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { AuthService } from '@/lib/auth'

const features = [
  {
    icon: Users,
    title: "CONNECT",
    description: "Find friends with similar interests",
    color: "from-blue-500 to-cyan-500",
    href: "/connect"
  },
  {
    icon: Heart,
    title: "FIND A DATE",
    description: "Discover romantic connections",
    color: "from-pink-500 to-rose-500",
    href: "/dating"
  },
  {
    icon: Ship,
    title: "SHIPPING",
    description: "Let friends play cupid",
    color: "from-purple-500 to-pink-500",
    href: "/shipping"
  },
  {
    icon: MessageCircle,
    title: "MESSAGES",
    description: "Your conversations",
    color: "from-indigo-500 to-purple-500",
    href: "/messages"
  },
  {
    icon: Dice6,
    title: "DAILY MATCH",
    description: "Today's special connection",
    color: "from-cyan-500 to-blue-500",
    href: "/daily-match"
  },
  {
    icon: Settings,
    title: "SETTINGS",
    description: "Manage your profile",
    color: "from-gray-500 to-gray-600",
    href: "/settings"
  }
]

export default function DashboardPage() {
  const { user, isAuthenticated, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    connections: 0,
    messages: 0,
    ships: 0
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          const profile = await AuthService.getUserProfile(currentUser.id)
          if (profile) {
            setUser(profile)
          }
        } else {
          navigate('/auth')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        navigate('/auth')
      } finally {
        setLoading(false)
      }
    }

    if (!isAuthenticated) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, setUser, navigate])

  const handleLogout = async () => {
    try {
      await AuthService.signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.display_name || 'Student'}! 👋
            </h1>
            <p className="text-white/70">
              Ready to make some connections at BITS {user?.campus}?
            </p>
          </div>
          <div className="flex gap-3">
            <button className="relative p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <Bell className="w-6 h-6 text-white" />
            </button>
            <GradientButton
              variant="secondary"
              onClick={handleLogout}
            >
              Logout
            </GradientButton>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.connections}</div>
            <p className="text-white/70">Connections</p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-pink-400 mb-2">{stats.messages}</div>
            <p className="text-white/70">Messages</p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.ships}</div>
            <p className="text-white/70">Ships Received</p>
          </GlassCard>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlassCard 
                className="p-8 h-full cursor-pointer group"
                hover={true}
                onClick={() => navigate(feature.href)}
              >
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="text-purple-400 font-medium flex items-center gap-2 group-hover:text-purple-300 transition-colors"
                >
                  Explore →
                </motion.div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}