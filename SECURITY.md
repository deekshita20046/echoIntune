# Security Guide

## Overview

This document outlines the security practices and configurations for the Echo: Intune project.

## Environment Variables & Sensitive Data

### ⚠️ CRITICAL: Never Commit Sensitive Data

**All sensitive information must be stored in `.env` files, which are excluded from Git.**

The `.gitignore` file is configured to exclude:
- `.env` files (all variations)
- `node_modules/`
- Python virtual environments
- Database files
- Log files

### Environment Variable Configuration

#### Backend (.env)
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit with your actual values
nano backend/.env
```

**Required Secrets:**
- `JWT_SECRET` - Generate using: `openssl rand -base64 32`
- `SESSION_SECRET` - Generate using: `openssl rand -base64 32`
- `DB_PASSWORD` - Your PostgreSQL database password
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `EMAIL_PASSWORD` - App-specific password for email service
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret (optional)

#### Frontend (.env)
```bash
# Copy the example file
cp frontend/.env.example frontend/.env
```

**Note:** Frontend environment variables are exposed to the client. Never store secrets here.

#### ML Service (.env)
```bash
# Copy the example file
cp ml-service/.env.example ml-service/.env
```

## Git Security Checklist

Before pushing to Git:

1. ✅ Verify `.env` files are **NOT** tracked
   ```bash
   git status
   # Should NOT show any .env files
   ```

2. ✅ Check for accidental sensitive data
   ```bash
   git diff
   # Review changes before committing
   ```

3. ✅ Ensure `.gitignore` is properly configured
   ```bash
   cat .gitignore
   # Verify .env is listed
   ```

## Database Security

### PostgreSQL Configuration

1. **Use strong passwords** for database users
2. **Limit database access** to localhost in development
3. **Use SSL connections** in production
4. **Regular backups** - Set up automated backups

### Connection Security

- Database credentials are stored in `.env` (backend)
- Never hardcode database passwords in code
- Use environment variables for all connection parameters

## Authentication & Authorization

### JWT Tokens

- Tokens are signed with `JWT_SECRET` from environment variables
- Default expiration: 7 days (configurable via `JWT_EXPIRES_IN`)
- Tokens are stored in browser localStorage (frontend)
- All protected routes require valid JWT token

### Password Security

- Passwords are hashed using bcrypt (10 rounds)
- Never store plaintext passwords
- Password reset tokens expire after 1 hour

## API Security

### CORS Configuration

Production CORS configuration (backend/server.js):
```javascript
app.use(cors({
  origin: ['https://yourdomain.com'],  // Your production domain
  credentials: true
}))
```

### Rate Limiting (Recommended for Production)

Consider adding rate limiting to prevent abuse:
```bash
npm install express-rate-limit
```

## Deployment Security

### Production Checklist

1. **Environment Variables**
   - [ ] All secrets stored in deployment platform's secret manager
   - [ ] `NODE_ENV=production` set on all services
   - [ ] Strong, unique secrets generated for production
   - [ ] No development credentials used

2. **HTTPS/SSL**
   - [ ] SSL/TLS certificates configured
   - [ ] All traffic forced to HTTPS
   - [ ] Secure cookies enabled (`secure: true`)

3. **Database**
   - [ ] Production database password is strong and unique
   - [ ] Database backups configured
   - [ ] Database access limited to application servers only

4. **API Keys**
   - [ ] Gemini API key has usage limits configured
   - [ ] Google OAuth credentials are for production domains
   - [ ] Email service has rate limiting

5. **Code**
   - [ ] All console.log statements removed (already done)
   - [ ] Error messages don't expose sensitive information
   - [ ] Stack traces disabled in production

## Monitoring & Auditing

### Recommended Practices

1. **Logging** - Use a proper logging service (e.g., Winston, Morgan)
2. **Error Tracking** - Consider Sentry or similar for production
3. **Security Updates** - Regularly update dependencies
   ```bash
   npm audit
   npm audit fix
   ```

## Emergency Response

### If Secrets Are Compromised

1. **Immediately rotate** all compromised secrets
2. **Update** `.env` files on all environments
3. **Restart** all services with new secrets
4. **Invalidate** existing tokens if JWT secret was exposed
5. **Monitor** for suspicious activity

### If .env File Accidentally Committed

1. **Remove** from Git history:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch backend/.env' \
     --prune-empty --tag-name-filter cat -- --all
   ```
2. **Change** all secrets immediately
3. **Force push** to remote (use with caution)
4. **Notify** team members to delete local copies

## Security Contact

For security issues, please contact: [your-email@example.com]

---

**Last Updated:** 2025-10-28
**Review Schedule:** Quarterly

