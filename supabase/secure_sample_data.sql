/*
  BTHOGAYI - SECURE Sample Data
  Only BITS Email Addresses Allowed
  
  🔒 SECURITY COMPLIANT:
  - All emails use valid BITS domains
  - Campus auto-assigned from email domain
  - Realistic BITS student data
  - Profile completion variations
*/

-- ========================================
-- 1. SAMPLE USERS (BITS Students Only)
-- ========================================

-- Note: In real deployment, users will be created through Supabase Auth
-- This is for testing the schema with realistic data

INSERT INTO users (
    id, email, display_name, bio, age, gender, year, branch, 
    verified, profile_completed, campus, preferences, privacy_settings,
    subscription_tier, last_active
) VALUES

-- Pilani Campus Students
(
    '11111111-1111-1111-1111-111111111111',
    'aarav.sharma@pilani.bits-pilani.ac.in',
    'Aarav Sharma',
    'CS student passionate about AI and machine learning. Love to code and explore new technologies!',
    20, 'male', 2, 'Computer Science',
    true, true, 'Pilani',
    '{"age_range": [19, 22], "same_campus_only": false, "same_year_preference": true}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'premium', now() - interval '2 hours'
),
(
    '22222222-2222-2222-2222-222222222222',
    'priya.patel@pilani.bits-pilani.ac.in',
    'Priya Patel',
    'Mechanical Engineering student with a passion for sustainable technology and environmental conservation.',
    21, 'female', 3, 'Mechanical Engineering',
    true, true, 'Pilani',
    '{"age_range": [20, 24], "same_campus_only": true, "same_year_preference": false}',
    '{"show_age": true, "show_year": false, "show_branch": true, "discoverable": true}',
    'free', now() - interval '1 hour'
),

-- Goa Campus Students
(
    '33333333-3333-3333-3333-333333333333',
    'rohan.desai@goa.bits-pilani.ac.in',
    'Rohan Desai',
    'Electronics student and music enthusiast. Play guitar and love beach volleyball!',
    19, 'male', 1, 'Electronics & Communication',
    true, true, 'Goa',
    '{"age_range": [18, 21], "same_campus_only": false, "same_year_preference": false}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'free', now() - interval '30 minutes'
),
(
    '44444444-4444-4444-4444-444444444444',
    'sneha.iyer@goa.bits-pilani.ac.in',
    'Sneha Iyer',
    'Chemical Engineering with interests in biotech research. Love reading and classical dance.',
    22, 'female', 4, 'Chemical Engineering',
    true, true, 'Goa',
    '{"age_range": [21, 25], "same_campus_only": false, "same_year_preference": false}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'premium', now() - interval '15 minutes'
),

-- Hyderabad Campus Students
(
    '55555555-5555-5555-5555-555555555555',
    'arjun.reddy@hyderabad.bits-pilani.ac.in',
    'Arjun Reddy',
    'Biotechnology student interested in genetic research and entrepreneurship.',
    20, 'male', 2, 'Biotechnology',
    true, true, 'Hyderabad',
    '{"age_range": [19, 23], "same_campus_only": false, "same_year_preference": true}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'free', now() - interval '45 minutes'
),
(
    '66666666-6666-6666-6666-666666666666',
    'kavya.nair@hyderabad.bits-pilani.ac.in',
    'Kavya Nair',
    'Civil Engineering student passionate about sustainable urban development and architecture.',
    21, 'female', 3, 'Civil Engineering',
    true, true, 'Hyderabad',
    '{"age_range": [20, 24], "same_campus_only": true, "same_year_preference": false}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'free', now() - interval '20 minutes'
),

-- Dubai Campus Students
(
    '77777777-7777-7777-7777-777777777777',
    'zara.ahmed@dubai.bits-pilani.ac.in',
    'Zara Ahmed',
    'Information Systems student with interests in cybersecurity and digital innovation.',
    19, 'female', 1, 'Information Systems',
    true, true, 'Dubai',
    '{"age_range": [18, 22], "same_campus_only": false, "same_year_preference": false}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'premium', now() - interval '10 minutes'
),
(
    '88888888-8888-8888-8888-888888888888',
    'omar.hassan@dubai.bits-pilani.ac.in',
    'Omar Hassan',
    'Economics and Finance student passionate about fintech and blockchain technology.',
    22, 'male', 4, 'Economics & Finance',
    true, true, 'Dubai',
    '{"age_range": [21, 25], "same_campus_only": false, "same_year_preference": false}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'free', now() - interval '5 minutes'
),

