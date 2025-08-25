import { supabase } from './supabase'
import { UserProfile } from './supabase'

export class AuthService {
  // BITS email validation
  static validateBitsEmail(email: string): boolean {
    const bitsEmailRegex = /^[a-zA-Z0-9._%+-]+@(pilani\.bits-pilani\.ac\.in|goa\.bits-pilani\.ac\.in|hyderabad\.bits-pilani\.ac\.in|dubai\.bits-pilani\.ac\.in)$/
    return bitsEmailRegex.test(email)
  }

  // Extract campus from email domain
  static getCampusFromEmail(email: string): 'Pilani' | 'Goa' | 'Hyderabad' | 'Dubai' {
    if (email.includes('goa.bits-pilani.ac.in')) return 'Goa'
    if (email.includes('hyderabad.bits-pilani.ac.in')) return 'Hyderabad'
    if (email.includes('dubai.bits-pilani.ac.in')) return 'Dubai'
    return 'Pilani'
  }

  // Primary authentication method - Google OAuth
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          hd: 'pilani.bits-pilani.ac.in,goa.bits-pilani.ac.in,hyderabad.bits-pilani.ac.in,dubai.bits-pilani.ac.in'
        },
      },
    })

    if (error) throw error
    return data
  }

  // Fallback email/password auth (for development)
  static async signUp(email: string, password: string, profileData: Partial<UserProfile>) {
    
    
    if (!this.validateBitsEmail(email)) {
      throw new Error('Please use your BITS email address')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          display_name: profileData.display_name,
          campus: this.getCampusFromEmail(email)
        }
      }
    })

    if (error) throw error
    return data
  }

  static async signIn(email: string, password: string) {
    
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  // Sign out
  static async signOut() {
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current session with JWT token
  static async getSession() {
    
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  // Get JWT token for API calls
  static async getJWTToken(): Promise<string | null> {
    const session = await this.getSession()
    return session?.access_token || null
  }

  // Get current user
  static async getCurrentUser() {
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    
    
    console.log('🔍 AUTH DEBUG: Fetching profile for user ID:', userId)
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ AUTH ERROR: Failed to fetch user profile:', {
        userId,
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      if (error.code === 'PGRST116') {
        console.log('🔍 AUTH DEBUG: User profile not found (expected for new users)')
        return null
      }
      
      console.error('❌ AUTH ERROR: Unexpected error fetching profile:', error)
      return null
    }

    if (!data) {
      console.log('🔍 AUTH DEBUG: No profile data returned for user:', userId)
      return null
    }

    console.log('✅ AUTH SUCCESS: Profile found:', {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      profileCompleted: data.profile_completed
    })

    // Handle interests field - parse if string, keep if already object
    if (data.interests) {
      try {
        if (typeof data.interests === 'string') {
          data.interests = JSON.parse(data.interests)
        }
      } catch (e) {
        console.warn('⚠️ AUTH WARNING: Failed to parse interests JSON:', e)
        data.interests = []
      }
    }

    return data
  }

  // Create user profile from Google OAuth or manual signup
  static async createUserProfile(user: any, additionalData?: Partial<UserProfile>): Promise<UserProfile> {
    console.log('🔧 AUTH DEBUG: Starting profile creation for user:', { 
      id: user.id, 
      email: user.email, 
      metadata: user.user_metadata,
      additionalData 
    })
    
    // Validate BITS email
    if (!this.validateBitsEmail(user.email)) {
      console.error('❌ AUTH ERROR: Invalid BITS email:', user.email)
      throw new Error('Please use your BITS email address to sign in')
    }
    
    const campus = this.getCampusFromEmail(user.email)
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0]
    
    console.log('🔧 AUTH DEBUG: Generated profile data components:', {
      campus,
      displayName,
      emailConfirmed: user.email_confirmed_at
    })
    
    // Create profile data with explicit ID from auth user
    const profileData: any = {
      id: user.id, // Use the Supabase auth user ID
      email: user.email, // Fixed: use 'email' field as per schema
      display_name: displayName,
      campus: campus,
      year: additionalData?.year || 1,
      branch: additionalData?.branch || 'Computer Science',
      student_id: additionalData?.student_id || '',
      bio: additionalData?.bio || '',
      age: additionalData?.age || null,
      gender: additionalData?.gender || null,
      preferences: additionalData?.preferences || {
        age_range: [18, 30],
        same_campus_only: false,
        same_year_preference: false,
        distance_km: 50
      },
      privacy_settings: {
        show_age: true,
        show_year: true,
        show_branch: true,
        discoverable: true,
        show_last_active: false,
        campus_visibility: "all_campuses"
      },
      verified: user.email_confirmed_at ? true : false, // Fixed: use 'verified' field
      profile_completed: false,
      last_active: new Date().toISOString(), // Fixed: use 'last_active' field
      is_active: true,
      subscription_tier: 'free',
      daily_swipes_remaining: 50,
      super_swipes_remaining: 3
    }

    console.log('🔧 AUTH DEBUG: Attempting profile creation with data:', JSON.stringify(profileData, null, 2))

    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('❌ AUTH ERROR: Profile creation failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Check if user already exists
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        console.log('🔍 AUTH DEBUG: User already exists, fetching existing profile...')
        const existingProfile = await this.getUserProfile(user.id)
        if (existingProfile) {
          console.log('✅ AUTH SUCCESS: Found existing profile:', existingProfile.id)
          return existingProfile
        }
        console.error('❌ AUTH ERROR: User exists but profile not found')
      }
      
      // More specific error messages
      if (error.message?.includes('violates check constraint')) {
        console.error('❌ AUTH ERROR: Data violates database constraints:', error.message)
        throw new Error('Invalid data format. Please contact support.')
      } else if (error.message?.includes('not-null constraint')) {
        console.error('❌ AUTH ERROR: Missing required field:', error.message)
        throw new Error('Missing required information. Please try again.')
      } else {
        console.error('❌ AUTH ERROR: Unknown database error:', {
          code: error.code,
          message: error.message,
          details: error.details
        })
        throw new Error(`Profile creation failed: ${error.message}`)
      }
    }

    console.log('✅ AUTH SUCCESS: Profile created successfully:', {
      id: data.id,
      email: data.email,
      displayName: data.display_name
    })

    // If user has a profile photo, add it to user_photos table
    const photoUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture
    if (photoUrl) {
      try {
        await supabase
          .from('user_photos')
          .insert({
            user_id: data.id,
            photo_url: photoUrl,
            photo_order: 1,
            is_primary: true,
            is_approved: true
          })
        console.log('✅ AUTH SUCCESS: Profile photo added')
      } catch (photoError) {
        console.log('⚠️ AUTH WARNING: Could not add profile photo:', photoError)
        // Don't fail profile creation if photo upload fails
      }
    }

    return data
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    
    
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    // Remove interests from updates as they're handled separately
    const { interests, ...profileUpdates } = updatesWithTimestamp as any
    
    const { data, error } = await supabase
      .from('users')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    // Update interests if provided
    if (interests && Array.isArray(interests)) {
      await this.updateUserInterests(userId, interests)
    }

    return data
  }

  // Get user interests
  static async getUserInterests(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest_name')
        .eq('user_id', userId)

      if (error) {
        console.error('❌ AUTH ERROR: Failed to fetch user interests:', error)
        return []
      }

      return data.map(item => item.interest_name)
    } catch (error) {
      console.error('❌ AUTH ERROR: Unexpected error fetching interests:', error)
      return []
    }
  }

  // Update user interests
  static async updateUserInterests(userId: string, interests: string[]): Promise<void> {
    
    
    // Delete existing interests
    await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId)

    // Insert new interests
    if (interests.length > 0) {
      const interestData = interests.map(interest => ({
        user_id: userId,
        interest_name: interest,
        proficiency_level: 'intermediate',
        weight: 0.6  // Default weight for intermediate level
      }))

      const { error } = await supabase
        .from('user_interests')
        .insert(interestData)

      if (error) throw error
    }
  }

  // Check if profile is complete
  static isProfileComplete(user: UserProfile): boolean {
    return !!(
      user.profile_completed &&
      user.display_name &&
      user.bio &&
      user.age &&
      user.year &&
      user.branch &&
      user.student_id &&
      user.preferences?.looking_for &&
      user.preferences.looking_for.length > 0
    )
  }

  // Validate JWT token for API calls
  static async validateJWTToken(token: string): Promise<boolean> {
    try {
      
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) return false
      
      // Additional validation for BITS email
      return this.validateBitsEmail(user.email || '')
    } catch (error) {
      console.error('JWT validation failed:', error)
      return false
    }
  }

  // Get user data from JWT token
  static async getUserFromJWT(token: string): Promise<any> {
    try {
      
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) return null
      
      return user
    } catch (error) {
      console.error('Failed to get user from JWT:', error)
      return null
    }
  }

  // Generate unique username
  private static generateUsername(displayName: string): string {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)
    const random = Math.floor(Math.random() * 1000)
    return `${base}${random}`
  }

  // Update user activity (for recommendation engine)
  static async updateUserActivity(userId: string): Promise<void> {
    
    
    await supabase
      .from('users')
      .update({ 
        last_active: new Date().toISOString(),
        is_active: true
      })
      .eq('id', userId)
  }

  // Sync user data with recommendation engine
  static async syncWithRecommendationEngine(userId: string): Promise<void> {
    try {
      const token = await this.getJWTToken()
      if (!token) return

      // The recommendation engine will validate the JWT and extract user data
      // No need to send user data explicitly - it will fetch from database
      await this.updateUserActivity(userId)
    } catch (error) {
      console.error('Failed to sync with recommendation engine:', error)
    }
  }
}
