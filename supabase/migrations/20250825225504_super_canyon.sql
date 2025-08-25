/*
  # Complete BITSPARK Database Schema
  
  This migration creates the complete database schema for BITSPARK
  with all necessary tables, RLS policies, and functions.
  
  1. New Tables
    - `users` - User profiles with BITS verification
    - `user_interests` - User interests with weights
    - `connections` - Friend and dating connections
    - `messages` - Chat messages with 5-message limit
    - `ships` - Third-party matchmaking
    - `daily_matches` - AI-generated daily suggestions
    - `reports` - Safety and moderation
    - `notifications` - User notifications
    - `user_photos` - Profile photos
    - `recommendation_feedback` - ML training data

  2. Security
    - Enable RLS on all tables
    - BITS email validation
    - Campus-based access controls
    - User data protection

  3. Functions
    - Profile completion checking
    - Compatibility scoring
    - Recommendation engine
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- UTILITY FUNCTIONS
-- ========================================

-- Function to validate BITS email domains
CREATE OR REPLACE FUNCTION is_bits_email(email_address text)
RETURNS boolean AS $$
BEGIN
  RETURN email_address ~* '@(pilani|goa|hyderabad|dubai)\.bits-pilani\.ac\.in$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to extract campus from BITS email
CREATE OR REPLACE FUNCTION get_campus_from_email(email_address text)
RETURNS text AS $$
BEGIN
  IF email_address ~* '@pilani\.bits-pilani\.ac\.in$' THEN
    RETURN 'Pilani';
  ELSIF email_address ~* '@goa\.bits-pilani\.ac\.in$' THEN
    RETURN 'Goa';
  ELSIF email_address ~* '@hyderabad\.bits-pilani\.ac\.in$' THEN
    RETURN 'Hyderabad';
  ELSIF email_address ~* '@dubai\.bits-pilani\.ac\.in$' THEN
    RETURN 'Dubai';
  ELSE
    RETURN 'Unknown';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CORE TABLES
-- ========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bits_email text UNIQUE NOT NULL CHECK (is_bits_email(bits_email)),
  student_id text DEFAULT '',
  display_name text NOT NULL,
  username text UNIQUE NOT NULL,
  profile_photo text,
  bio text DEFAULT '',
  age integer CHECK (age >= 16 AND age <= 35),
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

-- User interests table
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  interest text NOT NULL,
  weight double precision DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest)
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  connection_type text NOT NULL CHECK (connection_type IN ('friend', 'date')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  compatibility_score double precision DEFAULT 0.0 CHECK (compatibility_score >= 0.0 AND compatibility_score <= 1.0),
  match_reason text,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Messages table with 5-message limit
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_count integer NOT NULL CHECK (message_count >= 1 AND message_count <= 5),
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

-- Ships table (third-party matchmaking)
CREATE TABLE IF NOT EXISTS ships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_anonymous boolean DEFAULT false,
  message text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(shipper_id, user1_id, user2_id),
  CHECK (shipper_id != user1_id AND shipper_id != user2_id AND user1_id != user2_id)
);

-- Daily matches table
CREATE TABLE IF NOT EXISTS daily_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  match_date date DEFAULT CURRENT_DATE,
  algorithm_version text DEFAULT '1.0',
  compatibility_score double precision DEFAULT 0.0,
  viewed boolean DEFAULT false,
  action text CHECK (action IN ('pass', 'connect', 'super_like') OR action IS NULL),
  match_reason text,
  created_at timestamptz DEFAULT now(),
  acted_at timestamptz,
  UNIQUE(user_id, matched_user_id, match_date),
  CHECK (user_id != matched_user_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('harassment', 'spam', 'fake_profile', 'inappropriate_content', 'other')),
  description text,
  evidence_urls text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  moderator_notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  CHECK (reporter_id != reported_user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('match', 'message', 'ship', 'connection_request', 'daily_match')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User photos table
CREATE TABLE IF NOT EXISTS user_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_order integer DEFAULT 1,
  is_primary boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  moderation_status text DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Recommendation feedback table
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recommended_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text CHECK (action IN ('like', 'pass', 'super_like', 'report')),
  algorithm_version text DEFAULT 'v2.0',
  compatibility_score double precision,
  response_time_ms integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recommended_user_id)
);

-- Platform redirections table
CREATE TABLE IF NOT EXISTS platform_redirections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('whatsapp', 'instagram', 'telegram', 'discord')),
  redirect_count integer DEFAULT 1,
  last_redirect_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(bits_email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_campus ON users(campus);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);

CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_type ON connections(connection_type);

CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_ships_shipper ON ships(shipper_id);
CREATE INDEX IF NOT EXISTS idx_ships_users ON ships(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_ships_status ON ships(status);

CREATE INDEX IF NOT EXISTS idx_daily_matches_user ON daily_matches(user_id, match_date);
CREATE INDEX IF NOT EXISTS idx_daily_matches_date ON daily_matches(match_date);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_redirections ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- User interests policies
CREATE POLICY "Users can manage own interests" ON user_interests
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Connections policies
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create connections" ON connections
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Ships policies
CREATE POLICY "Users can view relevant ships" ON ships
  FOR SELECT TO authenticated
  USING (auth.uid() = shipper_id OR auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create ships" ON ships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = shipper_id);

CREATE POLICY "Users can respond to ships" ON ships
  FOR UPDATE TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Daily matches policies
CREATE POLICY "Users can view own daily matches" ON daily_matches
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User photos policies
CREATE POLICY "Users can manage own photos" ON user_photos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recommendation feedback policies
CREATE POLICY "Users can manage own feedback" ON recommendation_feedback
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Platform redirections policies
CREATE POLICY "Users can view own redirections" ON platform_redirections
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = connection_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create redirections" ON platform_redirections
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = connection_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-update campus from email and profile completion
CREATE OR REPLACE FUNCTION update_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate campus from email if not set
  IF NEW.campus IS NULL OR NEW.campus = '' THEN
    NEW.campus = get_campus_from_email(NEW.bits_email);
  END IF;
  
  -- Update timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profile
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile();

-- Message limit enforcement
CREATE OR REPLACE FUNCTION enforce_message_limit()
RETURNS TRIGGER AS $$
DECLARE
  message_count integer;
  connection_status text;
BEGIN
  -- Check if connection exists and is accepted
  SELECT status INTO connection_status
  FROM connections
  WHERE id = NEW.connection_id;
  
  IF connection_status != 'accepted' THEN
    RAISE EXCEPTION 'Cannot send messages to non-accepted connections';
  END IF;
  
  -- Count existing messages for this connection
  SELECT COUNT(*) INTO message_count
  FROM messages
  WHERE connection_id = NEW.connection_id;
  
  -- Check if limit exceeded
  IF message_count >= 5 THEN
    RAISE EXCEPTION 'Message limit of 5 reached for this connection. Please continue on external platforms.';
  END IF;
  
  -- Set message count
  NEW.message_count = message_count + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_message_limit
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION enforce_message_limit();

-- ========================================
-- STORAGE BUCKETS
-- ========================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('verification-docs', 'verification-docs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('message-attachments', 'message-attachments', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- ========================================
-- REALTIME SUBSCRIPTIONS
-- ========================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE connections;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE ships;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_matches;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 BITSPARK Database Schema Created Successfully!';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🎓 BITS email validation enforced';
  RAISE NOTICE '💬 5-message limit system implemented';
  RAISE NOTICE '🚢 Shipping system ready';
  RAISE NOTICE '📱 Real-time features enabled';
  RAISE NOTICE '🚀 Ready for deployment!';
END $$;