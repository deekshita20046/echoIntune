# 🌊 Echo: Intune - Complete Setup Guide

Welcome to **Echo: Intune** - A smart, emotionally-aware journaling and productivity platform with a beautiful ocean theme!

This guide will help you set up and run the entire application locally from scratch.

---

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [ML Service Setup](#ml-service-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [OAuth Configuration (Optional)](#oauth-configuration-optional)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9-3.12) - [Download](https://python.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### Verify Installations

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version
npm --version

# Check Python version
python3 --version  # Should be 3.9-3.12

# Check PostgreSQL
psql --version  # Should be 14+

# Check Git
git --version
```

---

## Quick Start

### 1. Navigate to Project Directory

```bash
cd /Users/deekshita/Desktop/b-uni/echointunee
```

---

## Database Setup

### Step 1: Start PostgreSQL Service

```bash
# For macOS with Homebrew
brew services start postgresql@14

# Or start manually
pg_ctl -D /opt/homebrew/var/postgresql@14 start
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL (use your macOS username, e.g., 'deekshita')
psql -U deekshita -d postgres

# Inside psql, create the database
CREATE DATABASE echointunee;

# Verify it was created
\l

# Exit psql
\q
```

### Step 3: Initialize Database Schema

```bash
# From the project root
cd backend

# Run the initialization script
psql -U deekshita -d echointunee -f config/init-db.sql
```

**Note:** You'll be prompted for your database password. This is the password you set during PostgreSQL installation.

### Step 4: Verify Database Setup

```bash
# Connect to the database
psql -U deekshita -d echointunee

# List all tables
\dt

# You should see: users, journal_entries, mood_entries, tasks, habits, habit_tracking

# Exit psql
\q
```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# In backend directory
touch .env
```

Add the following configuration to `backend/.env`:

```env
# Server Configuration
PORT=5002
NODE_ENV=development

# Database Configuration
DB_USER=deekshita
DB_PASSWORD=your_database_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=echointunee

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Session Secret (generate a strong secret for production)
SESSION_SECRET=your_super_secret_session_key_change_this_in_production_67890

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# ML Service Configuration
ML_SERVICE_URL=http://localhost:5001

# OpenAI Configuration (OPTIONAL - for GPT chat feature)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here_optional

# OAuth Configuration - Google (OPTIONAL)
# Get credentials from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5002/api/auth/google/callback

# OAuth Configuration - GitHub (OPTIONAL)
# Get credentials from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5002/api/auth/github/callback
```

**Important:** Replace `your_database_password_here` with your actual PostgreSQL password!

### Step 3: Test Backend

```bash
# Start the backend server
npm run dev

# You should see:
# 🚀 Server running on port 5002
# 📊 Environment: development
```

Test the health endpoint:
```bash
# In a new terminal
curl http://localhost:5002/health

# Expected response:
# {"status":"OK","message":"Echo: Intune API is running"}
```

---

## ML Service Setup

### Step 1: Navigate to ML Service Directory

```bash
# From project root
cd ml-service
```

### Step 2: Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux

# Your prompt should now show (venv)
```

### Step 3: Install Python Dependencies

```bash
# Install required packages
pip install -r requirements.txt

# This will install:
# - Flask (web framework)
# - flask-cors (CORS support)
# - scikit-learn (ML library)
# - joblib (model persistence)
# - numpy (numerical computing)
# - pandas (data manipulation)
```

**Note:** If you encounter errors with scikit-learn, ensure you're using Python 3.9-3.12 (not 3.13).

### Step 4: Configure ML Service Environment

Create a `.env` file in the `ml-service` directory:

```bash
touch .env
```

Add the following to `ml-service/.env`:

```env
FLASK_ENV=development
PORT=5001
CORS_ORIGINS=http://localhost:3000,http://localhost:5002
```

### Step 5: Test ML Service

```bash
# Start the ML service (with venv activated)
python app.py

# You should see:
# * Running on http://0.0.0.0:5001
```

Test the health endpoint:
```bash
# In a new terminal
curl http://localhost:5001/health

# Expected response with model status
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
# From project root
cd frontend

# Install Node.js dependencies
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
touch .env
```

Add the following to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5002/api
VITE_ML_SERVICE_URL=http://localhost:5001/api
```

### Step 3: Test Frontend

```bash
# Start the development server
npm run dev

# You should see:
# ➜  Local:   http://localhost:3000/
```

---

## Running the Application

### Start All Services

You need **3 terminal windows/tabs** open:

#### Terminal 1: Backend
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5002
```

#### Terminal 2: ML Service
```bash
cd ml-service
source venv/bin/activate  # Activate virtual environment
python app.py
# ML Service runs on http://localhost:5001
```

#### Terminal 3: Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the beautiful ocean-themed landing page! 🌊

---

## OAuth Configuration (Optional)

OAuth allows users to sign in with Google or GitHub. This is **optional** but recommended for better UX.

### Google OAuth Setup

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing

2. **Enable Google+ API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Echo Intune"
   - Authorized redirect URIs:
     - `http://localhost:5002/api/auth/google/callback`

4. **Copy Credentials:**
   - Copy the Client ID and Client Secret
   - Add them to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   ```

### GitHub OAuth Setup

1. **Go to GitHub Developer Settings:**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Register Application:**
   - Application name: "Echo Intune"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:5002/api/auth/github/callback`

3. **Copy Credentials:**
   - Copy the Client ID and generate a Client Secret
   - Add them to `backend/.env`:
   ```env
   GITHUB_CLIENT_ID=your_actual_client_id
   GITHUB_CLIENT_SECRET=your_actual_client_secret
   ```

4. **Restart Backend:**
   ```bash
   # Stop the backend (Ctrl+C) and restart
   npm run dev
   ```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. PostgreSQL Connection Failed

**Error:** `connection to server on socket "/tmp/.s.PGSQL.5432" failed`

**Solution:**
```bash
# Start PostgreSQL service
brew services start postgresql@14

# Check if it's running
brew services list

# Verify you can connect
psql -U deekshita -d echointunee
```

#### 2. Database Password Authentication Failed

**Error:** `password authentication failed for user`

**Solution:**
- Make sure `DB_USER` in `backend/.env` matches your macOS username
- Update `DB_PASSWORD` with your correct PostgreSQL password
- If you forgot your password, reset it:
  ```bash
  psql -U deekshita -d postgres
  ALTER USER deekshita WITH PASSWORD 'your_new_password';
  \q
  ```

#### 3. Port Already in Use

**Error:** `Port 3000/5002/5001 is already in use`

**Solution:**
```bash
# Find what's using the port
lsof -ti:3000  # or 5001, 5002

# Kill the process
kill -9 <PID>

# Or use a different port by updating .env files
```

#### 4. ML Service scikit-learn Installation Error

**Error:** `error: metadata-generation-failed`

**Solution:**
```bash
# Make sure you're using Python 3.9-3.12 (NOT 3.13)
python3 --version

# If needed, install a compatible Python version
brew install python@3.12

# Create venv with specific Python version
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 5. Frontend Build Errors

**Error:** `The border-border class does not exist`

**Solution:**
- Already fixed in the codebase
- If you see this, make sure you pulled the latest code
- Clear npm cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`

#### 6. CORS Errors in Browser

**Error:** `Access to fetch... has been blocked by CORS policy`

**Solution:**
- Ensure `CORS_ORIGIN` in `backend/.env` includes `http://localhost:3000`
- Ensure `VITE_API_URL` in `frontend/.env` is `http://localhost:5002/api`
- Restart backend server

#### 7. Database Tables Not Created

**Error:** Tables missing when running app

**Solution:**
```bash
# Re-run the init script
cd backend
psql -U deekshita -d echointunee -f config/init-db.sql

# If that fails, recreate database
psql -U deekshita -d postgres
DROP DATABASE IF EXISTS echointunee;
CREATE DATABASE echointunee;
\q

# Then run init script again
psql -U deekshita -d echointunee -f config/init-db.sql
```

---

## Project Structure

```
echointunee/
│
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   ├── database.js     # PostgreSQL connection
│   │   ├── init-db.sql     # Database schema
│   │   └── passport.js     # OAuth configuration
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── oauth.js        # OAuth routes
│   │   ├── journal.js      # Journal CRUD
│   │   ├── mood.js         # Mood tracking
│   │   ├── tasks.js        # Task management (Planner)
│   │   ├── habits.js       # Habit tracking
│   │   ├── ai.js           # AI insights & GPT chat
│   │   └── user.js         # User profile
│   ├── server.js           # Express server
│   ├── package.json
│   └── .env                # Environment variables
│
├── ml-service/             # Python + Flask ML API
│   ├── app.py              # Flask server
│   ├── emotion_detector.py # Emotion detection model
│   ├── personalized_insights.py # Advanced analytics
│   ├── requirements.txt    # Python dependencies
│   └── .env                # ML service config
│
├── frontend/               # React + Vite
│   ├── public/
│   │   └── manifest.json   # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Main layout wrapper
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── Wave.jsx             # Ocean wave animation
│   │   │   ├── ShellBadge.jsx       # Ocean-themed badge
│   │   │   ├── OAuthLogin.jsx       # OAuth buttons
│   │   │   ├── OAuthCallback.jsx    # OAuth redirect handler
│   │   │   └── ForgotPassword.jsx   # Password reset
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── MoodContext.jsx      # Mood state
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Landing page (4 sections)
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Home.jsx             # Dashboard/Home
│   │   │   ├── Journal.jsx          # Journaling with AI
│   │   │   ├── Planner.jsx          # 3-tab task planner
│   │   │   ├── HabitTracker.jsx     # Habit tracking
│   │   │   ├── MoodDashboard.jsx    # Mood analytics
│   │   │   ├── AIInsights.jsx       # AI chat & insights
│   │   │   └── Profile.jsx          # User profile
│   │   ├── utils/
│   │   │   ├── api.js               # API client
│   │   │   └── helpers.js           # Utility functions
│   │   ├── index.css                # Ocean theme styles
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # React entry point
│   ├── package.json
│   ├── tailwind.config.js           # Tailwind + Ocean theme
│   ├── vite.config.js               # Vite configuration
│   └── .env                         # Frontend config
│
├── quick-setup.sh          # Automated setup script
├── SETUP_GUIDE.md          # This file
├── TEST_GUIDE.md           # Testing guide
├── DEPLOYMENT.md           # Deployment instructions
├── PROJECT_SUMMARY.md      # Implementation report
├── FINAL_CHECKLIST.md      # Pre-deployment checklist
└── README.md               # Project overview
```

---

## Testing Checklist

Before deploying, test all features:

### Authentication ✅
- [ ] Register new user
- [ ] Login with email/password
- [ ] Logout
- [ ] OAuth login (Google/GitHub) if configured
- [ ] Forgot password flow

### Journal ✅
- [ ] Create journal entry
- [ ] View emotion detection
- [ ] AI follow-up questions appear
- [ ] Search entries by date/emotion
- [ ] View entry details

### Planner ✅
- [ ] View Today tab
- [ ] View This Week tab
- [ ] View Full Calendar tab
- [ ] Add task
- [ ] Mark task complete
- [ ] Edit task
- [ ] Delete task

### Habit Tracker ✅
- [ ] Add new habit
- [ ] Mark habit as done for today
- [ ] View streak counter
- [ ] View mood impact meter
- [ ] Delete habit

### Mood Tracker ✅
- [ ] View mood charts
- [ ] Filter by day/week/month
- [ ] View mood calendar
- [ ] See mood insights

### AI Insights ✅
- [ ] View personalized insights
- [ ] Chat with AI (if OpenAI key configured)
- [ ] Get habit recommendations
- [ ] View productivity analysis

### Profile ✅
- [ ] View profile stats
- [ ] Select avatar
- [ ] Edit profile information
- [ ] View personal statistics

---

## Next Steps

1. **Test Everything**: Follow the testing checklist above
2. **Customize**: Update colors, copy, or features as needed
3. **Deploy**: See `DEPLOYMENT.md` for production deployment
4. **Enhance**: Add more features or integrate additional AI models

---

## Support

### Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### Getting Help
- Check the Troubleshooting section above
- Review error messages carefully
- Check browser console for frontend errors
- Check terminal output for backend/ML errors
- Ensure all environment variables are set correctly

---

## 🎉 Congratulations!

You've successfully set up **Echo: Intune**! Enjoy exploring your emotionally-aware productivity companion with a beautiful ocean theme. 🌊✨

---

**Built with ❤️ using:**
- React + Vite
- Node.js + Express
- Python + Flask
- PostgreSQL
- scikit-learn
- Tailwind CSS + Framer Motion
- OpenAI GPT (optional)

**Happy Coding! 🚀**