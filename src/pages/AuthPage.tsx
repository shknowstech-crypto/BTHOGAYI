'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Heart, AlertCircle, CheckCircle, Shield, Users, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function AuthPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Handle URL error parameters
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    
    if (urlError === 'invalid-email') {
      setError('Please use your BITS email address to sign in')
    } else if (urlError === 'auth-failed') {
      setError('Authentication failed. Please try again.')
    } else if (urlError === 'session-error') {
      setError('Session expired. Please sign in again.')
    } else if (urlError === 'profile-creation-failed') {
      setError('Failed to create profile. This might be a database issue. Please try again or contact support.')
    } else if (urlError === 'invalid-data-format') {
      setError('Data format error. Please contact support if this persists.')
    } else if (urlError === 'missing-required-info') {
      setError('Missing required information from Google. Please try signing in again.')
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const clearMessages = () => {
    setError('')
    setSuccess('')
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
              Welcome to BITSPARK
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70"
            >
              Connect with BITS students across all campuses
            </motion.p>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
                <button 
                  onClick={clearMessages}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-300 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Auth Button */}
          <GoogleAuthButton onError={setError} onSuccess={setSuccess} />

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 space-y-3"
          >
            <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              Why BITSPARK is Safe:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>BITS email verification required</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Google OAuth secure authentication</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>JWT token-based API security</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Manual profile verification</span>
              </div>
            </div>
          </motion.div>

          {/* Campus Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 p-4 bg-white/5 rounded-xl"
          >
            <h4 className="text-white/80 font-medium text-sm mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Supported Campuses:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-white/60 text-xs">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                BITS Pilani
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                BITS Goa
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                BITS Hyderabad
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" />
                BITS Dubai
              </div>
            </div>
          </motion.div>

          {/* JWT Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-4 text-center"
          >
            <p className="text-white/50 text-xs">
              🔐 Secured with JWT tokens and multi-layer authentication
            </p>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  )
}