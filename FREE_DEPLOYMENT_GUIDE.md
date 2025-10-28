# 🚀 FREE Deployment Guide for echo:Intune

## 🎯 Best FREE Stack

We'll use these platforms (all have generous free tiers):

| Service | Platform | Cost |
|---------|----------|------|
| **Frontend** | Vercel | FREE ✅ |
| **Backend** | Render | FREE ✅ |
| **Database** | Neon | FREE ✅ |
| **ML Service** | Render | FREE ✅ (optional) |

**Total Cost: $0/month** 🎉

---

## 📋 Deployment Steps

### STEP 1: Deploy Database (Neon - FREE PostgreSQL)

#### 1.1 Create Neon Account
1. Go to: **https://neon.tech**
2. Sign up with GitHub (easiest)
3. Click "Create a Project"

#### 1.2 Configure Database
- **Project Name:** echoIntune
- **Region:** Choose closest to you
- **PostgreSQL Version:** 15 or 16
- Click **"Create Project"**

#### 1.3 Get Connection String
After creating, you'll see:
```
postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
```

**Save this!** You'll need it later.

#### 1.4 Initialize Database
1. Click **"SQL Editor"** in Neon dashboard
2. Copy contents of `backend/config/init-database.sql`
3. Paste into SQL Editor
4. Click **"Run"**

✅ Database is ready!

---

### STEP 2: Deploy Backend (Render)

#### 2.1 Create Render Account
1. Go to: **https://render.com**
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**

#### 2.2 Connect Repository
1. Connect your GitHub account
2. Select **"echoIntune"** repository
3. Click **"Connect"**

#### 2.3 Configure Web Service
```
Name: echointune-backend
Region: Choose closest to you
Branch: main
Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

**Plan:** FREE ✅

#### 2.4 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these (from your local `backend/.env`):

```
NODE_ENV=production
PORT=5002

# Database (from Neon)
DB_HOST=your-neon-host
DB_PORT=5432
DB_USER=your-neon-user
DB_PASSWORD=your-neon-password
DB_NAME=neondb
DATABASE_URL=your-full-neon-connection-string

# JWT & Session
JWT_SECRET=your-secure-random-string
SESSION_SECRET=your-secure-random-string

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs (will update after frontend deploy)
FRONTEND_URL=https://your-app.vercel.app
ML_SERVICE_URL=https://echointune-ml.onrender.com
```

**Click "Create Web Service"**

Wait 5-10 minutes for deployment...

✅ Your backend will be at: `https://echointune-backend.onrender.com`

---

### STEP 3: Deploy Frontend (Vercel)

#### 3.1 Create Vercel Account
1. Go to: **https://vercel.com**
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**

#### 3.2 Import Repository
1. Select **"echoIntune"**
2. Click **"Import"**

#### 3.3 Configure Project
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 3.4 Add Environment Variables
Click **"Environment Variables"**

Add these:
```
VITE_API_URL=https://echointune-backend.onrender.com
VITE_ML_API_URL=https://echointune-ml.onrender.com
```

**Click "Deploy"**

Wait 2-3 minutes...

✅ Your frontend will be at: `https://echointune.vercel.app`

---

### STEP 4: Update Backend CORS & URLs

#### 4.1 Update Backend Environment Variables
Go back to Render dashboard → Your backend service → Environment

Update:
```
FRONTEND_URL=https://echointune.vercel.app
```

**Save Changes** → Service will redeploy automatically

#### 4.2 Update CORS in Code (Optional)
If you get CORS errors, update `backend/server.js`:

```javascript
const corsOptions = {
  origin: 'https://echointune.vercel.app',
  credentials: true
};
app.use(cors(corsOptions));
```

Commit and push:
```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push origin main
```

Render will auto-deploy the update!

---

### STEP 5: Deploy ML Service (Render - Optional)

#### 5.1 Create Another Web Service
1. In Render dashboard: **"New +"** → **"Web Service"**
2. Select **"echoIntune"** repo again

