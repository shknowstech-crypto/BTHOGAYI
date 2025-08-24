import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { User, ArrowLeft, Camera, Edit, MapPin, GraduationCap, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    setLoading(false)
  }, [isAuthenticated, navigate])

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
    <AuthGuard requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <GradientButton
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </GradientButton>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Profile
              </h1>
              <p className="text-white/70">
                Manage your BITSPARK profile
              </p>
            </div>
          </div>
          <GradientButton 
            variant="romantic"
            onClick={() => setShowEditModal(true)}
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </GradientButton>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <GlassCard className="p-8 text-center">
              {/* Profile Photo */}
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  {user?.profile_photo ? (
                    <img 
                      src={user.profile_photo} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Basic Info */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {user?.display_name || 'Your Name'}
              </h2>
              <p className="text-white/70 mb-4">@{user?.username || 'username'}</p>
              
              {/* Campus & Year */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="w-4 h-4" />
                  <span>BITS {user?.campus || 'Campus'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <GraduationCap className="w-4 h-4" />
                  <span>Year {user?.year || '1'}</span>
                </div>
              </div>

              {/* Verification Status */}
              <div className="space-y-2">
                <div className={`flex items-center justify-between p-2 rounded-lg ${user?.email_verified ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <span className="text-white/80 text-sm">Email Verified</span>
                  <span className={`text-sm ${user?.email_verified ? 'text-green-400' : 'text-red-400'}`}>
                    {user?.email_verified ? '✓' : '✗'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg ${user?.student_id_verified ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <span className="text-white/80 text-sm">Student ID Verified</span>
                  <span className={`text-sm ${user?.student_id_verified ? 'text-green-400' : 'text-red-400'}`}>
                    {user?.student_id_verified ? '✓' : '✗'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg ${user?.photo_verified ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <span className="text-white/80 text-sm">Photo Verified</span>
                  <span className={`text-sm ${user?.photo_verified ? 'text-green-400' : 'text-red-400'}`}>
                    {user?.photo_verified ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Bio Section */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">About Me</h3>
              <p className="text-white/70 leading-relaxed">
                {user?.bio || 'No bio added yet. Tell others about yourself!'}
              </p>
            </GlassCard>

            {/* Academic Info */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Academic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm">Branch</label>
                  <p className="text-white font-medium">{user?.branch || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">Student ID</label>
                  <p className="text-white font-medium">{user?.student_id || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">Campus</label>
                  <p className="text-white font-medium">BITS {user?.campus || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">Year</label>
                  <p className="text-white font-medium">{user?.year || 'Not specified'}</p>
                </div>
              </div>
            </GlassCard>

            {/* Preferences */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Matching Preferences</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm">Connect Similarity</label>
                  <p className="text-white font-medium">
                    {user?.preferences?.connect_similarity === 1 ? '+1 (Similar)' : '-1 (Opposite)'}
                  </p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">Dating Similarity</label>
                  <p className="text-white font-medium">
                    {user?.preferences?.dating_similarity === 1 ? '+1 (Similar)' : '-1 (Opposite)'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-white/70">
                  To make major changes to your profile, please go through the onboarding process again.
                </p>
              </div>

              <div className="flex gap-3">
                <GradientButton
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </GradientButton>
                <GradientButton
                  variant="romantic"
                  onClick={() => {
                    setShowEditModal(false)
                    navigate('/onboarding')
                  }}
                  className="flex-1"
                >
                  Go to Onboarding
                </GradientButton>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  )
}