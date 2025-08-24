'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { AuthGuard } from '@/components/auth/auth-guard'
import { AuthService } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'
import { 
  User, 
  Heart, 
  Users, 
  GraduationCap, 
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

const INTERESTS = [
  'Technology', 'Music', 'Sports', 'Art', 'Reading', 'Gaming',
  'Photography', 'Travel', 'Cooking', 'Dancing', 'Movies', 'Fitness',
  'Coding', 'Design', 'Writing', 'Science', 'Business', 'Fashion'
]

const BRANCHES = [
  'Computer Science', 'Electronics & Communication', 'Mechanical', 'Civil',
  'Electrical', 'Chemical', 'Biotechnology', 'Mathematics', 'Physics',
  'Chemistry', 'Economics', 'Management', 'Pharmacy'
]

interface OnboardingData {
  display_name: string
  bio: string
  age: number
  gender: 'male' | 'female' | 'other'
  year: number
  branch: string
  student_id: string
  interests: string[]
  preferences: {
    connect_similarity: 1 | -1
    dating_similarity: 1 | -1
    gender_preference?: 'male' | 'female' | 'any'
    age_range?: [number, number]
    looking_for: ('friends' | 'dating' | 'networking')[]
    relationship_intent?: 'casual' | 'serious' | 'marriage'
    lifestyle_preferences?: {
      food?: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain'
      smoking?: 'never' | 'occasionally' | 'regularly'
      drinking?: 'never' | 'socially' | 'regularly'
    }
  }
}

export default function OnboardingPage() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    display_name: user?.display_name || '',
    bio: '',
    age: 18,
    gender: 'male',
    year: 1,
    branch: '',
    student_id: '',
    interests: [],
    preferences: {
      connect_similarity: 1,
      dating_similarity: 1,
      gender_preference: 'any',
      age_range: [18, 25],
      looking_for: ['friends'],
      relationship_intent: 'serious',
      lifestyle_preferences: {
        food: 'non-vegetarian',
        smoking: 'never',
        drinking: 'socially'
      }
    }
  })

  // Prefill form data with existing user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        display_name: user.display_name || prev.display_name,
        bio: user.bio || prev.bio,
        age: user.age || prev.age,
        gender: user.gender || prev.gender,
        year: user.year || prev.year,
        branch: user.branch || prev.branch,
        student_id: user.student_id || prev.student_id,
        interests: user.interests || prev.interests,
        preferences: {
          connect_similarity: user.preferences?.connect_similarity || prev.preferences.connect_similarity,
          dating_similarity: user.preferences?.dating_similarity || prev.preferences.dating_similarity,
          looking_for: user.preferences?.looking_for || prev.preferences.looking_for
        }
      }))
    }
  }, [user])

  const baseSteps = [
    { title: 'Basic Info', icon: User },
    { title: 'Academic', icon: GraduationCap },
    { title: 'Interests', icon: Heart },
    { title: 'Preferences', icon: Users }
  ]

  const datingStep = { title: 'Dating Preferences', icon: Heart }
  
  const steps = [
    ...baseSteps,
    ...(formData.preferences.looking_for.includes('dating') ? [datingStep] : [])
  ]

  const maxStep = formData.preferences.looking_for.includes('dating') ? 4 : 3

  const handleNext = () => {
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Prepare the profile data with all required fields
      const profileData = {
        ...formData,
        preferences: {
          ...formData.preferences,
          // Ensure required fields have default values
          age_range: formData.preferences.age_range || [18, 25],
          gender_preference: formData.preferences.gender_preference || 'any'
        },
        profile_completed: true
      }

      const updatedProfile = await AuthService.updateUserProfile(user.id, profileData)
      
      if (updatedProfile) {
        updateUser(updatedProfile)
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const toggleLookingFor = (option: 'friends' | 'dating' | 'networking') => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        looking_for: prev.preferences.looking_for.includes(option)
          ? prev.preferences.looking_for.filter(o => o !== option)
          : [...prev.preferences.looking_for, option]
      }
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="basic-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="How should others see your name?"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={formData.student_id}
                onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="2021A7PS1234P"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Tell others about yourself..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Age
                </label>
                <input
                  type="number"
                  min="16"
                  max="30"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  <option value="male" className="bg-gray-800 text-white">Male</option>
                  <option value="female" className="bg-gray-800 text-white">Female</option>
                  <option value="other" className="bg-gray-800 text-white">Other</option>
                </select>
              </div>
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            key="academic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Year of Study
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
              >
                <option value={1} className="bg-gray-800 text-white">1st Year</option>
                <option value={2} className="bg-gray-800 text-white">2nd Year</option>
                <option value={3} className="bg-gray-800 text-white">3rd Year</option>
                <option value={4} className="bg-gray-800 text-white">4th Year</option>
                <option value={5} className="bg-gray-800 text-white">5th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Branch/Department
              </label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
              >
                <option value="" className="bg-gray-800 text-white">Select your branch</option>
                {BRANCHES.map(branch => (
                  <option key={branch} value={branch} className="bg-gray-800 text-white">{branch}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="interests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-white/80 text-sm font-medium mb-4">
                What are you interested in? (Select at least 3)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-xl border transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-white/50 text-sm mt-2">
                Selected: {formData.interests.length} interests
              </p>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-white/80 text-sm font-medium mb-4">
                What are you looking for?
              </label>
              <div className="space-y-3">
                {[
                  { key: 'friends' as const, label: 'Friends & Social Connections', icon: Users },
                  { key: 'dating' as const, label: 'Dating & Romantic Connections', icon: Heart },
                  { key: 'networking' as const, label: 'Professional Networking', icon: Sparkles }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => toggleLookingFor(key)}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 ${
                      formData.preferences.looking_for.includes(key)
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case 4: // Dating Preferences (only shown if dating is selected)
        return (
          <motion.div
            key="dating-preferences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-white/80 text-sm font-medium mb-4">
                Gender Preference
              </label>
              <div className="space-y-3">
                {[
                  { key: 'any' as const, label: 'Any Gender' },
                  { key: 'male' as const, label: 'Male' },
                  { key: 'female' as const, label: 'Female' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, gender_preference: key }
                    }))}
                    className={`w-full p-3 rounded-xl border transition-all ${
                      formData.preferences.gender_preference === key
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-4">
                Age Range Preference
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs mb-2">Min Age</label>
                  <input
                    type="number"
                    min="18"
                    max="30"
                    value={formData.preferences.age_range?.[0] || 18}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        age_range: [parseInt(e.target.value), prev.preferences.age_range?.[1] || 25]
                      }
                    }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs mb-2">Max Age</label>
                  <input
                    type="number"
                    min="18"
                    max="30"
                    value={formData.preferences.age_range?.[1] || 25}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        age_range: [prev.preferences.age_range?.[0] || 18, parseInt(e.target.value)]
                      }
                    }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-4">
                Relationship Intent
              </label>
              <div className="space-y-3">
                {[
                  { key: 'casual' as const, label: 'Casual Dating', desc: 'Fun, light-hearted connections' },
                  { key: 'serious' as const, label: 'Serious Relationship', desc: 'Looking for meaningful, long-term connections' },
                  { key: 'marriage' as const, label: 'Marriage-Minded', desc: 'Seeking life partner for marriage' }
                ].map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, relationship_intent: key }
                    }))}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      formData.preferences.relationship_intent === key
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-white/50 mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-4">
                Lifestyle Preferences
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Food Preference</label>
                  <select
                    value={formData.preferences.lifestyle_preferences?.food || 'non-vegetarian'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        lifestyle_preferences: {
                          ...prev.preferences.lifestyle_preferences,
                          food: e.target.value as 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain'
                        }
                      }
                    }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
                  >
                    <option value="vegetarian" className="bg-gray-800 text-white">Vegetarian</option>
                    <option value="non-vegetarian" className="bg-gray-800 text-white">Non-Vegetarian</option>
                    <option value="vegan" className="bg-gray-800 text-white">Vegan</option>
                    <option value="jain" className="bg-gray-800 text-white">Jain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Smoking</label>
                  <select
                    value={formData.preferences.lifestyle_preferences?.smoking || 'never'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        lifestyle_preferences: {
                          ...prev.preferences.lifestyle_preferences,
                          smoking: e.target.value as 'never' | 'occasionally' | 'regularly'
                        }
                      }
                    }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
                  >
                    <option value="never" className="bg-gray-800 text-white">Never</option>
                    <option value="occasionally" className="bg-gray-800 text-white">Occasionally</option>
                    <option value="regularly" className="bg-gray-800 text-white">Regularly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Drinking</label>
                  <select
                    value={formData.preferences.lifestyle_preferences?.drinking || 'socially'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        lifestyle_preferences: {
                          ...prev.preferences.lifestyle_preferences,
                          drinking: e.target.value as 'never' | 'socially' | 'regularly'
                        }
                      }
                    }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 [&>option]:text-white"
                  >
                    <option value="never" className="bg-gray-800 text-white">Never</option>
                    <option value="socially" className="bg-gray-800 text-white">Socially</option>
                    <option value="regularly" className="bg-gray-800 text-white">Regularly</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.display_name && formData.bio && formData.age >= 16 && formData.student_id
      case 1:
        return formData.year && formData.branch
      case 2:
        return formData.interests.length >= 3
      case 3:
        return formData.preferences.looking_for.length > 0
      case 4: // Dating preferences (only required if dating is selected)
        if (formData.preferences.looking_for.includes('dating')) {
          return formData.preferences.gender_preference && 
                 formData.preferences.age_range &&
                 formData.preferences.relationship_intent &&
                 formData.preferences.lifestyle_preferences?.food &&
                 formData.preferences.lifestyle_preferences?.smoking &&
                 formData.preferences.lifestyle_preferences?.drinking
        }
        return true
      default:
        return false
    }
  }

  return (
    <AuthGuard requireAuth={true} requireCompleteProfile={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <GlassCard className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Complete Your Profile
              </h1>
              <p className="text-white/70">
                Help us find your perfect connections at BITS
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${
                      index <= currentStep ? 'text-purple-400' : 'text-white/40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep 
                        ? 'bg-purple-500/20 border border-purple-500/50' 
                        : 'bg-white/10 border border-white/20'
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <GradientButton
                variant="secondary"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={currentStep === 0 ? 'invisible' : ''}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </GradientButton>

              <GradientButton
                variant="romantic"
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
              >
                {currentStep === steps.length - 1 ? (
                  isLoading ? 'Completing...' : 'Complete Profile'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AuthGuard>
  )
}