# 🚀 echo:Intune - Initialization Guide

## Database Setup (Required - Do This First!)

### Option 1: Automated Setup (Recommended)

```bash
# From project root
./setup-database.sh
```

This will:
- Check if PostgreSQL is running
- Drop old databases if they exist
- Create new `echoIntune` database
- Create all tables with proper schema
- Set up indexes and triggers

### Option 2: Manual Setup

```bash
# Make sure PostgreSQL is running
brew services start postgresql@15
# or
sudo service postgresql start

# Run initialization script
psql -U deekshita -d postgres -f backend/config/init-database.sql
```

### Verify Database Creation

```bash
# Connect to database
psql -U deekshita -d echoIntune

# List tables (should show 7 tables)
\dt

# Exit
\q
```

Expected tables:
- ✅ users
- ✅ journal_entries
- ✅ mood_entries
- ✅ tasks
- ✅ habits
- ✅ habit_tracking
- ✅ contact_messages

## Start the Application

### Terminal 1 - Backend

```bash
cd backend
npm start
```

Expected output:
```
🚀 Server running on port 5002
📊 Environment: development
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:3000/
```

### Terminal 3 - ML Service (Optional)

```bash
cd ml-service
python3 app.py
```

## Test the Application

1. **Open browser:** http://localhost:3000
2. **Register a new account**
3. **Login**
4. **Try creating:**
   - A journal entry
   - A task
   - A habit
   - A mood entry

## Troubleshooting

### "Database echoIntune does not exist"

**Solution:**
```bash
./setup-database.sh
```

### "Connection refused to PostgreSQL"

**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql@15

# Verify it's running
pg_isready -U deekshita
```

### "Backend can't connect to database"

**Solution:**
Check `backend/.env`:
```bash
DB_NAME=echoIntune
DB_USER=deekshita
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### "role deekshita does not exist"

**Solution:**
```bash
# Create PostgreSQL user
createuser -s deekshita
```

## Complete Reset (Fresh Start)

If you want to start completely fresh:

```bash
# 1. Drop database
psql -U deekshita -d postgres -c "DROP DATABASE IF EXISTS \"echoIntune\";"

# 2. Recreate
./setup-database.sh

# 3. Restart backend
cd backend
npm start
```

## Environment Configuration

Make sure your `.env` files are configured:

**backend/.env:**
```bash
NODE_ENV=development
PORT=5002
DB_NAME=echoIntune
DB_USER=deekshita
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
GEMINI_API_KEY=your_gemini_key
```

**frontend/.env:**
```bash
VITE_API_URL=http://localhost:5002/api
```

---

## Quick Start Summary

```bash
# 1. Initialize database
./setup-database.sh

# 2. Start backend
cd backend && npm start

# 3. Start frontend (new terminal)
cd frontend && npm run dev

# 4. Open browser
# http://localhost:3000
```

---

**Database:** echoIntune  
**Project:** echo:Intune  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
