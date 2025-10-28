-- ============================================================================
-- echo:Intune - DATABASE INITIALIZATION SCRIPT
-- ============================================================================
-- Database: echoIntune
-- 
-- This script creates a fresh database with all tables, indexes, triggers,
-- and permissions for the echo:Intune application.
--
-- Usage:
--   Run this script: psql -U postgres -f backend/config/init-database.sql
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE CREATION
-- ============================================================================

-- Drop existing database if needed (CAUTION: This will delete all data)
DROP DATABASE IF EXISTS "echoIntune";

-- Create the database
CREATE DATABASE "echoIntune"
    WITH 
    OWNER = deekshita
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Connect to the new database
\c "echoIntune"

-- ============================================================================
-- SECTION 2: TABLE CREATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users Table (with all profile fields)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    avatar VARCHAR(10) DEFAULT '🐚',
    google_id VARCHAR(255) UNIQUE,
    reset_token TEXT,
    reset_token_expires TIMESTAMP,
    gender VARCHAR(50),
    birthday DATE,
    bio TEXT,
    pronouns VARCHAR(50),
    timezone VARCHAR(100) DEFAULT 'UTC',
    occupation VARCHAR(255),
    location VARCHAR(255),
    interests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Journal Entries Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    emotion VARCHAR(50),
    probability DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Mood Entries Table (Manual mood tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mood_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL,
    note TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- ----------------------------------------------------------------------------
-- Tasks Table (Planner feature)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    reminder_time TIMESTAMP,
    task_type VARCHAR(50) DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Habits Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10) DEFAULT '🎯',
    frequency VARCHAR(50) DEFAULT 'daily',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Habit Tracking Table (For marking completed days)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habit_tracking (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, date)
);

-- ----------------------------------------------------------------------------
-- Contact Messages Table (Contact form submissions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 3: INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Journal indexes
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_emotion ON journal_entries(emotion);

-- Mood indexes
CREATE INDEX IF NOT EXISTS idx_mood_user_date ON mood_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_emotion ON mood_entries(emotion);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);

-- Habit indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- Habit tracking indexes
CREATE INDEX IF NOT EXISTS idx_habit_tracking_habit_date ON habit_tracking(habit_id, date DESC);

-- Contact message indexes
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);

-- ============================================================================
-- SECTION 4: TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp on tasks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 5: PERMISSIONS
-- ============================================================================

-- Grant all privileges to the owner
GRANT ALL PRIVILEGES ON DATABASE "echoIntune" TO deekshita;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO deekshita;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO deekshita;

-- ============================================================================
-- INITIALIZATION COMPLETE
-- ============================================================================

-- Display summary
SELECT 'Database "echoIntune" initialized successfully!' AS status;
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

