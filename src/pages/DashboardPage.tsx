import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Heart, Users, Ship, MessageCircle, Dice6, Settings, Bell, LogOut, User, Sparkles, TrendingUp, Calendar, Star } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { AuthService } from '@/lib/auth'

const features = [
  {
    icon: Users,
    title: "CONNECT",
    description: "Find friends with similar interests",
    color: "from-blue-500 to-cyan-500",
    href: "/connect",
    count: "12 new matches",
    status: "coming-soon"
  },
  {
    icon: Heart,
    title: "FIND A DATE",
    description: "Discover romantic connections",
    color: "from-pink-500 to-rose-500",
    href: "/dating",
    count: "3 potential dates",
    status: "coming-soon"
  },
  {
    icon: Ship,
    title: "SHIPPING",
    description: "Let friends play cupid",
    color: "from-purple-500 to-pink-500",
    href: "/shipping",
    count: "2 ships received",
    status: "coming-soon"
  },
  {
    icon: MessageCircle,
    title: "MESSAGES",
    description: "Your conversations",
    color: "from-indigo-500 to-purple-500",
    href: "/messages",
    count: "5 unread",
    status: "coming-soon"
  },
  {
    icon: Dice6,
    title: "DAILY MATCH",
    description: "Today's special connection",
    color: "from-cyan-500 to-blue-500",
    href: "/daily-match",
    count: "New match!",
    status: "coming-soon"
  },
  {
    icon: Settings,
    title: "SETTINGS",
    description: "Manage your profile",
    color: "from-gray-500 to-gray-600",
    href: "/settings",
    count: "",
    status: "available"
  }
]

export default function DashboardPage() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [stats, setStats] = useState({
    connections: 0,
    messages: 0,
    ships: 0,
    streak: 0
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          const profile = await AuthService.getUserProfile(currentUser.id)
          if (profile) {
            setUser(profile)
            // Simulate some stats for demo
            setStats({
              connections: Math.floor(Math.random() * 50) + 10,
              messages: Math.floor(Math.random() * 20) + 5,
              ships: Math.floor(Math.random() * 10) + 2,
              streak: profile.streak_count || 0
            })
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
      logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleFeatureClick = (feature: typeof features[0]) => {
    if (feature.status === 'coming-soon') {
      // Show a nice coming soon animation
      return
    }
    navigate(feature.href)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full mx-auto mb-4"
          />
          <p className="text-white/70 text-lg">Loading BITSPARK...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Enhanced Header */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">BITSPARK</span>
            </motion.div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <motion.button 
                className="relative p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-white" />
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
              
              <motion.button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {user?.profile_photo ? (
                  <img 
                    src={user.profile_photo} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="text-white font-medium hidden sm:block">
                  {user?.display_name || 'Profile'}
                </span>
              </motion.button>

              <GradientButton
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </GradientButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section with Animation */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  Welcome back, {user?.display_name || 'Student'}! 
                  <motion.span
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="inline-block ml-2"
                  >
                    👋
                  </motion.span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/70"
                >
                  Ready to make some connections at BITS {user?.campus}?
                </motion.p>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <GlassCard className="p-6 text-center hover:bg-white/15 transition-all duration-300" hover>
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
                      <div className="text-3xl font-bold text-blue-400">{stats.connections}</div>
                    </div>
                    <p className="text-white/70 text-sm">Connections</p>
                    <div className="text-xs text-green-400 mt-1">Coming soon</div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <GlassCard className="p-6 text-center hover:bg-white/15 transition-all duration-300" hover>
                    <div className="flex items-center justify-center mb-2">
                      <MessageCircle className="w-6 h-6 text-pink-400 mr-2" />
                      <div className="text-3xl font-bold text-pink-400">{stats.messages}</div>
                    </div>
                    <p className="text-white/70 text-sm">Messages</p>
                    <div className="text-xs text-green-400 mt-1">Coming soon</div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <GlassCard className="p-6 text-center hover:bg-white/15 transition-all duration-300" hover>
                    <div className="flex items-center justify-center mb-2">
                      <Ship className="w-6 h-6 text-purple-400 mr-2" />
                      <div className="text-3xl font-bold text-purple-400">{stats.ships}</div>
                    </div>
                    <p className="text-white/70 text-sm">Ships</p>
                    <div className="text-xs text-yellow-400 mt-1">Coming soon</div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <GlassCard className="p-6 text-center hover:bg-white/15 transition-all duration-300" hover>
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-yellow-400 mr-2" />
                      <div className="text-3xl font-bold text-yellow-400">{stats.streak}</div>
                    </div>
                    <p className="text-white/70 text-sm">Day Streak</p>
                    <div className="text-xs text-blue-400 mt-1">Keep it up!</div>
                  </GlassCard>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlassCard 
                className="p-8 h-full cursor-pointer group relative overflow-hidden"
                hover={true}
                onClick={() => handleFeatureClick(feature)}
              >
                {/* Status Badge */}
                {feature.status === 'coming-soon' && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-medium backdrop-blur-sm">
                    Coming Soon
                  </div>
                )}

                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 mb-4 leading-relaxed group-hover:text-white/80 transition-colors">
                    {feature.description}
                  </p>

                  {/* Count/Status */}
                  {feature.count && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{feature.count}</span>
                    </div>
                  )}

                  {/* Hover Arrow */}
                  <motion.div
                    className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white text-lg">→</span>
                    </div>
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Development Status */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center"
        >
          <GlassCard className="p-8 max-w-3xl mx-auto">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Calendar className="w-8 h-8 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-white mb-4">
              🚀 Platform Under Active Development
            </h3>
            <p className="text-white/70 mb-6 leading-relaxed">
              We're working hard to bring you the best social experience for BITS students. 
              Core features are being developed with love and attention to detail!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <GradientButton 
                variant="primary" 
                onClick={() => navigate('/profile')}
              >
                Complete Profile
              </GradientButton>
              <GradientButton 
                variant="secondary" 
                onClick={() => navigate('/settings')}
              >
                Manage Settings
              </GradientButton>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm mb-2">Development Progress</p>
              <div className="w-full bg-white/10 rounded-full h-2 max-w-md mx-auto">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '35%' }}
                  transition={{ duration: 2, delay: 1.5 }}
                />
              </div>
              <p className="text-white/60 text-xs mt-2">35% Complete</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}