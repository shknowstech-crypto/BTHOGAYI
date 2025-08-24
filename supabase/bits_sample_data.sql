/*
  BTHOGAYI - BITS Students Sample Data
  Only valid BITS email addresses across all 4 campuses
*/

-- ========================================
-- SAMPLE USERS (BITS Students Only)
-- ========================================

INSERT INTO users (
    id, email, display_name, bio, age, gender, year, branch, 
    verified, profile_completed, preferences, privacy_settings,
    subscription_tier, last_active
) VALUES

-- Pilani Campus Students
(
    '11111111-1111-1111-1111-111111111111',
    'aarav.sharma@pilani.bits-pilani.ac.in',
    'Aarav Sharma',
    'CS student passionate about AI and machine learning. Love to code and explore new technologies!',
    20, 'male', 2, 'Computer Science',
    true, true, 
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
    true, true,
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
    true, true,
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
    true, true,
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
    true, true,
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
    true, true,
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
    true, true,
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
    true, true,
    '{"age_range": [21, 25], "same_campus_only": false, "same_year_preference": false}',
    '{"show_age": true, "show_year": true, "show_branch": true, "discoverable": true}',
    'free', now() - interval '5 minutes'
);

-- ========================================
-- USER INTERESTS
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
-- USER PHOTOS
-- ========================================

INSERT INTO user_photos (user_id, photo_url, photo_order, is_primary, is_verified, moderation_status) VALUES

-- Profile photos for each user
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 1, true, true, 'approved'),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 2, false, true, 'approved'),

('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=400', 1, true, true, 'approved'),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 2, false, true, 'approved'),

('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 1, true, true, 'approved'),
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 2, false, true, 'approved'),

('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 1, true, true, 'approved'),

('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 1, true, true, 'approved'),

('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 1, true, true, 'approved'),

('77777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400', 1, true, true, 'approved'),

('88888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400', 1, true, true, 'approved');

-- ========================================
-- SAMPLE CONNECTIONS
-- ========================================

INSERT INTO connections (
    user1_id, user2_id, status, user1_action, user2_action, 
    compatibility_score, matched_at, algorithm_version
) VALUES

-- Dating connections (romantic interest)
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

-- Networking connections (professional/academic interest)
(
    '55555555-5555-5555-5555-555555555555', -- Arjun (Biotech Hyderabad)
    '44444444-4444-4444-4444-444444444444', -- Sneha (Chemical Goa) - both in bio-related fields
    'matched', 'like', 'like', 0.72,
    now() - interval '6 hours', 'v2.0'
),

-- Cross-campus connection
(
    '11111111-1111-1111-1111-111111111111', -- Aarav (Pilani)
    '77777777-7777-7777-7777-777777777777', -- Zara (Dubai)
    'matched', 'like', 'like', 0.68,
    now() - interval '6 hours', 'v2.0'
),

-- Pending connections
(
    '55555555-5555-5555-5555-555555555555', -- Arjun (Biotech Hyderabad)
    '77777777-7777-7777-7777-777777777777', -- Zara (IS Dubai)
    'pending', 'like', NULL, 0.72,
    NULL, 'v2.0'
),
(
    '88888888-8888-8888-8888-888888888888', -- Omar (Dubai)
    '11111111-1111-1111-1111-111111111111', -- Aarav (Pilani) - both tech interested
    'pending', 'like', NULL, 0.75,
    NULL, 'v2.0'
);

-- ========================================
-- SAMPLE MESSAGES
-- ========================================

INSERT INTO messages (connection_id, sender_id, content, message_type, is_read) VALUES

-- Messages between Aarav and Priya (dating context)
(
    (SELECT id FROM connections WHERE user1_id = '11111111-1111-1111-1111-111111111111' AND user2_id = '22222222-2222-2222-2222-222222222222'),
    '11111111-1111-1111-1111-111111111111',
    'Hi Priya! I saw you''re working on sustainable technology. That''s really interesting!',
    'text', true
),
(
    (SELECT id FROM connections WHERE user1_id = '11111111-1111-1111-1111-111111111111' AND user2_id = '22222222-2222-2222-2222-222222222222'),
    '22222222-2222-2222-2222-222222222222',
    'Thanks Aarav! I''d love to know more about your ML projects. Maybe we can grab coffee and discuss?',
    'text', true
),

-- Messages between Rohan and Sneha (dating context)
(
    (SELECT id FROM connections WHERE user1_id = '33333333-3333-3333-3333-333333333333' AND user2_id = '44444444-4444-4444-4444-444444444444'),
    '33333333-3333-3333-3333-333333333333',
    'Hey Sneha! Fellow Goa campus student here. Want to jam sometime? I play guitar 🎸',
    'text', true
),
(
    (SELECT id FROM connections WHERE user1_id = '33333333-3333-3333-3333-333333333333' AND user2_id = '44444444-4444-4444-4444-444444444444'),
    '44444444-4444-4444-4444-444444444444',
    'That sounds great! I don''t play instruments but I love music. Beach volleyball sounds fun too!',
    'text', false
),

-- Messages between Arjun and Sneha (networking context)
(
    (SELECT id FROM connections WHERE user1_id = '55555555-5555-5555-5555-555555555555' AND user2_id = '44444444-4444-4444-4444-444444444444'),
    '55555555-5555-5555-5555-555555555555',
    'Hi Sneha! I''m working on genetic research and saw your biotech background. Would love to discuss potential collaborations!',
    'text', true
),
(
    (SELECT id FROM connections WHERE user1_id = '55555555-5555-5555-5555-555555555555' AND user2_id = '44444444-4444-4444-4444-444444444444'),
    '44444444-4444-4444-4444-444444444444',
    'Hi Arjun! That sounds exciting. I''m particularly interested in biotech applications in environmental science. Let''s connect!',
    'text', true
);

-- ========================================
-- RECOMMENDATION FEEDBACK
-- ========================================

INSERT INTO recommendation_feedback (
    user_id, recommended_user_id, action, compatibility_score, 
    algorithm_version, response_time_ms
) VALUES

-- Dating-focused feedback
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'like', 0.85, 'v2.0', 2340),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'pass', 0.65, 'v2.0', 1870),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'like', 0.85, 'v2.0', 3120),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'super_like', 0.78, 'v2.0', 4560),
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'like', 0.78, 'v2.0', 2890),

-- Networking-focused feedback
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'like', 0.72, 'v2.0', 3450),
('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'like', 0.72, 'v2.0', 3450),
('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 'pass', 0.58, 'v2.0', 1234),
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'like', 0.75, 'v2.0', 2100);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '🎉 BTHOGAYI Sample Data Inserted Successfully!';
  RAISE NOTICE '🎓 Users: 8 BITS students across all 4 campuses';
  RAISE NOTICE '💕 Dating connections: Romantic interest matches';
  RAISE NOTICE '🤝 Networking connections: Academic/professional connections';
  RAISE NOTICE '💬 Messages: Sample conversations for both contexts';
  RAISE NOTICE '📊 Interests: Realistic interests for all users';
  RAISE NOTICE '📷 Photos: Profile photos for testing';
  RAISE NOTICE '🔒 All data complies with RLS security policies';
  RAISE NOTICE '✅ Ready for recommendation testing!';
END $$;
