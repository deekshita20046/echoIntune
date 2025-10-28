-- Add personal profile fields to users table
-- Run this as: psql -U deekshita -d echointunee -f backend/config/add-profile-fields.sql

-- Add avatar field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(10) DEFAULT '🐚';

-- Add gender field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

-- Add birthday field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Add bio field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add pronouns field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pronouns VARCHAR(50);

-- Add timezone field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC';

-- Add occupation field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);

-- Add location (city/country)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- Add interests/hobbies
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS interests TEXT;

-- Confirmation
SELECT 'Profile fields added successfully!' as status;

-- Show current table structure
\d users;

