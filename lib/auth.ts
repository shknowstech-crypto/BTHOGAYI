import { supabase } from './supabase'
import { UserProfile } from './supabase'

export class AuthService {
  // BITS email validation
  static validateBitsEmail(email: string): boolean {
    // Enhanced BITS email validation with all campus domains
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

  // Enhanced student ID verification with better validation
  // Verify student ID
  static async verifyStudentId(userId: string, studentIdPhoto: File): Promise<boolean> {
    try {
      // Basic file validation
      if (!studentIdPhoto.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file')
      }
      
      if (studentIdPhoto.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image file too large. Please upload a file smaller than 5MB')
      }
      
      // TODO: Implement actual verification process:
      // 1. Upload to secure storage (Cloudinary/AWS S3)
      // 2. OCR extraction of student ID
      // 3. Validation against BITS database
      // 4. Manual review queue for edge cases
      
      // For now, mark as pending verification
      const { error } = await supabase
        .from('users')
        .update({ 
          student_id_verified: false, // Will be true after manual verification
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) throw error
      
      // Create notification for manual review
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'verification',
          title: 'Student ID Submitted',
          message: 'Your student ID is being reviewed. You\'ll be notified once verified.',
          data: { verification_type: 'student_id' }
        })
      
      return true // Successfully submitted for review
    } catch (error) {
      console.error('Error verifying student ID:', error)
      throw error
    }
  }

  // Enhanced profile photo verification
  // Verify profile photo
  static async verifyProfilePhoto(userId: string, photo: File): Promise<boolean> {
    try {
      // Basic file validation
      if (!photo.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file')
      }
      
      if (photo.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Image file too large. Please upload a file smaller than 10MB')
      }
      
      // TODO: Implement actual verification:
      // 1. Upload to secure storage
      // 2. Face detection API (AWS Rekognition/Google Vision)
      // 3. Duplicate photo detection
      // 4. Manual review for edge cases
      
      // For now, mark as pending verification
      const { error } = await supabase
        .from('users')
        .update({ 
          photo_verified: false, // Will be true after verification
          profile_photo: 'pending_verification',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) throw error
      
      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'verification',
          title: 'Profile Photo Submitted',
          message: 'Your profile photo is being reviewed for authenticity.',
          data: { verification_type: 'profile_photo' }
        })
      
      return true
    } catch (error) {
      console.error('Error verifying profile photo:', error)
      throw error
    }
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

  // Check if user profile is complete
  static async checkProfileCompleteness(userId: string): Promise<{
    isComplete: boolean
    missingFields: string[]
    completionPercentage: number
  }> {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) {
        return { isComplete: false, missingFields: ['profile'], completionPercentage: 0 }
      }

      const requiredFields = [
        'display_name',
        'bio',
        'interests',
        'year',
        'branch',
        'profile_photo'
      ]

      const missingFields: string[] = []
      let completedFields = 0

      requiredFields.forEach(field => {
        const value = profile[field as keyof UserProfile]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          missingFields.push(field)
        } else {
          completedFields++
        }
      })

      const completionPercentage = Math.round((completedFields / requiredFields.length) * 100)
      const isComplete = missingFields.length === 0 && profile.verified

      return {
        isComplete,
        missingFields,
        completionPercentage
      }
    } catch (error) {
      console.error('Error checking profile completeness:', error)
      return { isComplete: false, missingFields: ['error'], completionPercentage: 0 }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    if (!this.validateBitsEmail(email)) {
      throw new Error('Please use your BITS email address')
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) throw error
  }
  
  // Update user activity status
  static async updateUserActivity(userId: string) {
    try {
      await supabase
        .from('users')
        .update({ 
          last_seen: new Date().toISOString(),
          is_active: true
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating user activity:', error)
    }
  }
  
  // Get user statistics
  static async getUserStats(userId: string) {
    try {
      const [connectionsResult, messagesResult, shipsResult] = await Promise.all([
        supabase
          .from('connections')
          .select('status, connection_type')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
        supabase
          .from('messages')
          .select('id')
          .eq('sender_id', userId),
        supabase
          .from('ships')
          .select('status')
          .eq('shipper_id', userId)
      ])

      const connections = connectionsResult.data || []
      const messages = messagesResult.data || []
      const ships = shipsResult.data || []
      return {
        connections: {
          total: connections.length,
          friends: connections.filter(c => c.connection_type === 'friend' && c.status === 'accepted').length,
          dates: connections.filter(c => c.connection_type === 'date' && c.status === 'accepted').length,
          pending: connections.filter(c => c.status === 'pending').length
        },
        messages: {
          sent: messages.length
        },
        ships: {
          sent: ships.length,
          successful: ships.filter(s => s.status === 'accepted').length
        }
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        connections: { total: 0, friends: 0, dates: 0, pending: 0 },
        messages: { sent: 0 },
        ships: { sent: 0, successful: 0 }
      }
    }
  }
}