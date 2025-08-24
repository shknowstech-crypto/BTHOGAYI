/*
  BTHOGAYI - Complete Fresh Database Schema
  College Dating/Networking Platform
  
  This script drops all existing tables and creates a fresh, optimized schema
  designed for scalability and future recommendation engine improvements.
*/

-- ========================================
-- 1. CLEAN SLATE - DROP EVERYTHING
-- ========================================

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS complete_user_profiles CASCADE;
DROP VIEW IF EXISTS user_compatibility_matrix CASCADE;
DROP VIEW IF EXISTS recommendation_analytics CASCADE;

-- Drop all functions that depend on tables
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

-- Drop all tables (CASCADE will handle foreign keys)
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
-- 3. CORE TABLES
-- ========================================

-- 3.1 Interest Categories (for better recommendation logic)
CREATE TABLE interest_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    description text,
    weight_multiplier decimal DEFAULT 1.0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 3.2 Users Table (Complete Profile Management)
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication & Basic Info
    email text UNIQUE NOT NULL,
    auth_provider text DEFAULT 'supabase',
    
    -- Profile Information
    display_name text,
    bio text,
    age integer,
    gender text CHECK (gender IN ('male', 'female', 'other')),
    pronouns text,
    
    -- Academic Information
    year integer CHECK (year >= 1 AND year <= 4),
    branch text,
    campus text,
    student_id text,
    
    -- Profile Status & Settings
    profile_completed boolean DEFAULT false,
    onboarding_step integer DEFAULT 0,
    onboarding_completed_at timestamptz,
    
    -- Preferences (Enhanced for ML)
    preferences jsonb DEFAULT '{}'::jsonb,
    privacy_settings jsonb DEFAULT '{
        "show_age": true,
        "show_year": true,
        "show_branch": true,
        "discoverable": true,
        "show_last_active": false
    }'::jsonb,
    
    -- Activity & Status
    is_active boolean DEFAULT true,
    verified boolean DEFAULT false,
    last_active_at timestamptz DEFAULT now(),
    subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'plus')),
    
    -- Recommendation Engine Data
    recommendation_score decimal DEFAULT 0.0,
    interaction_count integer DEFAULT 0,
    match_success_rate decimal DEFAULT 0.0,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_age_range CHECK (age IS NULL OR (age >= 16 AND age <= 35)),
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 3.3 User Interests (Enhanced for ML)
CREATE TABLE user_interests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    interest text NOT NULL,
    category_id uuid REFERENCES interest_categories(id),
    
    -- ML Enhancement Fields
    weight decimal DEFAULT 1.0,
    source text DEFAULT 'manual' CHECK (source IN ('manual', 'inferred', 'imported')),
    confidence_score decimal DEFAULT 1.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id, interest)
);

-- 3.4 Connections (Dating/Networking)
CREATE TABLE connections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id uuid REFERENCES users(id) ON DELETE CASCADE,
    user2_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    -- Connection Management
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked', 'expired')),
    connection_type text DEFAULT 'dating' CHECK (connection_type IN ('dating', 'friends', 'networking', 'study_buddy')),
    
    -- Interaction Data
    initiated_by uuid REFERENCES users(id),
    compatibility_score decimal,
    mutual_interests_count integer DEFAULT 0,
    
    -- Activity Tracking
    last_interaction_at timestamptz,
    interaction_count integer DEFAULT 0,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    
    -- Constraints
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id != user2_id),
    CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- 3.5 Messages (Enhanced Chat System)
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message Content
    content text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'system')),
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Message Status
    read_at timestamptz,
    edited boolean DEFAULT false,
    edited_at timestamptz,
    deleted boolean DEFAULT false,
    
    -- AI/Safety Features
    toxicity_score decimal DEFAULT 0.0,
    flagged boolean DEFAULT false,
    
    created_at timestamptz DEFAULT now()
);