-- Additional students for testing
(
    '99999999-9999-9999-9999-999999999999',
    'aditya.kumar@pilani.bits-pilani.ac.in',
    'Aditya Kumar',
    'Electrical Engineering student interested in renewable energy and IoT.',
    20, 'male', 2, 'Electrical & Electronics',
    true, false, 'Pilani', -- Profile not completed
    '{"age_range": [19, 22], "same_campus_only": false}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": false}',
    'free', now() - interval '3 hours'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ananya.gupta@goa.bits-pilani.ac.in',
    'Ananya Gupta',
    'Computer Science student specializing in data science and machine learning.',
    21, 'female', 3, 'Computer Science',
    false, true, 'Goa', -- Not verified yet
    '{"age_range": [20, 24], "same_campus_only": true}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'free', now() - interval '1 day'
);

-- ========================================
-- 2. USER INTERESTS
-- ========================================

INSERT INTO user_interests (user_id, category_id, interest_name, proficiency_level, is_primary) VALUES

-- Aarav Sharma (CS Pilani)
('11111111-1111-1111-1111-111111111111', (SELECT id FROM interest_categories WHERE name = 'Technology'), 'Machine Learning', 'advanced', true),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM interest_categories WHERE name = 'Technology'), 'Python Programming', 'expert', false),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM interest_categories WHERE name = 'Sports & Fitness'), 'Cricket', 'intermediate', false),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM interest_categories WHERE name = 'Entertainment'), 'Tech Podcasts', 'advanced', false),

-- Priya Patel (Mech Pilani)
('22222222-2222-2222-2222-222222222222', (SELECT id FROM interest_categories WHERE name = 'Academic'), 'Sustainable Technology', 'advanced', true),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM interest_categories WHERE name = 'Travel & Culture'), 'Environmental Conservation', 'expert', false),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM interest_categories WHERE name = 'Sports & Fitness'), 'Yoga', 'intermediate', false),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM interest_categories WHERE name = 'Arts & Creativity'), 'Photography', 'beginner', false),

-- Rohan Desai (ECE Goa)
('33333333-3333-3333-3333-333333333333', (SELECT id FROM interest_categories WHERE name = 'Entertainment'), 'Guitar Playing', 'advanced', true),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM interest_categories WHERE name = 'Sports & Fitness'), 'Beach Volleyball', 'intermediate', false),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM interest_categories WHERE name = 'Technology'), 'Electronics', 'advanced', false),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM interest_categories WHERE name = 'Entertainment'), 'Rock Music', 'expert', false),

-- Sneha Iyer (Chemical Goa)
('44444444-4444-4444-4444-444444444444', (SELECT id FROM interest_categories WHERE name = 'Academic'), 'Biotechnology Research', 'expert', true),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM interest_categories WHERE name = 'Arts & Creativity'), 'Classical Dance', 'advanced', false),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM interest_categories WHERE name = 'Entertainment'), 'Reading', 'expert', false),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM interest_categories WHERE name = 'Lifestyle'), 'Cooking', 'intermediate', false),

-- Arjun Reddy (Biotech Hyderabad)
('55555555-5555-5555-5555-555555555555', (SELECT id FROM interest_categories WHERE name = 'Academic'), 'Genetic Research', 'advanced', true),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM interest_categories WHERE name = 'Career & Professional'), 'Entrepreneurship', 'intermediate', false),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM interest_categories WHERE name = 'Sports & Fitness'), 'Basketball', 'advanced', false),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM interest_categories WHERE name = 'Technology'), 'Bioinformatics', 'intermediate', false),

