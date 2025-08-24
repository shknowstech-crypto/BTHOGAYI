/*
  BTHOGAYI - Sample Data for Testing
  
  This file contains realistic sample data for testing the platform.
  Execute this AFTER running the fresh schema creation.
*/

-- ========================================
-- 1. SAMPLE USERS
-- ========================================

-- Insert sample users with diverse profiles
INSERT INTO users (
  email, display_name, bio, age, gender, year, branch, campus, 
  preferences, verified, profile_completed, is_active
) VALUES 

-- Computer Science Students
(
  'arjun.sharma@college.edu', 
  'Arjun Sharma', 
  'CS sophomore who loves coding, cricket, and coffee ☕ Always up for hackathons and late-night debugging sessions!', 
  20, 'male', 2, 'Computer Science', 'Main Campus',
  '{"looking_for": ["dating", "friends"], "interests": ["technology", "sports"], "age_range": [18, 24]}'::jsonb,
  true, true, true
),

(
  'priya.patel@college.edu',
  'Priya Patel', 
  'Tech enthusiast and aspiring data scientist 📊 Love exploring new places and trying different cuisines. Looking for meaningful connections!',
  21, 'female', 3, 'Computer Science', 'Main Campus',
  '{"looking_for": ["dating", "networking"], "interests": ["technology", "travel", "food"], "age_range": [19, 25]}'::jsonb,
  true, true, true
),

-- Engineering Students
(
  'rahul.kumar@college.edu',
  'Rahul Kumar',
  'Mechanical engineering student with a passion for automobiles 🏎️ Fitness enthusiast and movie buff. Let''s grab coffee and chat!',
  22, 'male', 4, 'Mechanical Engineering', 'Main Campus',
  '{"looking_for": ["dating", "friends"], "interests": ["engineering", "fitness", "movies"], "age_range": [20, 26]}'::jsonb,
  true, true, true
),

(
  'sneha.singh@college.edu',
  'Sneha Singh',
  'Chemical engineering junior who loves photography 📸 and sustainable living. Always down for weekend adventures and good conversations.',
  20, 'female', 3, 'Chemical Engineering', 'North Campus',
  '{"looking_for": ["friends", "dating"], "interests": ["photography", "environment", "adventure"], "age_range": [19, 24]}'::jsonb,
  true, true, true
),

-- Arts & Literature Students
(
  'aisha.khan@college.edu',
  'Aisha Khan',
  'Literature major with a love for poetry and theater 🎭 Bookworm by day, performer by night. Looking for deep conversations and artistic souls.',
  19, 'female', 2, 'English Literature', 'Arts Campus',
  '{"looking_for": ["dating", "friends"], "interests": ["literature", "theater", "poetry"], "age_range": [18, 23]}'::jsonb,
  true, true, true
),

(
  'vikram.gupta@college.edu',
  'Vikram Gupta',
  'Philosophy student and amateur musician 🎸 Love discussing existential questions over chai. Seeking intellectually stimulating connections.',
  21, 'male', 3, 'Philosophy', 'Arts Campus',
  '{"looking_for": ["friends", "networking"], "interests": ["philosophy", "music", "debate"], "age_range": [19, 25]}'::jsonb,
  true, true, true
),

-- Business Students
(
  'maya.reddy@college.edu',
  'Maya Reddy',
  'Business management student and startup enthusiast 💼 Love networking events and trying new restaurants. Let''s discuss big ideas!',
  22, 'female', 4, 'Business Management', 'Business Campus',
  '{"looking_for": ["networking", "dating"], "interests": ["business", "entrepreneurship", "food"], "age_range": [21, 27]}'::jsonb,
  true, true, true
),

(
  'dev.agarwal@college.edu',
  'Dev Agarwal',
  'Economics major with a passion for finance 📈 Avid reader and chess player. Looking for study partners and meaningful friendships.',
  20, 'male', 3, 'Economics', 'Business Campus',
  '{"looking_for": ["friends", "study_partners"], "interests": ["finance", "chess", "reading"], "age_range": [19, 24]}'::jsonb,
  true, true, true
),

