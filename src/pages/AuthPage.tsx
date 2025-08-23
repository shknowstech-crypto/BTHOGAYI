import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { Heart, Mail, Lock, User, GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { AuthService } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    studentId: '',
    campus: 'Pilani'
  })

  const { setUser, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return false
    }

    if (!isLogin) {
      if (!formData.displayName || !formData.studentId) {
        setError('All fields are required for registration')
        return false
      }
      
      if (!AuthService.validateBitsEmail(formData.email)) {
        setError('Please use your BITS email address (e.g., @pilani.bits-pilani.ac.in)')
        return false
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setLoading(true)

    try {
      if (isLogin) {
        const { user } = await AuthService.signIn(formData.email, formData.password)
        if (user) {
          const profile = await AuthService.getUserProfile(user.id)
          if (profile) {
            setUser(profile)
            setSuccess('Welcome back!')
            setTimeout(() => navigate('/dashboard'), 1000)
          }
        }
      } else {
        await AuthService.signUp(formData.email, formData.password, {
          display_name: formData.displayName,
          student_id: formData.studentId,
          campus: formData.campus as any,
          branch: 'Computer Science',
          year: 1,
          interests: []
        })
        setSuccess('Account created successfully! You can now sign in.')
        setTimeout(() => setIsLogin(true), 2000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setFormData({
      email: '',
      password: '',
      displayName: '',
      studentId: '',
      campus: 'Pilani'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8" variant="strong">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {isLogin ? 'Welcome Back' : 'Join BITSPARK'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70"
            >
              {isLogin ? 'Sign in to your account' : 'Create your account with BITS email'}
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Email */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    BITS Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@pilani.bits-pilani.ac.in"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Sign Up Fields */}
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Display Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          placeholder="Your full name"
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Student ID
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input
                          type="text"
                          value={formData.studentId}
                          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                          placeholder="2021A7PS1234P"
                          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Campus
                      </label>
                      <select
                        value={formData.campus}
                        onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-200"
                        required
                      >
                        <option value="Pilani" className="bg-gray-800">BITS Pilani</option>
                        <option value="Goa" className="bg-gray-800">BITS Goa</option>
                        <option value="Hyderabad" className="bg-gray-800">BITS Hyderabad</option>
                        <option value="Dubai" className="bg-gray-800">BITS Dubai</option>
                      </select>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-300 text-sm">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <GradientButton
              size="lg"
              variant="romantic"
              className="w-full"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </GradientButton>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-white/70 hover:text-white transition-colors text-sm"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-purple-400 font-medium">
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>

          {/* Campus Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 bg-white/5 rounded-xl"
          >
            <h4 className="text-white/80 font-medium text-sm mb-2 text-center">Supported Campuses:</h4>
            <div className="grid grid-cols-2 gap-2 text-white/60 text-xs">
              <div className="text-center">🏛️ BITS Pilani</div>
              <div className="text-center">🏖️ BITS Goa</div>
              <div className="text-center">🏙️ BITS Hyderabad</div>
              <div className="text-center">🏜️ BITS Dubai</div>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  )
}