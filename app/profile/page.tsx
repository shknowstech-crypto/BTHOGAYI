'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { VerificationStatus } from '@/components/ui/verification-status'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { InterestSelector } from '@/components/ui/interest-selector'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { User, Camera, Heart, GraduationCap, MapPin, Calendar } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { AuthService } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    interests: [] as string[],
    year: 1,
    branch: '',
    age: 18
  })

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        bio: user.bio || '',
        interests: user.interests || [],
        year: user.year || 1,
        branch: user.branch || '',
        age: user.age || 18
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const updatedUser = await AuthService.updateUserProfile(user.id, formData)
      if (updatedUser) {
        setUser(updatedUser)
        setEditing(false)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (file: File): Promise<boolean> => {
    if (!user) return false
    
    try {
      // TODO: Implement actual photo upload to storage
      // For now, just update the verification status
      await AuthService.verifyProfilePhoto(user.id, file)
      return true
    } catch (error) {
      console.error('Error uploading photo:', error)
      return false
    }
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pb-24">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <User className="w-10 h-10 text-purple-400" />
            MY PROFILE
          </h1>
          <p className="text-xl text-white/70">
            Manage your BITSPARK profile and preferences
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Photo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PhotoUpload
              currentPhoto={user.profile_photo}
              onPhotoUpload={handlePhotoUpload}
              title="Profile Photo"
              description="Upload a clear photo of yourself for verification"
            />
          </motion.div>

          {/* Verification Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <VerificationStatus
              user={user}
              onVerifyEmail={() => alert('Email verification - Implement actual flow')}
              onVerifyPhoto={() => alert('Photo verification - Implement actual flow')}
              onVerifyStudentId={() => alert('Student ID verification - Implement actual flow')}
            />
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Profile Information</h3>
                <GradientButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </GradientButton>
              </div>

              {editing ? (
                <div className="space-y-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Tell others about yourself..."
                    />
                  </div>

                  {/* Academic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Year
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {[1, 2, 3, 4, 5].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                        min="16"
                        max="30"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      placeholder="e.g., Computer Science, Mechanical Engineering"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Save Button */}
                  <GradientButton
                    variant="romantic"
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                  </GradientButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white/60 text-xs">Name</p>
                        <p className="text-white font-medium">{user.display_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white/60 text-xs">Email</p>
                        <p className="text-white font-medium text-sm">{user.bits_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white/60 text-xs">Academic</p>
                        <p className="text-white font-medium">{user.branch} • Year {user.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-pink-400" />
                      <div>
                        <p className="text-white/60 text-xs">Campus</p>
                        <p className="text-white font-medium">BITS {user.campus}</p>
                      </div>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-white/80 leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Interests Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-6">Your Interests</h3>
              <InterestSelector
                selectedInterests={formData.interests}
                onInterestsChange={(interests) => setFormData({ ...formData, interests })}
              />
            </GlassCard>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}