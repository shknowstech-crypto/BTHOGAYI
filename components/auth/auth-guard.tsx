'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { AuthService } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

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
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Validate BITS email
          if (!AuthService.validateBitsEmail(session.user.email!)) {
            await AuthService.signOut()
            logout()
            router.push('/auth?error=invalid-email')
            return
          }

          // Get or create user profile
          let profile = await AuthService.getUserProfile(session.user.id)
          
          if (!profile) {
            profile = await AuthService.createUserProfile(session.user)
          }

          setUser(profile)

          // Check if profile completion is required
          if (requireCompleteProfile && !AuthService.isProfileComplete(profile)) {
            router.push('/onboarding')
            return
          }
        } else {
          logout()
          if (requireAuth) {
            router.push(redirectTo || '/auth')
            return
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        logout()
        if (requireAuth) {
          router.push('/auth?error=auth-failed')
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
        if (event === 'SIGNED_OUT') {
          logout()
          if (requireAuth) {
            router.push('/auth')
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          const profile = await AuthService.getUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [requireAuth, requireCompleteProfile, redirectTo, router, setUser, setLoading, logout, supabase.auth])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-white/70">Loading BITSPARK...</p>
        </div>
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