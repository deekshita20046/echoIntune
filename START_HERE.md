# 🚀 START HERE - echo:Intune Setup

## What To Do Right Now (Simple Steps)

### Step 1: Initialize the Database

Run this ONE command:

```bash
./setup-database.sh
```

**That's it!** This script will:
- Create the `echoIntune` database
- Create all 7 tables
- Set up everything you need

### Step 2: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 3: Open Your Browser

Go to: **http://localhost:3000**

---

## That's All You Need!

The database is ready, the code is clean, everything is configured.

Just run those 3 steps above and you're done! 🎉

---

## Files You Need to Know About

### Database Setup
- **`setup-database.sh`** ← The ONE script to set up your database
- **`backend/config/init-database.sql`** ← The SQL file (used by the script above)

### Configuration
- **`backend/.env`** ← Your backend secrets (already configured)
- **`frontend/.env`** ← Your frontend config (already configured)

### Documentation
- **`INITIALIZATION_GUIDE.md`** ← Detailed setup guide
- **`README.md`** ← Project overview
- **`SECURITY.md`** ← Security information

---

## Troubleshooting

### Error: "PostgreSQL not running"
```bash
brew services start postgresql@15
```

### Error: "Database already exists"
That's fine! The script will recreate it.

### Error: "Permission denied"
```bash
chmod +x setup-database.sh
```

---

## Quick Reference

**Initialize Database:**
```bash
./setup-database.sh
```

**Start Backend:**
```bash
cd backend && npm start
```

**Start Frontend:**
```bash
cd frontend && npm run dev
```

**View Database:**
```bash
psql -U deekshita -d echoIntune
\dt        # List tables
\q         # Quit
```

---

## Need Help?

1. Check `INITIALIZATION_GUIDE.md` for detailed instructions
2. Check `DATABASE_SETUP.md` for database-specific help
3. Check `SECURITY.md` for environment variable setup

---

**Database Name:** echoIntune  
**Project Name:** echo:Intune  
**Version:** 2.0.0

🎯 **Goal:** Get your app running in 3 simple steps above!

