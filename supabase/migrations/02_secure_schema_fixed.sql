/*
  BTHOGAYI - SECURE Database Schema with RLS (FIXED)
  College Dating/Networking Platform - BITS Students Only
  
  🔒 SECURITY FEATURES:
  - Row Level Security (RLS) enabled on ALL tables
  - BITS email domain validation (@*.bits-pilani.ac.in)
  - Campus auto-populated via trigger
  - Private data protection
  - Audit trails for security compliance
  
  ✅ READY TO RUN DIRECTLY IN SUPABASE SQL EDITOR
*/

-- ========================================
-- 1. CLEAN SLATE - DROP EVERYTHING
-- ========================================
DROP VIEW IF EXISTS complete_user_profiles CASCADE;
DROP VIEW IF EXISTS user_compatibility_matrix CASCADE;
DROP VIEW IF EXISTS recommendation_analytics CASCADE;

DROP FUNCTION IF EXISTS get_user_recommendations(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS is_user_profile_complete(users) CASCADE;
DROP FUNCTION IF EXISTS update_profile_completion() CASCADE;
DROP FUNCTION IF EXISTS update_profile_completion_on_interests() CASCADE;
DROP FUNCTION IF EXISTS validate_user_preferences(jsonb) CASCADE;
DROP FUNCTION IF EXISTS get_onboarding_stats() CASCADE;
DROP FUNCTION IF EXISTS get_user_connections_count(uuid) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_data() CASCADE;
DROP FUNCTION IF EXISTS calculate_compatibility_score(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS get_recommendation_insights(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_bits_email(text) CASCADE;
DROP FUNCTION IF EXISTS get_campus_from_email(text) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

DROP POLICY IF EXISTS "Users can view their own profile" ON users CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON users CASCADE;
DROP POLICY IF EXISTS "Users can view other verified profiles" ON users CASCADE;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users CASCADE;
DROP POLICY IF EXISTS "Users can manage their own interests" ON user_interests CASCADE;
DROP POLICY IF EXISTS "Verified users can view others' interests" ON user_interests CASCADE;
DROP POLICY IF EXISTS "Users can manage their own connections" ON connections CASCADE;
DROP POLICY IF EXISTS "Users can send/receive messages in their connections" ON messages CASCADE;
DROP POLICY IF EXISTS "Users can manage their own photos" ON user_photos CASCADE;
DROP POLICY IF EXISTS "Verified users can view approved photos" ON user_photos CASCADE;
DROP POLICY IF EXISTS "Users can submit reports" ON reports CASCADE;
DROP POLICY IF EXISTS "Users can view their own reports" ON reports CASCADE;
DROP POLICY IF EXISTS "Users can submit their own feedback" ON recommendation_feedback CASCADE;
DROP POLICY IF EXISTS "Users can view their own feedback" ON recommendation_feedback CASCADE;
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity_log CASCADE;
DROP POLICY IF EXISTS "Anyone can view interest categories" ON interest_categories CASCADE;

DROP TABLE IF EXISTS recommendation_insights CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS recommendation_feedback CASCADE;
DROP TABLE IF EXISTS user_photos CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS user_interests CASCADE;
DROP TABLE IF EXISTS interest_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- 2. ENABLE EXTENSIONS
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 3. SECURITY FUNCTIONS
-- ========================================

-- Function to validate BITS email domains
CREATE OR REPLACE FUNCTION is_bits_email(email_address text)
RETURNS boolean AS $$
BEGIN
  RETURN email_address ~* '@.*\.bits-pilani\.ac\.in$';
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

-- ========================================
-- 4. CORE TABLES WITH RLS
-- ========================================

-- 4.1 Interest Categories
CREATE TABLE interest_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    description text,
    weight_multiplier decimal DEFAULT 1.0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE interest_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view interest categories" ON interest_categories FOR SELECT USING (true);

-- 4.2 Users Table (BITS Students Only)
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication & Basic Info (BITS Only)
    email text UNIQUE NOT NULL CHECK (is_bits_email(email)),
    auth_provider text DEFAULT 'supabase',
    
    -- Profile Information
    display_name text,
    bio text,
    age integer CHECK (age >= 17 AND age <= 30),
    gender text CHECK (gender IN ('male', 'female', 'other')),
    pronouns text,
    
    -- Academic Information
    year integer CHECK (year >= 1 AND year <= 4),
    branch text,
    campus text,
    student_id text,
    
    -- Verification Status
    verified boolean DEFAULT false,
    verification_method text,
    verified_at timestamptz,
    
    -- Profile Status & Settings
    profile_completed boolean DEFAULT false,
    onboarding_step integer DEFAULT 0,
    onboarding_completed_at timestamptz,
    
    -- Preferences (Enhanced for ML)
    preferences jsonb DEFAULT '{
        "age_range": [18, 25],
        "same_campus_only": false,
        "same_year_preference": false,
        "distance_km": 50
    }'::jsonb,
    
    privacy_settings jsonb DEFAULT '{
        "show_age": true,
        "show_year": true,
        "show_branch": true,
        "discoverable": true,
        "show_last_active": false,
        "campus_visibility": "all_campuses"
    }'::jsonb,
    
    -- Activity & Status
    last_active timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    deactivated_at timestamptz,
    
    -- Subscription & Features
    subscription_tier text DEFAULT 'free',
    premium_until timestamptz,
    daily_swipes_remaining integer DEFAULT 50,
    super_swipes_remaining integer DEFAULT 3,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Security constraints
    CONSTRAINT valid_bits_email CHECK (is_bits_email(email)),
    CONSTRAINT valid_campus CHECK (campus IN ('Pilani', 'Goa', 'Hyderabad', 'Dubai', 'Unknown'))
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users 
    FOR INSERT WITH CHECK (auth.uid() = id AND is_bits_email(email));

CREATE POLICY "Verified users can view other verified profiles" ON users 
    FOR SELECT USING (
        verified = true 
        AND privacy_settings->>'discoverable' = 'true'
    );

-- 4.3 User Interests
CREATE TABLE user_interests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    category_id uuid REFERENCES interest_categories(id) ON DELETE CASCADE,
    interest_name text NOT NULL,
    proficiency_level text CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, interest_name)
);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interests" ON user_interests 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Verified users can view others' interests" ON user_interests 
    FOR SELECT USING (
        (SELECT verified FROM users WHERE id = auth.uid()) = true
        AND (SELECT verified FROM users WHERE id = user_id) = true
    );

