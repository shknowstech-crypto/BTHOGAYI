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
    return 'Pilani' // Default to Pilani for pilani.bits-pilani.ac.in
  }

  // Sign up with BITS email
  static async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    if (!this.validateBitsEmail(email)) {
      throw new Error('Please use your official BITS email address (@pilani.bits-pilani.ac.in, @goa.bits-pilani.ac.in, @hyderabad.bits-pilani.ac.in, or @dubai.bits-pilani.ac.in)')
    }

    // Auto-detect campus from email
    const detectedCampus = this.getCampusFromEmail(email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: userData.display_name,
          student_id: userData.student_id,
          campus: userData.campus || detectedCampus,
        },
      },
    })

    if (error) throw error

    // Create user profile after successful signup
    if (data.user) {
      await this.createUserProfile(data.user.id, {
        bits_email: email,
        display_name: userData.display_name || '',
        student_id: userData.student_id || '',
        campus: userData.campus || detectedCampus,
        username: this.generateUsername(userData.display_name || ''),
        year: userData.year || 1,
        branch: userData.branch || '',
        interests: userData.interests || [],
        preferences: {
          connect_similarity: 1,
          dating_similarity: 1,
          gender_preference: 'any',
          age_range: [18, 30],
          max_distance: 50
        },
        email_verified: false,
        student_id_verified: false,
        photo_verified: false,
        verified: false,
        is_active: true,
        last_seen: new Date().toISOString(),
        streak_count: 0
      })
    }

    return data
  }

  // Create user profile
  private static async createUserProfile(userId: string, profileData: Partial<UserProfile>) {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        ...profileData
      })

    if (error) throw error
  }

  // Generate unique username
  private static generateUsername(displayName: string): string {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)
    const random = Math.floor(Math.random() * 1000)
    return `${base}${random}`
  }

  // Sign in
  static async signIn(email: string, password: string) {
    if (!this.validateBitsEmail(email)) {
      throw new Error('Please use your BITS email address')
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    // Update last seen
    if (data.user) {
      await supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', data.user.id)
    }
    
    return data
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    // Add updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updatesWithTimestamp)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Sign in with Google OAuth
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
    return data
  }
}