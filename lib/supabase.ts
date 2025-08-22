import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const createSupabaseClient = () => createClientComponentClient()

// Server-side Supabase client
export const createSupabaseServerClient = () => createServerComponentClient({ cookies })

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface UserProfile {
  id: string
  email: string
  display_name: string
  username: string
  profile_photo?: string
  bio?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  interests: string[]
  year: number
  branch: string
  campus: 'Pilani' | 'Goa' | 'Hyderabad' | 'Dubai'
  preferences: {
    connect_similarity: 1 | -1
    dating_similarity: 1 | -1
    gender_preference?: 'male' | 'female' | 'any'
    age_range: [number, number]
    looking_for: ('friends' | 'dating' | 'networking')[]
  }
  is_active: boolean
  profile_completed: boolean
  last_seen: string
  created_at: string
  updated_at: string
}

export interface Connection {
  id: string
  user1_id: string
  user2_id: string
  connection_type: 'friend' | 'date'
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  compatibility_score: number
  match_reason?: string
  created_at: string
  responded_at?: string
}

export interface Message {
  id: string
  connection_id: string
  sender_id: string
  receiver_id: string
  content: string
  message_count: number
  message_type: 'text' | 'image' | 'emoji'
  is_read: boolean
  created_at: string
}

export interface Ship {
  id: string
  shipper_id: string
  user1_id: string
  user2_id: string
  is_anonymous: boolean
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
  responded_at?: string
}

export interface DailyMatch {
  id: string
  user_id: string
  matched_user_id: string
  match_date: string
  algorithm_version: string
  compatibility_score: number
  viewed: boolean
  action: 'pass' | 'connect' | 'super_like' | null
  created_at: string
  acted_at?: string
}

export interface Invitation {
  id: string
  inviter_id: string
  invitee_email: string
  invitation_code: string
  status: 'pending' | 'accepted' | 'expired'
  expires_at: string
  created_at: string
  accepted_at?: string
}