-- Science Students
(
  'kavya.iyer@college.edu',
  'Kavya Iyer',
  'Biotechnology student passionate about research 🔬 Love hiking and nature photography. Seeking connections with fellow science enthusiasts.',
  21, 'female', 3, 'Biotechnology', 'Science Campus',
  '{"looking_for": ["friends", "networking"], "interests": ["science", "research", "nature"], "age_range": [20, 25]}'::jsonb,
  true, true, true
),

(
  'rohit.joshi@college.edu',
  'Rohit Joshi',
  'Physics major and astronomy enthusiast 🌟 Spend nights stargazing and days in the lab. Looking for someone who appreciates the beauty of science.',
  23, 'male', 4, 'Physics', 'Science Campus',
  '{"looking_for": ["dating", "friends"], "interests": ["physics", "astronomy", "research"], "age_range": [21, 27]}'::jsonb,
  true, true, true
),

-- Diverse Interests
(
  'ananya.mishra@college.edu',
  'Ananya Mishra',
  'Psychology student and mental health advocate 🧠 Love painting, yoga, and helping others. Seeking genuine connections and good vibes.',
  20, 'female', 2, 'Psychology', 'Main Campus',
  '{"looking_for": ["friends", "dating"], "interests": ["psychology", "art", "wellness"], "age_range": [18, 24]}'::jsonb,
  true, true, true
),

(
  'karan.mehta@college.edu',
  'Karan Mehta',
  'Architecture student with a love for design 🏗️ Skateboarding enthusiast and coffee connoisseur. Let''s explore the city together!',
  22, 'male', 4, 'Architecture', 'Design Campus',
  '{"looking_for": ["dating", "friends"], "interests": ["architecture", "design", "skateboarding"], "age_range": [20, 26]}'::jsonb,
  true, true, true
);

-- ========================================
-- 2. SAMPLE INTERESTS
-- ========================================

-- Get user IDs for interest assignment
DO $$
DECLARE
  user_rec RECORD;
  interests TEXT[];
BEGIN
  -- Arjun (CS student)
  SELECT id INTO user_rec FROM users WHERE email = 'arjun.sharma@college.edu';
  interests := ARRAY['Programming', 'Cricket', 'Coffee', 'Hackathons', 'Gaming', 'Mobile Development'];
  FOR i IN 1..array_length(interests, 1) LOOP
    INSERT INTO user_interests (user_id, interest, category_id, weight) 
    VALUES (user_rec.id, interests[i], 
      (SELECT id FROM interest_categories WHERE name = 'Technology'), 
      CASE WHEN i <= 3 THEN 1.0 ELSE 0.8 END);
  END LOOP;

  -- Priya (CS student)
  SELECT id INTO user_rec FROM users WHERE email = 'priya.patel@college.edu';
  interests := ARRAY['Data Science', 'Machine Learning', 'Travel', 'Photography', 'Cooking', 'Hiking'];
  FOR i IN 1..array_length(interests, 1) LOOP
    INSERT INTO user_interests (user_id, interest, category_id, weight) 
    VALUES (user_rec.id, interests[i], 
      (SELECT id FROM interest_categories WHERE name = 
        CASE WHEN interests[i] IN ('Data Science', 'Machine Learning') THEN 'Technology'
             WHEN interests[i] IN ('Travel', 'Hiking') THEN 'Travel & Culture'
             ELSE 'Lifestyle' END), 
      CASE WHEN i <= 2 THEN 1.0 ELSE 0.9 END);
  END LOOP;

  -- Rahul (Mechanical Engineering)
  SELECT id INTO user_rec FROM users WHERE email = 'rahul.kumar@college.edu';
  interests := ARRAY['Automobiles', 'Fitness', 'Movies', 'Mechanical Design', 'Gym', 'Action Films'];
  FOR i IN 1..array_length(interests, 1) LOOP
    INSERT INTO user_interests (user_id, interest, category_id, weight) 
    VALUES (user_rec.id, interests[i], 
      (SELECT id FROM interest_categories WHERE name = 
        CASE WHEN interests[i] IN ('Automobiles', 'Mechanical Design') THEN 'Academic'
             WHEN interests[i] IN ('Fitness', 'Gym') THEN 'Sports & Fitness'
             ELSE 'Entertainment' END), 
      1.0);
  END LOOP;

  -- Continue for other users...
  -- Sneha (Chemical Engineering)
  SELECT id INTO user_rec FROM users WHERE email = 'sneha.singh@college.edu';
  interests := ARRAY['Photography', 'Environmental Science', 'Hiking', 'Sustainable Living', 'Nature', 'Adventure Sports'];
  FOR i IN 1..array_length(interests, 1) LOOP
    INSERT INTO user_interests (user_id, interest, category_id, weight) 
    VALUES (user_rec.id, interests[i], 
      (SELECT id FROM interest_categories WHERE name = 
        CASE WHEN interests[i] = 'Photography' THEN 'Arts & Creativity'
             WHEN interests[i] IN ('Environmental Science', 'Sustainable Living') THEN 'Academic'
             ELSE 'Travel & Culture' END), 
      CASE WHEN i <= 3 THEN 1.0 ELSE 0.8 END);
  END LOOP;

  -- Aisha (Literature)
  SELECT id INTO user_rec FROM users WHERE email = 'aisha.khan@college.edu';
  interests := ARRAY['Poetry', 'Theater', 'Creative Writing', 'Classical Literature', 'Drama', 'Public Speaking'];
  FOR i IN 1..array_length(interests, 1) LOOP
    INSERT INTO user_interests (user_id, interest, category_id, weight) 
    VALUES (user_rec.id, interests[i], 
      (SELECT id FROM interest_categories WHERE name = 'Arts & Creativity'), 
      CASE WHEN i <= 3 THEN 1.0 ELSE 0.9 END);
  END LOOP;

  -- Add interests for remaining users...
  -- Vikram (Philosophy)
  SELECT id INTO user_rec FROM users WHERE email = 'vikram.gupta@college.edu';
  interests := ARRAY['Philosophy', 'Guitar', 'Debate', 'Ethics', 'Music Composition', 'Critical Thinking'];
  FOR i IN 1..array_length(interests, 1) LOOP
    INSERT INTO user_interests (user_id, interest, category_id, weight) 
    VALUES (user_rec.id, interests[i], 
      (SELECT id FROM interest_categories WHERE name = 
        CASE WHEN interests[i] IN ('Philosophy', 'Ethics', 'Critical Thinking') THEN 'Academic'
             WHEN interests[i] IN ('Guitar', 'Music Composition') THEN 'Arts & Creativity'
             ELSE 'Social & Networking' END), 
      1.0);
  END LOOP;

