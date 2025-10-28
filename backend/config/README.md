# 🔧 Backend Configuration

This directory contains configuration files for the Echo: Intune backend.

---

## 📂 Files Overview

### Core Configuration

**`database.js`**
- Database connection pool configuration
- Uses PostgreSQL with connection pooling
- Default database: `ECHO-intune`
- Default user: `deekshita`

**`passport.js`**
- Authentication configuration
- Passport.js strategies:
  - Local strategy (email/password)
  - Google OAuth 2.0 strategy
- User serialization/deserialization

---

## 🗄️ Database Setup

### Fresh Database Installation

Use the consolidated SQL script:

**`fresh-init.sql`**
- Complete database initialization
- Creates database `ECHO-intune`
- Sets up all tables with latest schemas
- Creates indexes and triggers
- Grants permissions to user `deekshita`

**Quick Setup:**
```bash
# From project root
chmod +x fresh-setup.sh
./fresh-setup.sh
```

**Manual Setup:**
```bash
sudo -u postgres psql -f backend/config/fresh-init.sql
```

See [FRESH_START_GUIDE.md](../../FRESH_START_GUIDE.md) for detailed instructions.

---

## 📦 Archive Folder

The `archive/` folder contains old migration files that are **no longer needed** for fresh setups.

These are kept for reference only and can be safely deleted.

---

## 🔐 Environment Variables

The backend requires these variables in `backend/.env`:

### Database
```env
DATABASE_URL=postgresql://deekshita:password@localhost:5432/ECHO-intune
```

Or separately:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=deekshita
DB_PASSWORD=your_password
DB_NAME=ECHO-intune
```

### Authentication
```env
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret
```

### Google OAuth
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5002/api/auth/google/callback
```

### Gemini AI
```env
GEMINI_API_KEY=your-gemini-api-key
```

### Email (Optional)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### URLs
```env
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Starting the Backend

```bash
cd backend
npm install
npm start
```

Backend will run on: `http://localhost:5002`

---

## 🧪 Testing Database Connection

```bash
# Test PostgreSQL connection
psql -U deekshita -d ECHO-intune

# Inside psql, list tables
\dt

# Exit
\q
```

---

## 📊 Database Schema

### Tables

1. **users** - User accounts and profiles
2. **journal_entries** - Journal entries with emotion detection
3. **mood_entries** - Manual mood tracking
4. **tasks** - Task management
5. **habits** - Habit tracking
6. **habit_tracking** - Habit completion records
7. **contact_messages** - Contact form submissions

### Key Features

- ✅ All tables have `created_at` and `updated_at` timestamps
- ✅ Automatic timestamp updates via triggers
- ✅ Foreign key constraints with CASCADE delete
- ✅ Optimized indexes for performance
- ✅ Unique constraints where needed
- ✅ JSONB support for flexible data

---

## 🔄 Database Migrations

For a fresh start, always use `fresh-init.sql`.

If you need to modify the schema:
1. Update `fresh-init.sql` with your changes
2. Drop and recreate the database
3. Or manually apply changes with `ALTER TABLE` commands

---

## 🆘 Troubleshooting

### Can't connect to database?

1. Check PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Verify credentials:
   ```bash
   psql -U deekshita -d ECHO-intune
   ```

3. Check `.env` file has correct `DATABASE_URL`

### Permission denied errors?

```sql
-- As postgres superuser
GRANT ALL PRIVILEGES ON DATABASE "ECHO-intune" TO deekshita;
\c "ECHO-intune"
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO deekshita;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO deekshita;
```

### Database doesn't exist?

```bash
sudo -u postgres psql -f backend/config/fresh-init.sql
```

---

## 📚 Additional Resources

- [SETUP_GUIDE.md](../../SETUP_GUIDE.md) - Complete setup guide
- [FRESH_START_GUIDE.md](../../FRESH_START_GUIDE.md) - Database setup guide
- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Production deployment
- [GEMINI_SETUP_GUIDE.md](../../GEMINI_SETUP_GUIDE.md) - AI configuration

---

*Last updated: October 2025*

