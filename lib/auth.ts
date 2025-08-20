import { supabase } from './supabase'
import { UserProfile } from './supabase'

export class AuthService {
  // BITS email validation
  static validateBitsEmail(email: string): boolean {
    const bitsEmailRegex = /^[a-zA-Z0-9._%+-]+@pilani\.bits-pilani\.ac\.in$/
    return bitsEmailRegex.test(email)
  }

  // Sign up with BITS email
  static async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    if (!this.validateBitsEmail(email)) {
      throw new Error('Please use your BITS Pilani email address')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: userData.display_name,
          student_id: userData.student_id,
          campus: userData.campus,
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
        campus: userData.campus || 'Pilani',
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
    const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const random = Math.floor(Math.random() * 1000)
    return `${base}${random}`
  }

  // Verify student ID
  static async verifyStudentId(userId: string, studentIdPhoto: File): Promise<boolean> {
    try {
      // BOILERPLATE LINK: Implement actual student ID verification
      // This would typically involve:
      // 1. Upload photo to storage
      // 2. Use OCR to extract student ID
      // 3. Validate against BITS database
      // 4. Update user verification status
      
      // For now, return true as placeholder
      const { error } = await supabase
        .from('users')
        .update({ student_id_verified: true })
        .eq('id', userId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error verifying student ID:', error)
      return false
    }
  }

  // Verify profile photo
  static async verifyProfilePhoto(userId: string, photo: File): Promise<boolean> {
    try {
      // BOILERPLATE LINK: Implement actual photo verification
      // This would typically involve:
      // 1. Upload photo to storage
      // 2. Use face detection to ensure it's a real person
      // 3. Check against existing photos to prevent duplicates
      // 4. Update user verification status
      
      // For now, return true as placeholder
      const { error } = await supabase
        .from('users')
        .update({ photo_verified: true })
        .eq('id', userId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error verifying profile photo:', error)
      return false
    }
  }

  // Sign in
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
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
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  }
}