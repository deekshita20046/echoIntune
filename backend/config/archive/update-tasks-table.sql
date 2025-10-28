-- Add new fields to tasks table for enhanced planner functionality
-- Run this as: psql -U deekshita -d echointunee -f backend/config/update-tasks-table.sql

-- Add task_type column (todo, goal, reminder)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS task_type VARCHAR(20) DEFAULT 'todo';

-- Add reminder_time column for timed reminders
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS reminder_time TIME;

-- Add is_important flag
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE;

-- Add notes column for AI suggestions
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_important ON tasks(is_important);
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, due_date);

-- Confirmation
SELECT 'Tasks table updated successfully!' as status;