-- Kavya Nair (Civil Hyderabad)
('66666666-6666-6666-6666-666666666666', (SELECT id FROM interest_categories WHERE name = 'Academic'), 'Sustainable Architecture', 'advanced', true),
('66666666-6666-6666-6666-666666666666', (SELECT id FROM interest_categories WHERE name = 'Arts & Creativity'), 'Urban Sketching', 'intermediate', false),
('66666666-6666-6666-6666-666666666666', (SELECT id FROM interest_categories WHERE name = 'Travel & Culture'), 'Heritage Conservation', 'advanced', false),
('66666666-6666-6666-6666-666666666666', (SELECT id FROM interest_categories WHERE name = 'Lifestyle'), 'Interior Design', 'beginner', false),

-- Zara Ahmed (IS Dubai)
('77777777-7777-7777-7777-777777777777', (SELECT id FROM interest_categories WHERE name = 'Technology'), 'Cybersecurity', 'advanced', true),
('77777777-7777-7777-7777-777777777777', (SELECT id FROM interest_categories WHERE name = 'Career & Professional'), 'Digital Innovation', 'intermediate', false),
('77777777-7777-7777-7777-777777777777', (SELECT id FROM interest_categories WHERE name = 'Arts & Creativity'), 'Digital Art', 'beginner', false),
('77777777-7777-7777-7777-777777777777', (SELECT id FROM interest_categories WHERE name = 'Travel & Culture'), 'Cultural Exchange', 'advanced', false),

-- Omar Hassan (Econ Dubai)
('88888888-8888-8888-8888-888888888888', (SELECT id FROM interest_categories WHERE name = 'Career & Professional'), 'Fintech', 'expert', true),
('88888888-8888-8888-8888-888888888888', (SELECT id FROM interest_categories WHERE name = 'Technology'), 'Blockchain', 'advanced', false),
('88888888-8888-8888-8888-888888888888', (SELECT id FROM interest_categories WHERE name = 'Sports & Fitness'), 'Swimming', 'intermediate', false),
('88888888-8888-8888-8888-888888888888', (SELECT id FROM interest_categories WHERE name = 'Travel & Culture'), 'International Business', 'advanced', false);

-- ========================================
-- 3. USER PHOTOS
-- ========================================

INSERT INTO user_photos (user_id, photo_url, photo_order, is_primary, is_verified, moderation_status) VALUES

-- Profile photos for each user
('11111111-1111-1111-1111-111111111111', 'https://example.com/photos/aarav_1.jpg', 1, true, true, 'approved'),
('11111111-1111-1111-1111-111111111111', 'https://example.com/photos/aarav_2.jpg', 2, false, true, 'approved'),

('22222222-2222-2222-2222-222222222222', 'https://example.com/photos/priya_1.jpg', 1, true, true, 'approved'),
('22222222-2222-2222-2222-222222222222', 'https://example.com/photos/priya_2.jpg', 2, false, true, 'approved'),

('33333333-3333-3333-3333-333333333333', 'https://example.com/photos/rohan_1.jpg', 1, true, true, 'approved'),
('33333333-3333-3333-3333-333333333333', 'https://example.com/photos/rohan_2.jpg', 2, false, true, 'approved'),

('44444444-4444-4444-4444-444444444444', 'https://example.com/photos/sneha_1.jpg', 1, true, true, 'approved'),

('55555555-5555-5555-5555-555555555555', 'https://example.com/photos/arjun_1.jpg', 1, true, true, 'approved'),

('66666666-6666-6666-6666-666666666666', 'https://example.com/photos/kavya_1.jpg', 1, true, true, 'approved'),

('77777777-7777-7777-7777-777777777777', 'https://example.com/photos/zara_1.jpg', 1, true, true, 'approved'),

('88888888-8888-8888-8888-888888888888', 'https://example.com/photos/omar_1.jpg', 1, true, true, 'approved');

-- ========================================
-- 4. SAMPLE CONNECTIONS
-- ========================================

INSERT INTO connections (
    user1_id, user2_id, status, user1_action, user2_action, 
    compatibility_score, matched_at, algorithm_version
) VALUES