-- 3.6 User Photos (Profile Management)
CREATE TABLE user_photos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    -- Photo Information
    photo_url text NOT NULL,
    thumbnail_url text,
    is_primary boolean DEFAULT false,
    upload_order integer DEFAULT 1,
    
    -- Photo Metadata
    file_size integer,
    mime_type text,
    width integer,
    height integer,
    
    -- Moderation
    is_approved boolean DEFAULT false,
    moderation_status text DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    rejection_reason text,
    
    created_at timestamptz DEFAULT now(),
    
    -- Ensure only one primary photo per user
    CONSTRAINT unique_primary_photo UNIQUE (user_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- 3.7 Recommendation Feedback (ML Training Data)
CREATE TABLE recommendation_feedback (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    recommended_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    -- User Action
    action text NOT NULL CHECK (action IN ('like', 'pass', 'super_like', 'report', 'block')),
    
    -- ML Enhancement Data
    recommendation_algorithm text DEFAULT 'v1',
    compatibility_score decimal,
    response_time_ms integer,
    user_session_id uuid,
    
    -- Context Information
    context_data jsonb DEFAULT '{}'::jsonb, -- Device, time of day, etc.
    
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id, recommended_user_id)
);

-- 3.8 Reports (User Safety)
CREATE TABLE reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id uuid REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    -- Report Details
    reason text NOT NULL,
    description text,
    evidence_urls text[],
    
    -- Processing
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Resolution
    resolved_at timestamptz,
    resolved_by uuid REFERENCES users(id),
    resolution_notes text,
    action_taken text,
    
    created_at timestamptz DEFAULT now()
);

-- 3.9 User Activity Log (Analytics & ML)
CREATE TABLE user_activity_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity Information
    activity_type text NOT NULL,
    activity_data jsonb DEFAULT '{}'::jsonb,
    
    -- Context
    session_id uuid,
    ip_address inet,
    user_agent text,
    
    created_at timestamptz DEFAULT now()
);

-- 3.10 Recommendation Insights (Advanced Analytics)
CREATE TABLE recommendation_insights (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    
    -- Insight Data
    insight_type text NOT NULL,
    insight_data jsonb NOT NULL,
    confidence_score decimal DEFAULT 0.0,
    
    -- Versioning
    algorithm_version text DEFAULT 'v1',
    generated_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    
    -- Status
    is_active boolean DEFAULT true,
    
    created_at timestamptz DEFAULT now()
);

-- ========================================
-- 4. INDEXES FOR PERFORMANCE
-- ========================================

-- User indexes
CREATE INDEX idx_users_active_verified ON users(is_active, verified, profile_completed) WHERE is_active = true;
CREATE INDEX idx_users_campus_year ON users(campus, year) WHERE is_active = true AND verified = true;
CREATE INDEX idx_users_preferences_gin ON users USING gin (preferences) WHERE is_active = true;
CREATE INDEX idx_users_last_active ON users(last_active_at DESC) WHERE is_active = true;
CREATE INDEX idx_users_recommendation_score ON users(recommendation_score DESC) WHERE is_active = true;

-- Interest indexes
CREATE INDEX idx_user_interests_lookup ON user_interests(user_id, interest);
CREATE INDEX idx_user_interests_category ON user_interests(category_id, weight DESC);
CREATE INDEX idx_user_interests_confidence ON user_interests(confidence_score DESC, weight DESC);

-- Connection indexes
CREATE INDEX idx_connections_user_status ON connections(user1_id, user2_id, status);
CREATE INDEX idx_connections_type_status ON connections(connection_type, status, created_at DESC);
CREATE INDEX idx_connections_compatibility ON connections(compatibility_score DESC) WHERE status = 'accepted';

