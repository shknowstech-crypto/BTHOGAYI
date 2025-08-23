'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  MapPin, 
  Calendar,
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
  student_id: string
  bio: string
  age: number
  gender: 'male' | 'female' | 'other'
  year: number
  branch: string
  preferences: {
    connect_similarity: 1 | -1
    dating_similarity: 1 | -1
    looking_for: ('friends' | 'dating' | 'networking')[]
  }
}

export default function OnboardingPage() {
  const { user, updateUser } = useAuthStore()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    display_name: user?.display_name || '',
    student_id: user?.student_id || '',
    bio: '',
    age: 18,
    gender: 'male',
    year: 1,
    branch: '',
    preferences: {
      connect_similarity: 1,
      dating_similarity: 1,
      looking_for: ['friends']
    }
  })

  const steps = [
    { title: 'Basic Info', icon: User },
    { title: 'Academic', icon: GraduationCap },
    { title: 'Preferences', icon: Users }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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
      const updatedProfile = await AuthService.updateUserProfile(user.id, {
        ...formData,
      })
      
      updateUser(updatedProfile)
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
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
                  Student ID
                </label>
                <input
                  type="text"
                  value={formData.student_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 2021A7PS1234P"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Branch/Department
              </label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select your branch</option>
                {BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-white/80 text-sm font-medium">Campus</span>
              </div>
              <p className="text-white font-medium">BITS {user?.campus}</p>
              <p className="text-white/60 text-sm">Detected from your email</p>
            </div>
          </motion.div>
        )


      case 2:
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

            <div>
              <label className="block text-white/80 text-sm font-medium mb-4">
                Matching Preferences
              </label>
              <div className="space-y-4">
                <div>
                  <p className="text-white/70 text-sm mb-2">For Friends (CONNECT)</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, connect_similarity: 1 }
                      }))}
                      className={`flex-1 p-3 rounded-xl border transition-all ${
                        formData.preferences.connect_similarity === 1
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : 'bg-white/5 border-white/20 text-white/70'
                      }`}
                    >
                      +1 Similar
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, connect_similarity: -1 }
                      }))}
                      className={`flex-1 p-3 rounded-xl border transition-all ${
                        formData.preferences.connect_similarity === -1
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                          : 'bg-white/5 border-white/20 text-white/70'
                      }`}
                    >
                      -1 Opposite
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-white/70 text-sm mb-2">For Dating</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, dating_similarity: 1 }
                      }))}
                      className={`flex-1 p-3 rounded-xl border transition-all ${
                        formData.preferences.dating_similarity === 1
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : 'bg-white/5 border-white/20 text-white/70'
                      }`}
                    >
                      +1 Similar
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, dating_similarity: -1 }
                      }))}
                      className={`flex-1 p-3 rounded-xl border transition-all ${
                        formData.preferences.dating_similarity === -1
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                          : 'bg-white/5 border-white/20 text-white/70'
                      }`}
                    >
                      -1 Opposite
                    </button>
                  </div>
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
        return formData.display_name && formData.student_id && formData.bio && formData.age >= 16
      case 1:
        return formData.year && formData.branch
      case 2:
        return formData.preferences.looking_for.length > 0
      default:
        return false
    }
  }

  return (
    <AuthGuard requireAuth={true}>
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