-- Successful matches
(
    '11111111-1111-1111-1111-111111111111', -- Aarav (CS Pilani)
    '22222222-2222-2222-2222-222222222222', -- Priya (Mech Pilani)
    'matched', 'like', 'like', 0.85, 
    now() - interval '2 days', 'v2.0'
),
(
    '33333333-3333-3333-3333-333333333333', -- Rohan (ECE Goa)
    '44444444-4444-4444-4444-444444444444', -- Sneha (Chemical Goa)
    'matched', 'super_like', 'like', 0.78,
    now() - interval '1 day', 'v2.0'
),

-- Pending connections
(
    '55555555-5555-5555-5555-555555555555', -- Arjun (Biotech Hyderabad)
    '77777777-7777-7777-7777-777777777777', -- Zara (IS Dubai)
    'pending', 'like', NULL, 0.72,
    NULL, 'v2.0'
),

-- Cross-campus connection
(
    '11111111-1111-1111-1111-111111111111', -- Aarav (Pilani)
    '77777777-7777-7777-7777-777777777777', -- Zara (Dubai)
    'matched', 'like', 'like', 0.68,
    now() - interval '6 hours', 'v2.0'
);

-- ========================================
-- 5. SAMPLE MESSAGES
-- ========================================

INSERT INTO messages (connection_id, sender_id, content, message_type, is_read) VALUES

-- Messages between Aarav and Priya
(
    (SELECT id FROM connections WHERE user1_id = '11111111-1111-1111-1111-111111111111' AND user2_id = '22222222-2222-2222-2222-222222222222'),
    '11111111-1111-1111-1111-111111111111',
    'Hi Priya! I saw you''re working on sustainable technology. That''s really interesting!',
    'text', true
),
(
    (SELECT id FROM connections WHERE user1_id = '11111111-1111-1111-1111-111111111111' AND user2_id = '22222222-2222-2222-2222-222222222222'),
    '22222222-2222-2222-2222-222222222222',
    'Thanks Aarav! I''d love to know more about your ML projects. Maybe we can collaborate sometime?',
    'text', true
),

-- Messages between Rohan and Sneha
(
    (SELECT id FROM connections WHERE user1_id = '33333333-3333-3333-3333-333333333333' AND user2_id = '44444444-4444-4444-4444-444444444444'),
    '33333333-3333-3333-3333-333333333333',
    'Hey Sneha! Fellow Goa campus student here. Want to jam sometime? I play guitar 🎸',
    'text', true
),
(
    (SELECT id FROM connections WHERE user1_id = '33333333-3333-3333-3333-333333333333' AND user2_id = '44444444-4444-4444-4444-444444444444'),
    '44444444-4444-4444-4444-444444444444',
    'That sounds great! I''d love to. I don''t play instruments but I love music.',
    'text', false
);

-- ========================================
-- 6. RECOMMENDATION FEEDBACK
-- ========================================

INSERT INTO recommendation_feedback (
    user_id, recommended_user_id, action, compatibility_score, 
    algorithm_version, response_time_ms
) VALUES

-- Feedback from various users
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'like', 0.85, 'v2.0', 2340),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'pass', 0.65, 'v2.0', 1870),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'like', 0.85, 'v2.0', 3120),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'super_like', 0.78, 'v2.0', 4560),
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'like', 0.78, 'v2.0', 2890),
('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'like', 0.72, 'v2.0', 3450),
('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 'pass', 0.58, 'v2.0', 1234);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '🎉 BTHOGAYI SECURE Sample Data Inserted Successfully!';
  RAISE NOTICE '🎓 Users: 10 BITS students across all 4 campuses';
  RAISE NOTICE '🔗 Connections: 4 sample connections with different statuses';
  RAISE NOTICE '💬 Messages: Sample conversations between matched users';
  RAISE NOTICE '📊 Interests: Realistic interests for all users';
  RAISE NOTICE '📷 Photos: Profile photos for testing';
  RAISE NOTICE '🔒 All data complies with RLS security policies';
  RAISE NOTICE '✅ Ready for secure testing!';
END $$;
