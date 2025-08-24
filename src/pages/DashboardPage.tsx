'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Heart, Users, Ship, MessageCircle, Dice6, Settings, Bell, User, ArrowRight, Sparkles, Star } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { AuthService } from '@/lib/auth'
import { useRecommendations, RecommendationItem } from '@/lib/recommendation-api'

const features = [
  {
    icon: Users,
    title: "Connect",
    description: "Find friends with similar interests",
    color: "from-blue-500 to-cyan-500",
    href: "/connect"
  },
  {
    icon: Heart,
    title: "Dating",
    description: "Discover romantic connections",
    color: "from-pink-500 to-rose-500",
    href: "/dating"
  },
  {
    icon: Ship,
    title: "Shipping",
    description: "Let friends play cupid",
    color: "from-purple-500 to-pink-500",
    href: "/shipping"
  },
  {
    icon: MessageCircle,
    title: "Messages",
    description: "Your conversations",
    color: "from-indigo-500 to-purple-500",
    href: "/messages"
  },
  {
    icon: Dice6,
    title: "Daily Match",
    description: "Today's special connection",
    color: "from-cyan-500 to-blue-500",
    href: "/daily-match"
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Manage your profile",
    color: "from-gray-500 to-gray-600",
    href: "/settings"
  }
]

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { getRecommendations } = useRecommendations()
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [loadingRecs, setLoadingRecs] = useState(false)

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user?.id) return
      
      setLoadingRecs(true)
      try {
        const recs = await getRecommendations(user.id, 'friends', 3)
        setRecommendations(recs)
      } catch (error) {
        console.error('Failed to load recommendations:', error)
      } finally {
        setLoadingRecs(false)
      }
    }

    loadRecommendations()
  }, [user?.id])

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
    navigate(feature.href)
  }

  return (
    <AuthGuard requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Clean Header */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">BITSPARK</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button className="relative p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
              </button>
              
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium hidden sm:block">
                  {user?.display_name || 'Profile'}
                </span>
              </button>

              <GradientButton
                variant="secondary"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <span className="hidden sm:block">Logout</span>
              </GradientButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Simple Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, {user?.display_name || 'Student'}! 👋
          </h1>
          <p className="text-xl text-white/70">
            Ready to connect at BITS {user?.campus}?
          </p>
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
                className="p-8 h-full cursor-pointer group relative overflow-hidden"
                hover={true}
                onClick={() => handleFeatureClick(feature)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Arrow */}
                  <motion.div
                    className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Simple CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <GlassCard className="p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Start Your Journey
            </h3>
            <p className="text-white/70 mb-6">
              Choose a feature above to begin connecting with fellow BITS students.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <GradientButton 
                variant="romantic" 
                onClick={() => navigate('/connect')}
              >
                Find Friends
              </GradientButton>
              <GradientButton 
                variant="modern" 
                onClick={() => navigate('/dating')}
              >
                Find Love
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
    </AuthGuard>
  )
}