-- Migration: Remove GitHub OAuth Support
-- Run this if you have an existing database with github_id column

-- Drop github_id index if it exists
DROP INDEX IF EXISTS idx_users_github_id;

-- Drop github_id column from users table
ALTER TABLE users DROP COLUMN IF EXISTS github_id;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'GitHub OAuth support removed successfully!' AS status;

