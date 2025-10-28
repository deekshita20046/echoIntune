# Database Setup for echo:Intune

## Quick Setup Guide

### Step 1: Initialize the Database

Run the initialization script to create a fresh database:

```bash
# From the project root
psql -U deekshita -d postgres -f backend/config/init-database.sql
```

**What this does:**
- Drops old databases (ECHO-intune, echoIntune) if they exist
- Creates new database named "echoIntune"
- Creates all tables (users, journal_entries, mood_entries, tasks, habits, etc.)
- Sets up indexes for better performance
- Creates triggers for auto-updating timestamps
- Grants necessary permissions

### Step 2: Verify Database Creation

```bash
# Connect to the database
psql -U deekshita -d echoIntune

# List all tables
\dt

# You should see:
# - users
# - journal_entries
# - mood_entries
# - tasks
# - habits
# - habit_tracking
# - contact_messages

# Exit
\q
```

### Step 3: Update Your .env File

Make sure `backend/.env` has:
```bash
DB_NAME=echoIntune
DB_USER=deekshita
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Step 4: Test the Connection

```bash
# Start the backend
cd backend
npm start

# Should see:
# ✅ Database connected successfully (if using old logging)
# 🚀 Server running on port 5002
```

## Database Schema

### Tables Created:

1. **users** - User accounts and profiles
   - id, username, name, email, password
   - avatar, google_id, reset_token
   - gender, birthday, bio, pronouns
   - timezone, occupation, location, interests

2. **journal_entries** - Journal entries with emotion detection
   - id, user_id, content, emotion, probability
   - created_at

3. **mood_entries** - Manual mood tracking
   - id, user_id, emotion, note, date
   - Unique constraint on (user_id, date)

4. **tasks** - Tasks/planner items
   - id, user_id, title, description
   - completed, priority, due_date, reminder_time
   - task_type (todo/goal/reminder)

5. **habits** - User habits
   - id, user_id, name, icon, frequency

6. **habit_tracking** - Habit completion tracking
   - id, habit_id, date, completed
   - Unique constraint on (habit_id, date)

7. **contact_messages** - Contact form submissions
   - id, name, email, message, status, email_sent

## Troubleshooting

### "Database does not exist" error:
```bash
# Re-run the initialization script
psql -U deekshita -d postgres -f backend/config/init-database.sql
```

### "Permission denied" error:
```bash
# Make sure you're using the correct database user
# Check your .env file for DB_USER and DB_PASSWORD
```

### "Connection refused" error:
```bash
# Make sure PostgreSQL is running
brew services start postgresql@15
# or
sudo service postgresql start
```

### Reset Everything (Fresh Start):
```bash
# This will delete ALL data!
psql -U deekshita -d postgres -c "DROP DATABASE IF EXISTS \"echoIntune\";"
psql -U deekshita -d postgres -f backend/config/init-database.sql
```

## Database Maintenance

### Backup Database:
```bash
pg_dump -U deekshita echoIntune > backup_$(date +%Y%m%d).sql
```

### Restore Database:
```bash
psql -U deekshita -d echoIntune < backup_20251028.sql
```

### View Database Size:
```bash
psql -U deekshita -d echoIntune -c "
SELECT 
    pg_size_pretty(pg_database_size('echoIntune')) as size;
"
```

---

**Database Name:** echoIntune  
**Project Name:** echo:Intune  
**Last Updated:** 2025-10-28

