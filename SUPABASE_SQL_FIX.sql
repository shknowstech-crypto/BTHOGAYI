-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

BEGIN;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Verified users can view other verified profiles" ON users;

-- Create a simpler, non-recursive policy
CREATE POLICY "Verified users can view other verified profiles" ON users 
    FOR SELECT USING (
        verified = true 
        AND privacy_settings->>'discoverable' = 'true'
    );

-- Verify the policies are correct
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

COMMIT;