END $$;

-- ========================================
-- 3. SAMPLE CONNECTIONS
-- ========================================

-- Create some sample connections
INSERT INTO connections (user1_id, user2_id, status, connection_type, initiated_by, compatibility_score, mutual_interests_count) 
SELECT 
  u1.id, u2.id, 
  CASE 
    WHEN random() < 0.3 THEN 'accepted'
    WHEN random() < 0.6 THEN 'pending'
    ELSE 'declined'
  END,
  CASE 
    WHEN u1.branch = u2.branch THEN 'dating'
    WHEN u1.campus = u2.campus THEN 'friends'
    ELSE 'networking'
  END,
  u1.id,
  random() * 0.8 + 0.2, -- Random compatibility between 0.2 and 1.0
  floor(random() * 5 + 1)::integer -- 1-5 mutual interests
FROM users u1, users u2 
WHERE u1.id < u2.id 
  AND u1.campus = u2.campus 
  AND random() < 0.4 -- Create connections for 40% of possible pairs
LIMIT 15;

-- ========================================
-- 4. SAMPLE MESSAGES
-- ========================================

-- Add some sample messages for accepted connections
INSERT INTO messages (connection_id, sender_id, content, message_type)
SELECT 
  c.id,
  CASE WHEN random() < 0.5 THEN c.user1_id ELSE c.user2_id END,
  CASE floor(random() * 6)::integer
    WHEN 0 THEN 'Hey! How''s your day going?'
    WHEN 1 THEN 'I noticed we have similar interests in ' || (SELECT interest FROM user_interests WHERE user_id = c.user1_id ORDER BY random() LIMIT 1) || '. Would love to chat more!'
    WHEN 2 THEN 'Are you free for coffee sometime this week?'
    WHEN 3 THEN 'That project you mentioned sounds really interesting! Tell me more about it.'
    WHEN 4 THEN 'Hope your exams are going well! 📚'
    ELSE 'Nice to match with you! Looking forward to getting to know you better.'
  END,
  'text'
FROM connections c
WHERE c.status = 'accepted'
  AND random() < 0.8;

