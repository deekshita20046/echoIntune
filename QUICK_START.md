# 🚀 Quick Start Guide - Echo: Intune

## ⚡ Fast Setup (5 minutes)

### 1️⃣ Start PostgreSQL
```bash
brew services start postgresql@14
```

### 2️⃣ Create Database

**Option A - Automated (Recommended):**
```bash
chmod +x fresh-setup.sh
./fresh-setup.sh
```
This will create `ECHO-intune` database with all tables and permissions.

**Option B - Manual:**
```bash
# As postgres superuser
sudo -u postgres psql -f backend/config/fresh-init.sql

# Or directly
psql -U postgres -f backend/config/fresh-init.sql
```

The script creates:
- Database: `ECHO-intune`
- 7 tables with complete schemas
- All indexes and triggers
- Permissions for user `deekshita`

### 4️⃣ Install Dependencies

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - ML Service:**
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
```

### 5️⃣ Start All Services

**Terminal 1 - Backend (Port 5002):**
```bash
cd backend
npm run dev
```

**Terminal 2 - ML Service (Port 5001):**
```bash
cd ml-service
source venv/bin/activate
python app.py
```

**Terminal 3 - Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```

### 6️⃣ Access the Application

🌐 **Open in browser:** http://localhost:3000

**Service URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5002
- ML Service: http://localhost:5001

---

## 🎯 What You Should See

✅ **Terminal 1 (Backend):**
```
🚀 Server running on port 5002
📊 Environment: development
```

✅ **Terminal 2 (ML Service):**
```
 * Running on http://0.0.0.0:5001
```

✅ **Terminal 3 (Frontend):**
```
  VITE v5.4.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Port 5002 already in use"
```bash
# Find and kill the process
lsof -ti :5002 | xargs kill -9
```

### Issue: "Database connection failed"
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Start if needed
brew services start postgresql@14
```

### Issue: "NLTK data not found"
```bash
cd ml-service
source venv/bin/activate
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

### Issue: "Module not found" (Frontend)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 First Time Setup

1. **Register a new account** at http://localhost:3000/register
2. **Fill in your details:**
   - Name: Your Name
   - Email: your@email.com
   - Password: (minimum 6 characters)
3. **Click "Create Account"**
4. **You'll be automatically logged in!**

---

## 🧪 Test the Features

### Write Your First Journal Entry
1. Click **Journal** in sidebar
2. Write something like: "I am so happy today! Everything is going great!"
3. Click **Save Entry**
4. Watch AI detect your emotion! 😊
5. Respond to AI follow-up questions

### View Mood Analytics
1. Click **Mood Tracker**
2. See your mood trends and charts
3. Switch between week/month/all time views

### Create Tasks
1. Click **Planner**
2. Select a date
3. Add a task
4. Get AI recommendations

### Track Habits
1. Click **Habits**
2. Add a new habit (e.g., "Morning Exercise")
3. Choose an icon
4. Mark days as complete

---

## 🛑 Stopping the Services

Press `Ctrl + C` in each terminal window to stop the services.

To stop PostgreSQL:
```bash
brew services stop postgresql@14
```

---

## 📚 Next Steps

- Read **SETUP_GUIDE.md** for detailed setup
- Check **PORT_CONFIGURATION.md** for port details
- See **DEPLOYMENT.md** for production deployment
- Review **PROJECT_STRUCTURE.md** for architecture

---

## 🆘 Need Help?

**Verify Prerequisites:**
```bash
./check-prerequisites.sh
```

**Check All Services:**
```bash
# Backend
curl http://localhost:5002/health

# ML Service
curl http://localhost:5001/health

# Frontend
open http://localhost:3000
```

**View Logs:**
- Backend: Check Terminal 1
- ML Service: Check Terminal 2
- Frontend: Check Terminal 3 + Browser Console (F12)

---

**🎉 Happy Coding!**

Your Echo: Intune application is now running!

