'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { AuthGuard } from '@/components/auth/auth-guard'
import { InviteFriendsModal } from '@/components/invite/invite-friends-modal'
import { Heart, Users, Ship, MessageCircle, Dice6, Settings, Bell, LogOut, User, Sparkles, UserPlus } from 'lucide-react'
import { useAuthStore, useAppStore } from '@/lib/store'
import { AuthService } from '@/lib/auth'

const features = [
  {
    icon: Users,
    title: "CONNECT",
    description: "Find friends with similar interests",
    color: "from-blue-500 to-cyan-500",
    href: "/connect",
    count: "12 new matches",
    comingSoon: true
  },
  {
    icon: Heart,
    title: "FIND A DATE",
    description: "Discover romantic connections",
    color: "from-pink-500 to-rose-500",
    href: "/dating",
    count: "3 potential dates",
    comingSoon: true
  },
  {
    icon: Ship,
    title: "SHIPPING",
    description: "Let friends play cupid",
    color: "from-purple-500 to-pink-500",
    href: "/shipping",
    count: "2 ships received",
    comingSoon: true
  },
  {
    icon: MessageCircle,
    title: "MESSAGES",
    description: "Your conversations",
    color: "from-indigo-500 to-purple-500",
    href: "/messages",
    count: "5 unread",
    comingSoon: true
  },
  {
    icon: Dice6,
    title: "DAILY MATCH",
    description: "Today's special connection",
    color: "from-cyan-500 to-blue-500",
    href: "/daily-match",
    count: "New match!",
    comingSoon: true
  },
  {
    icon: Settings,
    title: "SETTINGS",
    description: "Manage your profile",
    color: "from-gray-500 to-gray-600",
    href: "/settings",
    count: "",
    comingSoon: false
  }
]

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const { setInviteModalOpen } = useAppStore()
  const router = useRouter()
  const [stats, setStats] = useState({
    connections: 0,
    messages: 0,
    ships: 0
  })

  const handleLogout = async () => {
    try {
      await AuthService.signOut()
      logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleFeatureClick = (feature: typeof features[0]) => {
    if (feature.comingSoon) {
      // Show coming soon message or modal
      return
    }
    router.push(feature.href)
  }

  return (
    <AuthGuard requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        {/* Header */}
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
                <GradientButton
                  variant="secondary"
                  onClick={() => setInviteModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:block">Invite Friends</span>
                </GradientButton>

                <button className="relative p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <Bell className="w-5 h-5 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
                </button>
                
                <button 
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-3 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  {user?.profile_photo ? (
                    <img 
                      src={user.profile_photo} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-white font-medium hidden sm:block">
                    {user?.display_name || 'Profile'}
                  </span>
                </button>

                <GradientButton
                  variant="secondary"
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
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome back, {user?.display_name || 'Student'}! 👋
              </h1>
              <p className="text-xl text-white/70">
                Ready to make some connections at BITS {user?.campus}?
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <GlassCard className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">{stats.connections}</div>
                <p className="text-white/70">Total Connections</p>
                <div className="text-sm text-green-400 mt-1">Coming soon</div>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="text-4xl font-bold text-pink-400 mb-2">{stats.messages}</div>
                <p className="text-white/70">Active Chats</p>
                <div className="text-sm text-green-400 mt-1">Coming soon</div>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">{stats.ships}</div>
                <p className="text-white/70">Ships Received</p>
                <div className="text-sm text-yellow-400 mt-1">Coming soon</div>
              </GlassCard>
            </div>
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
                  {/* Coming Soon Badge */}
                  {feature.comingSoon && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-medium">
                      Coming Soon
                    </div>
                  )}

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

                    {/* Count/Status */}
                    {feature.count && (
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">{feature.count}</span>
                      </div>
                    )}

                    {/* Hover Arrow */}
                    <motion.div
                      className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">→</span>
                      </div>
                    </motion.div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <GlassCard className="p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                🚀 Platform Under Development
              </h3>
              <p className="text-white/70 mb-6">
                We're working hard to bring you the best social experience for BITS students. 
                Core features are coming soon!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <GradientButton 
                  variant="primary" 
                  onClick={() => setInviteModalOpen(true)}
                >
                  Invite Friends
                </GradientButton>
                <GradientButton 
                  variant="secondary" 
                  onClick={() => router.push('/profile')}
                >
                  Complete Profile
                </GradientButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Invite Friends Modal */}
        <InviteFriendsModal />
      </div>
    </AuthGuard>
  )
}