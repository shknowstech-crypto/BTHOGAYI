'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { AuthService } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Heart, CheckCircle, AlertCircle, Database, Shield } from 'lucide-react'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [status, setStatus] = useState('Initializing...')
  const [step, setStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const steps = [
    { icon: Shield, text: 'Verifying Google OAuth...' },
    { icon: CheckCircle, text: 'Validating BITS email...' },
    { icon: Database, text: 'Syncing with database...' },
    { icon: Heart, text: 'Setting up your profile...' }
  ]

  useEffect(() => {
    // Prevent multiple executions
    if (isProcessing) return

    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true)
        console.log('🔧 CALLBACK DEBUG: Starting auth callback process...')
        
        // Step 1: Handle the OAuth callback
        setStep(0)
        setStatus('Verifying Google OAuth...')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Handle the auth callback from the URL
        const urlParams = new URLSearchParams(window.location.search)
        const hasAuthCode = urlParams.has('code') || urlParams.has('access_token')
        
        if (hasAuthCode) {
          console.log('🔧 CALLBACK DEBUG: Processing OAuth callback...')
          // Let Supabase handle the OAuth callback
          const { data, error } = await supabase.auth.getSession()
          if (error) {
            console.error('❌ CALLBACK ERROR: OAuth callback failed:', error)
            navigate('/auth?error=auth-failed')
            return
          }
        }

        // Step 2: Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('🔧 CALLBACK DEBUG: Session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: sessionError
        })
        
        if (sessionError) {
          console.error('❌ CALLBACK ERROR: Session error:', sessionError)
          navigate('/auth?error=auth-failed')
          return
        }

        if (!session?.user) {
          console.error('❌ CALLBACK ERROR: No session or user found')
          navigate('/auth?error=auth-failed')
          return
        }

        // Step 3: Validate BITS email
        setStep(1)
        setStatus('Validating BITS email...')
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log('🔧 CALLBACK DEBUG: Validating BITS email:', session.user.email)
        
        if (!AuthService.validateBitsEmail(session.user.email!)) {
          console.error('❌ CALLBACK ERROR: Invalid email domain:', session.user.email)
          await supabase.auth.signOut()
          navigate('/auth?error=invalid-email')
          return
        }

        // Step 4: Sync with database
        setStep(2)
        setStatus('Syncing with database...')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Get or create user profile
        let profile = await AuthService.getUserProfile(session.user.id)
        
        if (!profile) {
          console.log('🔧 CALLBACK DEBUG: Profile not found, creating new profile...')
          try {
            profile = await AuthService.createUserProfile(session.user)
            console.log('✅ CALLBACK SUCCESS: Profile created successfully:', profile)
          } catch (createError: any) {
            console.error('❌ CALLBACK ERROR: Profile creation failed:', {
              error: createError,
              message: createError.message,
              stack: createError.stack,
              user: {
                id: session.user.id,
                email: session.user.email,
                metadata: session.user.user_metadata
              }
            })
            
            // Provide more specific error feedback
            let errorMessage = 'profile-creation-failed'
            if (createError.message?.includes('Invalid data format')) {
              errorMessage = 'invalid-data-format'
            } else if (createError.message?.includes('Missing required information')) {
              errorMessage = 'missing-required-info'
            } else if (createError.message?.includes('BITS email')) {
              errorMessage = 'invalid-email'
            }
            
            console.error('❌ CALLBACK ERROR: Signing out and redirecting with error:', errorMessage)
            await AuthService.signOut()
            navigate(`/auth?error=${errorMessage}`)
            return
          }
        } else {
          console.log('✅ CALLBACK SUCCESS: Existing profile found:', {
            id: profile.id,
            email: profile.bits_email,
            displayName: profile.display_name
          })
        }

        // Step 5: Setup profile
        setStep(3)
        setStatus('Setting up your profile...')
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log('🔧 CALLBACK DEBUG: Setting user in store:', profile.id)
        setUser(profile)

        // Sync with recommendation engine
        console.log('🔧 CALLBACK DEBUG: Syncing with recommendation engine...')
        try {
          await AuthService.syncWithRecommendationEngine(session.user.id)
          console.log('✅ CALLBACK SUCCESS: Recommendation engine sync completed')
        } catch (syncError) {
          console.warn('⚠️ CALLBACK WARNING: Recommendation engine sync failed:', syncError)
          // Don't fail the whole process for this
        }

        // Check if profile is complete
        console.log('🔧 CALLBACK DEBUG: Checking profile completion:', {
          profileCompleted: profile.profile_completed,
          isComplete: AuthService.isProfileComplete(profile)
        })
        
        if (!AuthService.isProfileComplete(profile)) {
          setStatus('Redirecting to onboarding...')
          await new Promise(resolve => setTimeout(resolve, 500))
          console.log('🔧 CALLBACK DEBUG: Redirecting to onboarding')
          navigate('/onboarding')
        } else {
          setStatus('Welcome back!')
          await new Promise(resolve => setTimeout(resolve, 500))
          console.log('🔧 CALLBACK DEBUG: Redirecting to dashboard')
          navigate('/dashboard')
        }
      } catch (error) {
        console.error('❌ CALLBACK ERROR: Unexpected error in auth callback:', {
          error,
          message: (error as Error).message,
          stack: (error as Error).stack
        })
        navigate('/auth?error=auth-failed')
      } finally {
        setIsProcessing(false)
      }
    }

    handleAuthCallback()
  }, [navigate, setUser, isProcessing])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          {/* Logo */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>

          {/* Status */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Setting Up Your Account
          </h2>
          <p className="text-white/70 mb-8">{status}</p>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((stepItem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  index <= step 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < step 
                    ? 'bg-green-500 text-white' 
                    : index === step
                    ? 'bg-blue-500/80 text-white animate-pulse'
                    : 'bg-white/20 text-white/50'
                }`}>
                  {index < step ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : index === step ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <stepItem.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  index <= step ? 'text-white' : 'text-white/50'
                }`}>
                  {stepItem.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Loading Animation */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white/60 text-sm">
              Please wait while we set up your account...
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}