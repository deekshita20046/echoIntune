# Deployment Guide - Echo: Intune

This guide covers deploying Echo: Intune to production environments.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │ ──→ Vercel/Netlify
│   (React)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Backend       │ ──→ Render/Railway/Heroku
│   (Node.js)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐  ┌────────────┐
│ PostgreSQL│  │ ML Service │ ──→ Render Docker/Railway
│ Database │  │ (Flask)    │
└──────────┘  └────────────┘
```

## 1. Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (free)
- GitHub repository

### Steps

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/echointunee.git
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Configure:
  - **Framework Preset**: Vite
  - **Root Directory**: `frontend`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  
3. **Environment Variables**
Add in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.com/api
VITE_ML_API_URL=https://your-ml-service-url.com/api
```

4. **Deploy**
- Click "Deploy"
- Wait for deployment to complete
- Access your app at `https://your-app.vercel.app`

### Alternative: Netlify

```bash
cd frontend
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

## 2. Database Deployment (Railway)

### Steps

1. **Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

2. **Create PostgreSQL Database**
- Click "New Project"
- Select "Provision PostgreSQL"
- Copy connection details

3. **Initialize Database**
```bash
# Connect to Railway PostgreSQL
psql postgresql://user:password@host:port/railway

# Run init script
\i backend/config/init-db.sql
```

### Alternative: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Copy PostgreSQL connection string
3. Run SQL in Supabase SQL Editor:
```sql
-- Paste contents of backend/config/init-db.sql
```

## 3. Backend Deployment (Render)

### Prerequisites
- Render account
- GitHub repository

### Steps

1. **Create Web Service**
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect GitHub repository

2. **Configure Service**
- **Name**: echointunee-backend
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

3. **Environment Variables**
```
PORT=5000
NODE_ENV=production
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=railway
JWT_SECRET=generate-secure-random-string
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=https://your-ml-service-url.com
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

4. **Deploy**
- Click "Create Web Service"
- Wait for deployment
- Copy service URL

### Alternative: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
cd backend
railway link

# Add environment variables
railway variables set KEY=VALUE

# Deploy
railway up
```

## 4. ML Service Deployment (Render Docker)

### Prerequisites
- Docker installed locally

### Steps

1. **Test Docker Build Locally**
```bash
cd ml-service
docker build -t echointunee-ml .
docker run -p 5001:5001 echointunee-ml
```

2. **Deploy to Render**
- Go to Render dashboard
- Click "New +" → "Web Service"
- Select "Deploy from Git"
- Choose repository

3. **Configure**
- **Name**: echointunee-ml
- **Root Directory**: `ml-service`
- **Environment**: Docker
- **Docker Command**: (auto-detected from Dockerfile)
- **Plan**: Free

4. **Environment Variables**
```
FLASK_ENV=production
PORT=5001
CORS_ORIGINS=https://your-backend-url.com,https://your-frontend-url.com
```

5. **Deploy**
- Click "Create Web Service"
- Wait for Docker build and deployment
- Copy service URL

### Alternative: Railway Docker

```bash
cd ml-service
railway link
railway up
```

## 5. Production Configuration

### Update Frontend Environment

Update Vercel environment variables:
```
VITE_API_URL=https://echointunee-backend.onrender.com/api
VITE_ML_API_URL=https://echointunee-ml.onrender.com/api
```

Redeploy frontend after updating.

### Update Backend Environment

Update Render environment variables:
```
ML_SERVICE_URL=https://echointunee-ml.onrender.com
CORS_ORIGIN=https://your-app.vercel.app
```

### Security Checklist

- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS on all services
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (add to backend)
- [ ] Set up database backups
- [ ] Configure logging (Sentry, LogRocket)

## 6. Custom Domain (Optional)

### Vercel Custom Domain

1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate

### Render Custom Domain

1. Go to service settings → Custom Domains
2. Add domain
3. Update DNS CNAME record
4. Enable automatic SSL

## 7. Monitoring & Analytics

### Frontend Monitoring

Add to `frontend/src/main.jsx`:
```javascript
// Google Analytics
import ReactGA from 'react-ga4'
ReactGA.initialize('YOUR_GA_ID')

// Sentry (errors)
import * as Sentry from '@sentry/react'
Sentry.init({ dsn: 'YOUR_SENTRY_DSN' })
```

### Backend Monitoring

Add to `backend/server.js`:
```javascript
import * as Sentry from '@sentry/node'
Sentry.init({ dsn: 'YOUR_SENTRY_DSN' })
```

## 8. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-xxx
```

## 9. Performance Optimization

### Frontend
- Enable Vercel Analytics
- Configure caching headers
- Optimize images with CDN
- Enable compression

### Backend
- Add Redis caching (optional)
- Enable database connection pooling
- Add API rate limiting
- Optimize database queries

### ML Service
- Cache emotion detection results
- Use Gunicorn with multiple workers
- Optimize model loading

## 10. Backup Strategy

### Database Backup

Railway automatic backups:
- Enable in project settings
- Configure retention period

Manual backup:
```bash
pg_dump -h host -U user -d database > backup.sql
```

### Restore
```bash
psql -h host -U user -d database < backup.sql
```

## Cost Estimation

### Free Tier
- **Vercel**: Unlimited bandwidth, 100 GB/month
- **Render**: 750 hours/month free
- **Railway**: $5 free credit/month
- **Total**: ~$0-5/month

### Paid Tier (Recommended for production)
- **Vercel Pro**: $20/month
- **Render Standard**: $7/month (backend)
- **Render Standard**: $7/month (ML service)
- **Railway**: $10/month (database)
- **Total**: ~$44/month

## Troubleshooting

### Deployment Fails

1. Check build logs
2. Verify environment variables
3. Test locally with production settings
4. Check service quotas/limits

### Database Connection Issues

1. Verify connection string
2. Check IP whitelist
3. Test connection with `psql`
4. Review firewall rules

### CORS Errors in Production

1. Update CORS_ORIGIN in backend
2. Ensure URLs match exactly (https vs http)
3. Check for trailing slashes
4. Redeploy backend after changes

## Maintenance

### Regular Tasks
- Monitor error logs (weekly)
- Review analytics (weekly)
- Update dependencies (monthly)
- Database backups (weekly)
- Security patches (as needed)

### Scaling
- Upgrade plans as needed
- Add caching layer (Redis)
- Implement CDN
- Database read replicas
- Load balancing

---

**Your Echo: Intune app is now live! 🎉**

Frontend: https://your-app.vercel.app
Backend: https://your-backend.onrender.com
ML Service: https://your-ml.onrender.com

