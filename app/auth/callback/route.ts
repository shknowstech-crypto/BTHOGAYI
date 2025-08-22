import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth-failed`)
      }

      if (session?.user) {
        // Validate BITS email
        if (!AuthService.validateBitsEmail(session.user.email!)) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${requestUrl.origin}/auth?error=invalid-email`)
        }

        // Check if user profile exists, if not redirect to onboarding
        const { data: profile } = await supabase
          .from('users')
          .select('profile_completed')
          .eq('id', session.user.id)
          .single()

        if (!profile || !profile.profile_completed) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        }

        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth-failed`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}