-- ========================================
-- 5. SAMPLE PHOTOS
-- ========================================

-- Add sample photo URLs (placeholder URLs)
INSERT INTO user_photos (user_id, photo_url, thumbnail_url, is_primary, is_approved, moderation_status)
SELECT 
  u.id,
  'https://images.unsplash.com/photo-' || (1500000000 + floor(random() * 100000000))::text || '?w=400&h=600&fit=crop&crop=face',
  'https://images.unsplash.com/photo-' || (1500000000 + floor(random() * 100000000))::text || '?w=150&h=200&fit=crop&crop=face',
  true,
  true,
  'approved'
FROM users u
WHERE u.profile_completed = true;

-- ========================================
-- 6. SAMPLE RECOMMENDATION FEEDBACK
-- ========================================

-- Add some recommendation feedback data
INSERT INTO recommendation_feedback (user_id, recommended_user_id, action, compatibility_score, response_time_ms)
SELECT 
  u1.id,
  u2.id,
  CASE floor(random() * 4)::integer
    WHEN 0 THEN 'like'
    WHEN 1 THEN 'pass'
    WHEN 2 THEN 'super_like'
    ELSE 'like'
  END,
  random() * 0.8 + 0.2,
  floor(random() * 10000 + 1000)::integer -- 1-10 seconds response time
FROM users u1, users u2
WHERE u1.id != u2.id
  AND u1.campus = u2.campus
  AND random() < 0.3 -- 30% of users have given feedback on 30% of others
ON CONFLICT (user_id, recommended_user_id) DO NOTHING;

-- ========================================
-- 7. SAMPLE ACTIVITY LOG
-- ========================================

-- Add some sample user activities
INSERT INTO user_activity_log (user_id, activity_type, activity_data, session_id)
SELECT 
  u.id,
  CASE floor(random() * 5)::integer
    WHEN 0 THEN 'profile_view'
    WHEN 1 THEN 'recommendation_view'
    WHEN 2 THEN 'message_sent'
    WHEN 3 THEN 'interest_added'
    ELSE 'login'
  END,
  jsonb_build_object(
    'timestamp', now() - interval '1 day' * random() * 30,
    'device', CASE WHEN random() < 0.7 THEN 'mobile' ELSE 'web' END,
    'duration_seconds', floor(random() * 600 + 30)
  ),
  uuid_generate_v4()
FROM users u, generate_series(1, 3) -- 3 activities per user
WHERE u.is_active = true;

-- ========================================
-- 8. UPDATE USER STATISTICS
-- ========================================

-- Update user recommendation scores based on their activity
UPDATE users 
SET 
  recommendation_score = (
    SELECT COALESCE(AVG(rf.compatibility_score), 0.5)
    FROM recommendation_feedback rf 
    WHERE rf.recommended_user_id = users.id
  ),
  interaction_count = (
    SELECT COUNT(*)
    FROM recommendation_feedback rf 
    WHERE rf.user_id = users.id OR rf.recommended_user_id = users.id
  ),
  match_success_rate = (
    SELECT CASE 
      WHEN COUNT(*) > 0 THEN 
        COUNT(*) FILTER (WHERE status = 'accepted')::decimal / COUNT(*) * 100
      ELSE 0 
    END
    FROM connections c 
    WHERE c.user1_id = users.id OR c.user2_id = users.id
  );

-- ========================================
-- 9. SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sample data inserted successfully!';
  RAISE NOTICE '👥 Users: %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE '💭 Interests: %', (SELECT COUNT(*) FROM user_interests);
  RAISE NOTICE '🤝 Connections: %', (SELECT COUNT(*) FROM connections);
  RAISE NOTICE '💬 Messages: %', (SELECT COUNT(*) FROM messages);
  RAISE NOTICE '📸 Photos: %', (SELECT COUNT(*) FROM user_photos);
  RAISE NOTICE '⭐ Feedback entries: %', (SELECT COUNT(*) FROM recommendation_feedback);
  RAISE NOTICE '📊 Activity logs: %', (SELECT COUNT(*) FROM user_activity_log);
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Database is ready for testing!';
  RAISE NOTICE '🔍 Try: SELECT * FROM get_user_recommendations((SELECT id FROM users LIMIT 1), 5);';
END $$;