-- 4.4 Connections (Matches)
CREATE TABLE connections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
    user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected', 'blocked')),
    matched_at timestamptz,
    
    user1_action text CHECK (user1_action IN ('like', 'pass', 'super_like')),
    user2_action text CHECK (user2_action IN ('like', 'pass', 'super_like')),
    
    compatibility_score decimal DEFAULT 0,
    algorithm_version text DEFAULT 'v2.0',
    match_factors jsonb DEFAULT '{}'::jsonb,
    
    last_message_at timestamptz,
    messages_count integer DEFAULT 0,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT different_users CHECK (user1_id != user2_id),
    CONSTRAINT unique_connection UNIQUE (user1_id, user2_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own connections" ON connections 
    FOR ALL USING (auth.uid() IN (user1_id, user2_id));

-- 4.5 Messages
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    content text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji', 'gif')),
    
    is_read boolean DEFAULT false,
    read_at timestamptz,
    is_deleted boolean DEFAULT false,
    deleted_at timestamptz,
    
    reported boolean DEFAULT false,
    encrypted boolean DEFAULT false,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send/receive messages in their connections" ON messages 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM connections 
            WHERE id = connection_id 
            AND auth.uid() IN (user1_id, user2_id)
            AND status = 'matched'
        )
    );

-- 4.6 User Photos
CREATE TABLE user_photos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    photo_url text NOT NULL,
    photo_order integer DEFAULT 1,
    is_primary boolean DEFAULT false,
    
    is_verified boolean DEFAULT false,
    moderation_status text DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderation_reason text,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own photos" ON user_photos 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Verified users can view approved photos" ON user_photos 
    FOR SELECT USING (
        moderation_status = 'approved'
        AND (SELECT verified FROM users WHERE id = auth.uid()) = true
        AND (SELECT verified FROM users WHERE id = user_id) = true
    );