-- Message indexes
CREATE INDEX idx_messages_connection_time ON messages(connection_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(connection_id, read_at) WHERE read_at IS NULL;

-- Recommendation indexes
CREATE INDEX idx_recommendation_feedback_user ON recommendation_feedback(user_id, action, created_at DESC);
CREATE INDEX idx_recommendation_feedback_algorithm ON recommendation_feedback(recommendation_algorithm, compatibility_score);

-- Activity indexes
CREATE INDEX idx_activity_log_user_time ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_type ON user_activity_log(activity_type, created_at DESC);

-- ========================================
-- 5. FUNCTIONS & TRIGGERS
-- ========================================

-- 5.1 Preference Validation Function
CREATE OR REPLACE FUNCTION validate_user_preferences(preferences jsonb)
RETURNS boolean AS $$
BEGIN
  -- Allow NULL or empty preferences
  IF preferences IS NULL OR preferences = '{}'::jsonb THEN
    RETURN true;
  END IF;
  
  -- Validate looking_for field
  IF preferences ? 'looking_for' AND 
     jsonb_typeof(preferences->'looking_for') = 'array' THEN
    RETURN true;
  END IF;
  
  -- Add more validation rules as needed
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 5.2 Profile Completion Check
CREATE OR REPLACE FUNCTION is_user_profile_complete(user_row users)
RETURNS boolean AS $$
BEGIN
  RETURN (
    user_row.display_name IS NOT NULL AND user_row.display_name != '' AND
    user_row.bio IS NOT NULL AND user_row.bio != '' AND
    user_row.age IS NOT NULL AND
    user_row.gender IS NOT NULL AND
    user_row.year IS NOT NULL AND
    user_row.branch IS NOT NULL AND user_row.branch != '' AND
    user_row.campus IS NOT NULL AND user_row.campus != '' AND
    user_row.preferences IS NOT NULL AND
    user_row.preferences ? 'looking_for' AND
    jsonb_array_length(user_row.preferences->'looking_for') > 0 AND
    EXISTS (
      SELECT 1 FROM user_interests 
      WHERE user_id = user_row.id 
      HAVING count(*) >= 3
    ) AND
    EXISTS (
      SELECT 1 FROM user_photos 
      WHERE user_id = user_row.id AND is_approved = true
      LIMIT 1
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 5.3 Advanced Compatibility Calculation
CREATE OR REPLACE FUNCTION calculate_compatibility_score(user1_id uuid, user2_id uuid)
RETURNS decimal AS $$
DECLARE
  user1_rec users;
  user2_rec users;
  score decimal := 0.0;
  shared_interests integer := 0;
  total_interests integer := 0;
BEGIN
  -- Get user records
  SELECT * INTO user1_rec FROM users WHERE id = user1_id;
  SELECT * INTO user2_rec FROM users WHERE id = user2_id;
  
  -- Campus match (30% weight)
  IF user1_rec.campus = user2_rec.campus THEN
    score := score + 0.30;
  END IF;
  
  -- Year proximity (20% weight)
  IF ABS(user1_rec.year - user2_rec.year) <= 1 THEN
    score := score + 0.20;
  ELSIF ABS(user1_rec.year - user2_rec.year) = 2 THEN
    score := score + 0.10;
  END IF;
  
  -- Age compatibility (15% weight)
  IF ABS(user1_rec.age - user2_rec.age) <= 2 THEN
    score := score + 0.15;
  ELSIF ABS(user1_rec.age - user2_rec.age) <= 4 THEN
    score := score + 0.075;
  END IF;
  
  -- Interest overlap (35% weight)
  SELECT 
    COUNT(CASE WHEN ui2.interest IS NOT NULL THEN 1 END),
    COUNT(ui1.interest)
  INTO shared_interests, total_interests
  FROM user_interests ui1
  LEFT JOIN user_interests ui2 ON ui1.interest = ui2.interest AND ui2.user_id = user2_id
  WHERE ui1.user_id = user1_id;
  
  IF total_interests > 0 THEN
    score := score + (0.35 * (shared_interests::decimal / total_interests::decimal));
  END IF;
  
  RETURN ROUND(LEAST(1.0, score), 3);
END;
$$ LANGUAGE plpgsql;

-- 5.4 Profile Update Trigger
CREATE OR REPLACE FUNCTION update_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile completion status
  NEW.profile_completed = is_user_profile_complete(NEW);
  NEW.updated_at = now();
  
  -- Set onboarding completion timestamp
  IF NEW.profile_completed = true AND (OLD.profile_completed = false OR OLD.profile_completed IS NULL) THEN
    NEW.onboarding_completed_at = now();
  END IF;
  
  -- Update last active
  NEW.last_active_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.5 Interest Update Trigger
CREATE OR REPLACE FUNCTION update_profile_on_interests()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user profile completion
  UPDATE users 
  SET profile_completed = is_user_profile_complete(users.*),
      updated_at = now()
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. CREATE TRIGGERS
-- ========================================

-- User profile triggers
CREATE TRIGGER trigger_update_user_profile
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile();

-- Interest triggers
CREATE TRIGGER trigger_interests_insert
  AFTER INSERT ON user_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_on_interests();

CREATE TRIGGER trigger_interests_delete
  AFTER DELETE ON user_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_on_interests();

-- ========================================
-- 7. VIEWS FOR RECOMMENDATIONS
-- ========================================

-- 7.1 Complete User Profiles View
CREATE VIEW complete_user_profiles AS
SELECT 
  u.*,
  COALESCE(
    array_agg(ui.interest ORDER BY ui.weight DESC, ui.confidence_score DESC) 
    FILTER (WHERE ui.interest IS NOT NULL), 
    ARRAY[]::text[]
  ) as interests_array,
  COUNT(ui.interest) as interests_count,
  COALESCE(
    array_agg(ic.name ORDER BY ui.weight DESC) 
    FILTER (WHERE ic.name IS NOT NULL), 
    ARRAY[]::text[]
  ) as interest_categories,
  up.photo_url as primary_photo,
  up.thumbnail_url as primary_thumbnail
FROM users u
LEFT JOIN user_interests ui ON u.id = ui.user_id
LEFT JOIN interest_categories ic ON ui.category_id = ic.id
LEFT JOIN user_photos up ON u.id = up.user_id AND up.is_primary = true AND up.is_approved = true
WHERE u.is_active = true 
  AND u.verified = true 
  AND u.profile_completed = true
GROUP BY u.id, up.photo_url, up.thumbnail_url;

-- 7.2 Recommendation Analytics View
CREATE VIEW recommendation_analytics AS
SELECT 
  u.id as user_id,
  u.display_name,
  COUNT(rf.id) as total_recommendations_received,
  COUNT(rf.id) FILTER (WHERE rf.action = 'like') as likes_received,
  COUNT(rf.id) FILTER (WHERE rf.action = 'pass') as passes_received,
  COUNT(rf.id) FILTER (WHERE rf.action = 'super_like') as super_likes_received,
  ROUND(
    COUNT(rf.id) FILTER (WHERE rf.action = 'like')::decimal / 
    NULLIF(COUNT(rf.id), 0) * 100, 
    2
  ) as like_rate,
  AVG(rf.compatibility_score) as avg_compatibility_score
FROM users u
LEFT JOIN recommendation_feedback rf ON u.id = rf.recommended_user_id
WHERE u.is_active = true
GROUP BY u.id, u.display_name;

-- ========================================
-- 8. ADVANCED RECOMMENDATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION get_user_recommendations(
  target_user_id uuid,
  limit_count integer DEFAULT 10,
  algorithm_version text DEFAULT 'v2'
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  bio text,
  age integer,
  year integer,
  branch text,
  campus text,
  primary_photo text,
  primary_thumbnail text,
  interests_array text[],
  interest_categories text[],
  compatibility_score decimal,
  recommendation_reason text
) AS $$
BEGIN
  RETURN QUERY
  WITH candidate_users AS (
    SELECT 
      p.*,
      calculate_compatibility_score(target_user_id, p.id) as calc_compatibility_score
    FROM complete_user_profiles p
    WHERE p.id != target_user_id
      AND NOT EXISTS (
        -- Exclude already connected users
        SELECT 1 FROM connections c 
        WHERE ((c.user1_id = target_user_id AND c.user2_id = p.id) OR 
               (c.user2_id = target_user_id AND c.user1_id = p.id))
          AND c.status NOT IN ('declined', 'expired')
      )
      AND NOT EXISTS (
        -- Exclude recently passed users (24 hours)
        SELECT 1 FROM recommendation_feedback rf
        WHERE rf.user_id = target_user_id 
          AND rf.recommended_user_id = p.id 
          AND rf.action = 'pass'
          AND rf.created_at > now() - interval '24 hours'
      )
      AND NOT EXISTS (
        -- Exclude blocked users
        SELECT 1 FROM recommendation_feedback rf
        WHERE rf.user_id = target_user_id 
          AND rf.recommended_user_id = p.id 
          AND rf.action IN ('report', 'block')
      )
  ),
  target_user_data AS (
    SELECT * FROM complete_user_profiles WHERE id = target_user_id
  )
  SELECT 
    cu.id,
    cu.display_name,
    cu.bio,
    cu.age,
    cu.year,
    cu.branch,
    cu.campus,
    cu.primary_photo,
    cu.primary_thumbnail,
    cu.interests_array,
    cu.interest_categories,
    cu.calc_compatibility_score,
    CASE 
      WHEN target.campus = cu.campus AND ABS(target.year - cu.year) <= 1 THEN 'Same campus, similar year'
      WHEN target.campus = cu.campus THEN 'Same campus'
      WHEN ABS(target.year - cu.year) <= 1 THEN 'Similar academic year'
      WHEN array_length(ARRAY(SELECT unnest(target.interests_array) INTERSECT SELECT unnest(cu.interests_array)), 1) >= 3 THEN 'Many shared interests'
      WHEN array_length(ARRAY(SELECT unnest(target.interests_array) INTERSECT SELECT unnest(cu.interests_array)), 1) >= 1 THEN 'Shared interests'
      ELSE 'Potential match'
    END as recommendation_reason
  FROM candidate_users cu
  CROSS JOIN target_user_data target
  WHERE target.preferences->'looking_for' ?| ARRAY(SELECT jsonb_array_elements_text(cu.preferences->'looking_for'))
  ORDER BY 
    cu.calc_compatibility_score DESC,
    RANDOM() -- Add some randomness for variety
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 9. ANALYTICS & UTILITY FUNCTIONS
-- ========================================

-- 9.1 Onboarding Statistics
CREATE OR REPLACE FUNCTION get_onboarding_stats()
RETURNS TABLE (
  total_users bigint,
  completed_profiles bigint,
  incomplete_profiles bigint,
  avg_completion_time interval,
  completion_rate decimal,
  avg_interests_per_user decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE profile_completed = true) as completed_profiles,
    COUNT(*) FILTER (WHERE profile_completed = false) as incomplete_profiles,
    AVG(onboarding_completed_at - created_at) FILTER (WHERE onboarding_completed_at IS NOT NULL) as avg_completion_time,
    ROUND(
      COUNT(*) FILTER (WHERE profile_completed = true)::decimal / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as completion_rate,
    (SELECT ROUND(AVG(interests_count), 2) FROM complete_user_profiles) as avg_interests_per_user
  FROM users
  WHERE created_at >= now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- 9.2 Platform Analytics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  active_users bigint,
  total_connections bigint,
  successful_matches bigint,
  messages_sent_today bigint,
  avg_response_rate decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT u.id) as active_users,
    COUNT(DISTINCT c.id) as total_connections,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'accepted') as successful_matches,
    COUNT(DISTINCT m.id) FILTER (WHERE m.created_at >= current_date) as messages_sent_today,
    ROUND(
      COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'accepted')::decimal /
      NULLIF(COUNT(DISTINCT c.id), 0) * 100,
      2
    ) as avg_response_rate
  FROM users u
  LEFT JOIN connections c ON u.id IN (c.user1_id, c.user2_id)
  LEFT JOIN messages m ON u.id = m.sender_id
  WHERE u.last_active_at >= now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 10. CONSTRAINTS & VALIDATIONS
-- ========================================

-- Add user preference constraint
ALTER TABLE users ADD CONSTRAINT check_preferences_structure 
  CHECK (validate_user_preferences(preferences));

-- Ensure primary photo constraint
CREATE OR REPLACE FUNCTION enforce_single_primary_photo() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE user_photos 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_single_primary_photo
  BEFORE INSERT OR UPDATE ON user_photos
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_primary_photo();

-- ========================================
-- 11. SEED INTEREST CATEGORIES
-- ========================================

INSERT INTO interest_categories (name, description, weight_multiplier) VALUES
('Academic', 'Study-related interests', 1.2),
('Sports & Fitness', 'Physical activities and sports', 1.1),
('Arts & Creativity', 'Creative and artistic pursuits', 1.0),
('Technology', 'Tech and programming interests', 1.1),
('Entertainment', 'Movies, music, games', 1.0),
('Travel & Culture', 'Travel and cultural experiences', 1.0),
('Social & Networking', 'Social activities and networking', 1.1),
('Lifestyle', 'General lifestyle interests', 0.9),
('Career & Professional', 'Professional development', 1.2);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 BTHOGAYI Database Schema Created Successfully!';
  RAISE NOTICE '📊 Tables: users, user_interests, connections, messages, user_photos, reports, recommendation_feedback, user_activity_log, recommendation_insights';
  RAISE NOTICE '🔍 Advanced recommendation engine with ML-ready features';
  RAISE NOTICE '📈 Analytics functions and performance indexes created';
  RAISE NOTICE '🚀 Ready for sample data insertion!';
END $$;
