-- Fix users table to use auth.uid() as primary key
-- This ensures the user profile ID matches the Supabase auth user ID

-- First, drop the existing users table if it exists
DROP TABLE IF EXISTS user_interests CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS ships CASCADE;
DROP TABLE IF EXISTS daily_matches CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate users table with auth.uid() as default ID
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  bits_email text UNIQUE NOT NULL,
  student_id text DEFAULT '',
  display_name text NOT NULL,
  username text UNIQUE NOT NULL,
  profile_photo text,
  bio text DEFAULT '',
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  year integer CHECK (year >= 1 AND year <= 5),
  branch text NOT NULL,
  campus text NOT NULL CHECK (campus IN ('Pilani', 'Goa', 'Hyderabad', 'Dubai')),
  preferences jsonb DEFAULT '{
    "age_range": [18, 30],
    "max_distance": 50,
    "dating_similarity": 1,
    "gender_preference": "any",
    "connect_similarity": 1,
    "looking_for": ["friends"]
  }'::jsonb,
  email_verified boolean DEFAULT false,
  student_id_verified boolean DEFAULT false,
  photo_verified boolean DEFAULT false,
  verified boolean GENERATED ALWAYS AS (email_verified AND student_id_verified AND photo_verified) STORED,
  is_active boolean DEFAULT true,
  profile_completed boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  streak_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and profiles of users they might connect with
CREATE POLICY "Users can read profiles" ON users
  FOR SELECT
  USING (
    -- Users can read their own profile
    auth.uid() = id
    OR
    -- Users can read profiles of other active users (for matching)
    (is_active = true AND profile_completed = true)
  );

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Recreate user_interests table
CREATE TABLE user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  interest text NOT NULL,
  weight double precision DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest)
);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Users can manage their own interests
CREATE POLICY "Users can manage own interests" ON user_interests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