#### 5.2 Configure ML Service
```
Name: echointune-ml
Region: Same as backend
Branch: main
Root Directory: ml-service
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app --bind 0.0.0.0:$PORT
```

**Plan:** FREE ✅

#### 5.3 Add Environment Variables
```
PORT=5001
FLASK_ENV=production
CORS_ORIGINS=https://echointune.vercel.app
```

**Click "Create Web Service"**

✅ ML service will be at: `https://echointune-ml.onrender.com`

---

## 🎉 Deployment Complete!

### Your Live URLs:
- **Frontend:** https://echointune.vercel.app
- **Backend:** https://echointune-backend.onrender.com
- **ML Service:** https://echointune-ml.onrender.com
- **Database:** Neon (internal)

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render (Backend + ML):**
- ⏱️ Spins down after 15 min of inactivity
- 🐌 First request after sleep takes 30-60 seconds (cold start)
- ✅ Perfect for portfolio/demo projects
- 💡 Solution: Use a service like UptimeRobot to ping every 14 minutes

**Vercel (Frontend):**
- ⚡ Always fast, no sleep
- ✅ Best free tier for frontend

**Neon (Database):**
- 📊 500MB storage free
- ✅ Plenty for this app
- 🔄 Auto-pauses after inactivity (resumes instantly)

---

## 🔧 Post-Deployment Checklist

### 1. Test Your Deployment
- ✅ Visit frontend URL
- ✅ Try to register/login
- ✅ Create a journal entry
- ✅ Check mood tracker
- ✅ Test AI insights

### 2. Update Google OAuth
1. Go to Google Cloud Console
2. Add authorized redirect URI:
   ```
   https://echointune.vercel.app/oauth/callback
   ```

### 3. Monitor Your Services
- **Render Dashboard:** Check logs if issues
- **Vercel Dashboard:** Check deployments
- **Neon Dashboard:** Monitor database

---

## 🐛 Troubleshooting

### "Service Unavailable" on first load
- **Cause:** Render free tier cold start
- **Solution:** Wait 30-60 seconds, refresh

### CORS Errors
- Check `FRONTEND_URL` is set correctly in backend
- Update `backend/server.js` CORS settings
- Restart backend service

### Database Connection Errors
- Check Neon connection string is correct
- Ensure SSL mode is enabled
- Check Neon project is active

### "Build Failed"
- Check build logs in Render/Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check Node.js/Python version compatibility

---

## 💡 Pro Tips

### Speed Up Cold Starts
Use **UptimeRobot** (free):
1. Sign up at uptimerobot.com
2. Add monitors for:
   - Backend: `https://echointune-backend.onrender.com/health`
   - ML Service: `https://echointune-ml.onrender.com/health`
3. Set interval: 5 minutes
4. Your services stay warm!

### Auto-Deploy on Git Push
Already set up! Every `git push` to main:
- Vercel auto-deploys frontend
- Render auto-deploys backend & ML
- No manual deployment needed!

### Environment Variables
- Never commit `.env` files
- Use platform dashboards to update env vars
- Restart services after env var changes

---

## 📊 Monitoring & Analytics (Optional FREE tools)

### Sentry (Error Tracking)
- Sign up: sentry.io
- Add to React & Node.js
- Track errors in production

### Google Analytics
- Add GA to frontend
- Track user behavior
- Monitor performance

---

## 🎯 Summary

**Your app is now LIVE and FREE!** 🎉

**Next steps:**
1. Share your live link!
2. Add to your portfolio
3. Put on LinkedIn/resume
4. Continue adding features

**Remember:**
- Render services sleep after 15 min (expected on free tier)
- Vercel frontend is always fast
- Database auto-pauses but wakes instantly

---

**Congratulations!** You've deployed a full-stack production app! 🚀

**Live Demo:** https://echointune.vercel.app

Built with ❤️ and deployed for FREE!
