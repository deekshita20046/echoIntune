# Deployment Guide

## Overview

This guide covers deploying Echo: Intune to production. The application consists of three main services:
1. **Frontend** (React + Vite)
2. **Backend** (Node.js + Express)
3. **ML Service** (Python + Flask) - Optional

## Prerequisites

Before deployment, ensure you have:
- [ ] All environment variables configured (see SECURITY.md)
- [ ] PostgreSQL database provisioned
- [ ] Domain name (recommended)
- [ ] SSL certificate (for HTTPS)

## Deployment Options

### Option 1: Platform as a Service (Recommended for Beginners)

#### Frontend - Vercel/Netlify

**Vercel (Recommended)**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

5. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` - Your backend URL (e.g., `https://api.yourdomain.com/api`)
   - `VITE_ML_API_URL` - Your ML service URL (optional)

**Netlify Alternative**

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy via Netlify CLI or drag-and-drop `dist` folder to Netlify dashboard

3. Configure environment variables in Netlify dashboard

#### Backend - Railway/Render/Heroku

**Railway (Recommended)**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and create project:
   ```bash
   railway login
   railway init
   ```

3. Add PostgreSQL database:
   ```bash
   railway add postgresql
   ```

4. Set environment variables:
   ```bash
   railway variables set JWT_SECRET=$(openssl rand -base64 32)
   railway variables set SESSION_SECRET=$(openssl rand -base64 32)
   railway variables set NODE_ENV=production
   railway variables set FRONTEND_URL=https://yourdomain.com
   # Add all other environment variables from backend/.env.example
   ```

5. Deploy:
   ```bash
   railway up
   ```

**Render Alternative**

1. Create account at render.com
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`
   - **Environment:** Add all variables from backend/.env.example

**Heroku Alternative**

1. Install Heroku CLI and login
2. Create app:
   ```bash
   heroku create echo-intune-api
   ```

3. Add PostgreSQL:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)
   # ... add all other variables
   ```

5. Deploy:
   ```bash
   git subtree push --prefix backend heroku main
   ```

#### ML Service - Railway/Render (Optional)

1. Follow same steps as backend
2. Use Python buildpack
3. Deploy from `ml-service` directory

### Option 2: Docker Deployment

**Prerequisites:**
- Docker and Docker Compose installed
- VPS or cloud server (DigitalOcean, AWS EC2, etc.)

#### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/config/fresh-init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      # Add all other environment variables
    depends_on:
      - db
    networks:
      - app-network

  # ML Service (Optional)
  ml-service:
    build:
      context: ./ml-service
      dockerfile: Dockerfile
    environment:
      FLASK_ENV: production
      PORT: 5001
    networks:
      - app-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

#### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5002;
    }

    upstream mlservice {
        server ml-service:5001;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        # API Backend
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # ML Service (Optional)
        location /ml {
            proxy_pass http://mlservice;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }
    }
}
```

#### Deployment Steps

1. **Prepare server:**
   ```bash
   # SSH into your server
   ssh user@yourserver.com

   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/echointunee.git
   cd echointunee
   ```

3. **Create .env files:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with production values
   nano backend/.env
   ```

4. **Get SSL certificates** (Let's Encrypt):
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d yourdomain.com
   # Copy certificates to ./ssl directory
   ```

5. **Build and start:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

6. **Initialize database:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec db psql -U $DB_USER -d $DB_NAME -f /docker-entrypoint-initdb.d/init.sql
   ```

7. **Check logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Option 3: Traditional VPS Deployment

#### Frontend Build & Deploy

1. Build frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Serve with Nginx:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/echointunee/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5002;
       }
   }
   ```

#### Backend Deployment

1. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. Install dependencies:
   ```bash
   cd backend
   npm install --production
   ```

3. Use PM2 for process management:
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name echo-intune-backend
   pm2 save
   pm2 startup
   ```

## Post-Deployment Checklist

### Security
- [ ] All environment variables set correctly
- [ ] HTTPS/SSL configured
- [ ] CORS restricted to production domain
- [ ] Database password is strong and secure
- [ ] Firewall configured (only ports 80, 443, 22 open)

### Database
- [ ] PostgreSQL initialized with schema
- [ ] Database backups configured
- [ ] Connection pooling configured

### Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (optional)

### Performance
- [ ] Frontend assets compressed (Vite does this automatically)
- [ ] CDN configured (optional)
- [ ] Database indexes created for frequently queried fields

### Testing
- [ ] Frontend loads correctly
- [ ] API health check: `https://api.yourdomain.com/health`
- [ ] User registration works
- [ ] User login works
- [ ] Journal creation works
- [ ] All features functional

## Environment Variables Summary

### Backend (Production)
```bash
NODE_ENV=production
PORT=5002
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=strong-password-here
DB_NAME=ECHO-intune
JWT_SECRET=generated-secret-here
JWT_EXPIRES_IN=7d
SESSION_SECRET=generated-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
DEVELOPER_EMAIL=developer@yourdomain.com
FRONTEND_URL=https://yourdomain.com
GEMINI_API_KEY=your-gemini-api-key
ML_SERVICE_URL=https://ml.yourdomain.com
```

### Frontend (Production)
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_ML_API_URL=https://ml.yourdomain.com/api
```

## Troubleshooting

### Common Issues

**Frontend can't connect to backend:**
- Check CORS configuration in backend/server.js
- Verify VITE_API_URL is correct
- Check browser console for errors

**Database connection fails:**
- Verify database credentials
- Check database is running: `pg_isready`
- Ensure PostgreSQL accepts remote connections

**JWT token errors:**
- Ensure JWT_SECRET is set and same across restarts
- Check token expiration settings

**Email not sending:**
- Verify EMAIL_USER and EMAIL_PASSWORD
- For Gmail, use app-specific password
- Check firewall allows outbound SMTP

## Backup & Recovery

### Database Backup

```bash
# Manual backup
pg_dump -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# Automated daily backups (cron)
0 2 * * * pg_dump -U $DB_USER $DB_NAME > /backups/db_$(date +\%Y\%m\%d).sql
```

### Restore Database

```bash
psql -U $DB_USER $DB_NAME < backup_20251028.sql
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Multiple backend instances behind load balancer
- Shared PostgreSQL database or managed DB service

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Add database indexes

### Caching
- Redis for session storage
- API response caching
- Database query caching

## Monitoring & Maintenance

### Recommended Tools
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry
- **Logs:** PM2 logs, CloudWatch, Loggly
- **Performance:** New Relic, DataDog

### Regular Maintenance
- Weekly: Review logs and error reports
- Monthly: Update dependencies (`npm audit`)
- Quarterly: Review and rotate secrets
- Annually: Security audit

---

**Last Updated:** 2025-10-28