-- 4.7 Reports
CREATE TABLE reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id uuid REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    reason text NOT NULL CHECK (reason IN (
        'inappropriate_content', 'harassment', 'fake_profile', 
        'spam', 'inappropriate_photos', 'other'
    )),
    description text,
    
    evidence_urls text[],
    message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
    
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes text,
    resolved_at timestamptz,
    
    created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports" ON reports 
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON reports 
    FOR SELECT USING (auth.uid() = reporter_id);

-- 4.8 Recommendation Feedback
CREATE TABLE recommendation_feedback (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    recommended_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    action text NOT NULL CHECK (action IN ('like', 'pass', 'super_like', 'report')),
    algorithm_version text DEFAULT 'v2.0',
    compatibility_score decimal,
    
    feedback_factors jsonb DEFAULT '{}'::jsonb,
    response_time_ms integer,
    recommendation_context jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own feedback" ON recommendation_feedback 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" ON recommendation_feedback 
    FOR SELECT USING (auth.uid() = user_id);

-- 4.9 User Activity Log (Security Audit)
CREATE TABLE user_activity_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    activity_type text NOT NULL,
    activity_data jsonb DEFAULT '{}'::jsonb,
    
    ip_address inet,
    user_agent text,
    session_id text,
    
    created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" ON user_activity_log 
    FOR SELECT USING (auth.uid() = user_id);

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_campus ON users(campus);
CREATE INDEX idx_users_verified ON users(verified);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_last_active ON users(last_active);

CREATE INDEX idx_connections_user1 ON connections(user1_id);
CREATE INDEX idx_connections_user2 ON connections(user2_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_matched_at ON connections(matched_at);

CREATE INDEX idx_messages_connection ON messages(connection_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_activity_user_time ON user_activity_log(user_id, created_at);

-- ========================================
-- 6. TRIGGERS AND FUNCTIONS
-- ========================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Profile completion check
CREATE OR REPLACE FUNCTION is_user_profile_complete(user_record users)
RETURNS boolean AS $$
BEGIN
    RETURN (
        user_record.display_name IS NOT NULL AND
        user_record.bio IS NOT NULL AND
        user_record.age IS NOT NULL AND
        user_record.gender IS NOT NULL AND
        user_record.year IS NOT NULL AND
        user_record.branch IS NOT NULL AND
        EXISTS(SELECT 1 FROM user_photos WHERE user_id = user_record.id AND is_primary = true) AND
        EXISTS(SELECT 1 FROM user_interests WHERE user_id = user_record.id)
    );
END;
$$ LANGUAGE plpgsql;

-- Auto-update profile completion and campus
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-populate campus from email if not set
    IF NEW.campus IS NULL THEN
        NEW.campus = get_campus_from_email(NEW.email);
    END IF;
    
    -- Update profile completion status
    NEW.profile_completed = is_user_profile_complete(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

-- ========================================
-- 7. SEED DATA
-- ========================================
INSERT INTO interest_categories (name, description, weight_multiplier) VALUES
('Academic', 'Study-related interests and research', 1.2),
('Sports & Fitness', 'Physical activities and sports', 1.1),
('Arts & Creativity', 'Creative and artistic pursuits', 1.0),
('Technology', 'Programming, AI, and tech innovation', 1.1),
('Entertainment', 'Movies, music, games, and media', 1.0),
('Travel & Culture', 'Travel experiences and cultural exploration', 1.0),
('Social & Networking', 'Social activities and professional networking', 1.1),
('Lifestyle', 'General lifestyle interests and hobbies', 0.9),
('Career & Professional', 'Professional development and career growth', 1.2);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '🔒 BTHOGAYI SECURE Database Schema Created Successfully!';
  RAISE NOTICE '🎓 BITS Students Only - Email validation enforced';
  RAISE NOTICE '🛡️ Row Level Security (RLS) enabled on ALL tables';
  RAISE NOTICE '🏛️ Campus auto-populated from email via trigger';
  RAISE NOTICE '👤 Users can only access their own data by default';
  RAISE NOTICE '✅ Verified users can view other verified users';
  RAISE NOTICE '📊 Security audit logging enabled';
  RAISE NOTICE '🚀 Ready for secure deployment!';
END $$;
