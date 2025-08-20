'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Settings, User, Bell, Shield, Heart, Camera, Save } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { AuthService } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    interests: [] as string[],
    preferences: {
      connect_similarity: 1 as 1 | -1,
      dating_similarity: 1 as 1 | -1,
      gender_preference: 'any' as 'male' | 'female' | 'any',
      age_range: [18, 30] as [number, number]
    }
  })
  const [newInterest, setNewInterest] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        bio: user.bio || '',
        interests: user.interests || [],
        preferences: {
          connect_similarity: user.preferences?.connect_similarity || 1,
          dating_similarity: user.preferences?.dating_similarity || 1,
          gender_preference: user.preferences?.gender_preference || 'any',
          age_range: user.preferences?.age_range || [18, 30]
        }
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const updatedUser = await AuthService.updateUserProfile(user.id, {
        display_name: formData.display_name,
        bio: formData.bio,
        interests: formData.interests,
        preferences: formData.preferences
      })
      
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      })
      setNewInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    })
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'preferences', label: 'Matching', icon: Heart },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'privacy', label: 'Privacy', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Settings className="w-10 h-10 text-purple-400" />
            SETTINGS
          </h1>
          <p className="text-xl text-white/70">
            Customize your BITSPARK experience
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard className="p-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === key
                        ? 'bg-purple-500 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'profile' && (
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                
                <div className="space-y-6">
                  {/* Profile Photo */}
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      {user.profile_photo ? (
                        <img 
                          src={user.profile_photo} 
                          alt={user.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {user.display_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <GradientButton variant="secondary" size="sm">
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </GradientButton>
                  </div>

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

                  {/* Interests */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Interests
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        placeholder="Add an interest..."
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <GradientButton onClick={addInterest} size="sm">
                        Add
                      </GradientButton>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-purple-500/30 text-white rounded-full text-sm flex items-center gap-2"
                        >
                          {interest}
                          <button
                            onClick={() => removeInterest(interest)}
                            className="text-white/70 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === 'preferences' && (
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Matching Preferences</h2>
                
                <div className="space-y-8">
                  {/* Connect Similarity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Friend Matching</h3>
                    <p className="text-white/70 text-sm mb-4">
                      How do you want to be matched for friendships?
                    </p>
                    <div className="flex bg-white/10 rounded-xl p-1">
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, connect_similarity: 1 }
                        })}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.preferences.connect_similarity === 1
                            ? 'bg-blue-500 text-white'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Similar (+1)
                      </button>
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, connect_similarity: -1 }
                        })}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.preferences.connect_similarity === -1
                            ? 'bg-purple-500 text-white'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Opposite (-1)
                      </button>
                    </div>
                  </div>

                  {/* Dating Similarity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Dating Matching</h3>
                    <p className="text-white/70 text-sm mb-4">
                      How do you want to be matched for dating?
                    </p>
                    <div className="flex bg-white/10 rounded-xl p-1">
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, dating_similarity: 1 }
                        })}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.preferences.dating_similarity === 1
                            ? 'bg-pink-500 text-white'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Similar (+1)
                      </button>
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, dating_similarity: -1 }
                        })}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.preferences.dating_similarity === -1
                            ? 'bg-purple-500 text-white'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Opposite (-1)
                      </button>
                    </div>
                  </div>

                  {/* Gender Preference */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Gender Preference</h3>
                    <p className="text-white/70 text-sm mb-4">
                      Who would you like to be matched with?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {['male', 'female', 'any'].map((gender) => (
                        <button
                          key={gender}
                          onClick={() => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, gender_preference: gender as any }
                          })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.preferences.gender_preference === gender
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                          }`}
                        >
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === 'notifications' && (
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  {[
                    { key: 'matches', label: 'New Matches', description: 'Get notified when you have new matches' },
                    { key: 'messages', label: 'Messages', description: 'Get notified when you receive messages' },
                    { key: 'ships', label: 'Ships', description: 'Get notified when someone ships you' },
                    { key: 'daily_match', label: 'Daily Match', description: 'Get notified about your daily match' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-white">{setting.label}</h3>
                        <p className="text-white/70 text-sm">{setting.description}</p>
                      </div>
                      <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {activeTab === 'privacy' && (
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Privacy & Safety</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="font-semibold text-white mb-2">Profile Visibility</h3>
                    <p className="text-white/70 text-sm mb-4">Control who can see your profile</p>
                    <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="everyone">Everyone</option>
                      <option value="verified">Verified users only</option>
                      <option value="connections">Connections only</option>
                    </select>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="font-semibold text-white mb-2">Data & Privacy</h3>
                    <div className="space-y-3">
                      <GradientButton variant="secondary" size="sm">
                        Download My Data
                      </GradientButton>
                      <GradientButton variant="secondary" size="sm">
                        Delete Account
                      </GradientButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <GradientButton
              size="lg"
              variant="romantic"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </GradientButton>
          </motion.div>
        </div>
      </div>
    </div>
  )
}