# 🌊 echo:Intune - Correct Port Numbers

## Service Ports

### Frontend (React + Vite)
- **Port:** 3000
- **URL:** http://localhost:3000
- **Config:** Set in `frontend/vite.config.js`

### Backend (Node.js + Express)
- **Port:** 5002
- **URL:** http://localhost:5002
- **Health Check:** http://localhost:5002/health
- **Config:** Set in `backend/.env` (PORT=5002)

### ML Service (Python + Flask) - Optional
- **Port:** 5001
- **URL:** http://localhost:5001
- **Health Check:** http://localhost:5001/health
- **Config:** Set in `ml-service/.env` (PORT=5001)

---

## Complete Startup

```bash
# Terminal 1 - Backend (Port 5002)
cd backend
npm start

# Terminal 2 - Frontend (Port 3000)
cd frontend
npm run dev
# Opens at: http://localhost:3000

# Terminal 3 - ML Service (Port 5001) - OPTIONAL
cd ml-service
source venv/bin/activate
python3 app.py
```

---

## Quick Test

**Frontend:** http://localhost:3000 ✅
**Backend API:** http://localhost:5002/health ✅
**ML Service:** http://localhost:5001/health ✅ (optional)

---

## Why Port 3000?

The frontend is configured to use port 3000 instead of Vite's default (5173) in:
- `frontend/vite.config.js` - Line 8: `port: 3000`

This is the standard Create React App port, making it familiar for developers.
