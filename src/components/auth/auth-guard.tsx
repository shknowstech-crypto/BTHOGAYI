'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthService } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { motion } from 'framer-motion'
import { Shield, Database, CheckCircle } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireCompleteProfile?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireCompleteProfile = false,
  redirectTo 
}: AuthGuardProps) {
  const { user, isAuthenticated, setUser, setLoading, logout } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const [authStep, setAuthStep] = useState('Checking authentication...')
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthStep('Verifying session...')
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          logout()
          if (requireAuth) {
            navigate('/auth?error=session-error')
          }
          return
        }
        
        if (session?.user) {
          setAuthStep('Validating BITS email...')
          
          // Validate BITS email
          if (!AuthService.validateBitsEmail(session.user.email!)) {
            await AuthService.signOut()
            logout()
            navigate('/auth?error=invalid-email')
            return
          }

          setAuthStep('Loading profile...')
          console.log('🔧 AUTH GUARD: Loading profile for user:', session.user.id)
          
          // Get or create user profile
          let profile = await AuthService.getUserProfile(session.user.id)
          console.log('🔧 AUTH GUARD: Profile result:', profile ? 'found' : 'not found')
          
          if (!profile) {
            setAuthStep('Creating profile...')
            console.log('🔧 AUTH GUARD: Creating new profile...')
            try {
              profile = await AuthService.createUserProfile(session.user)
              console.log('🔧 AUTH GUARD: Profile created successfully')
            } catch (createError: any) {
              console.error('❌ AUTH GUARD: Profile creation failed:', createError)
              await AuthService.signOut()
              logout()
              navigate('/auth?error=profile-creation-failed')
              return
            }
          }

          setAuthStep('Syncing with services...')
          console.log('🔧 AUTH GUARD: Starting recommendation engine sync...')
          
          // Sync with recommendation engine (with timeout)
          try {
            await Promise.race([
              AuthService.syncWithRecommendationEngine(session.user.id),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Sync timeout')), 5000)
              )
            ])
            console.log('✅ AUTH GUARD: Recommendation engine sync completed')
          } catch (syncError) {
            console.warn('⚠️ AUTH GUARD: Recommendation sync failed (continuing anyway):', syncError)
            // Don't fail auth for sync issues
          }

          setUser(profile)

          // Check if profile completion is required
          if (requireCompleteProfile && !AuthService.isProfileComplete(profile)) {
            setAuthStep('Redirecting to onboarding...')
            navigate('/onboarding')
            return
          }
        } else {
          logout()
          if (requireAuth) {
            navigate(redirectTo || '/auth')
            return
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        logout()
        if (requireAuth) {
          navigate('/auth?error=auth-failed')
        }
      } finally {
        setIsChecking(false)
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (event === 'SIGNED_OUT') {
          logout()
          if (requireAuth) {
            navigate('/auth')
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Validate BITS email on sign in
          if (!AuthService.validateBitsEmail(session.user.email!)) {
            await AuthService.signOut()
            logout()
            navigate('/auth?error=invalid-email')
            return
          }
          
          const profile = await AuthService.getUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
            
            // Sync with recommendation engine
            await AuthService.syncWithRecommendationEngine(session.user.id)
            
            // Check if profile needs completion
            if (requireCompleteProfile && !AuthService.isProfileComplete(profile)) {
              navigate('/onboarding')
            } else if (!requireCompleteProfile) {
              navigate('/dashboard')
            }
          } else {
            // Create new profile for first-time users
            try {
              const newProfile = await AuthService.createUserProfile(session.user)
              setUser(newProfile)
              navigate('/onboarding')
            } catch (error) {
              console.error('Failed to create profile:', error)
              await AuthService.signOut()
              logout()
              navigate('/auth?error=profile-creation-failed')
            }
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Token was refreshed, sync with recommendation engine
          if (session?.user?.id) {
            await AuthService.syncWithRecommendationEngine(session.user.id)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [requireAuth, requireCompleteProfile, redirectTo, navigate, setUser, setLoading, logout, supabase.auth])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
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
              <Shield className="w-8 h-8 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Authenticating...
            </h2>
            <p className="text-white/70 mb-8">{authStep}</p>

            {/* Auth Steps */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Google OAuth verification</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>BITS email validation</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Database synchronization</span>
              </div>
            </div>

            <LoadingSpinner size="lg" className="mx-auto" />
          </div>
        </motion.div>
      </div>
    )
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null // Router will handle redirect
  }

  // If complete profile is required but profile is incomplete
  if (requireCompleteProfile && user && !AuthService.isProfileComplete(user)) {
    return null // Router will handle redirect
  }

  return <>{children}</>
}