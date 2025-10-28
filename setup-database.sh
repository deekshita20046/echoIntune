#!/bin/bash

# ============================================================================
# echo:Intune - Database Setup Script
# ============================================================================
# This script initializes the PostgreSQL database for echo:Intune
# ============================================================================

echo "🌊 echo:Intune - Database Setup"
echo "================================"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -U deekshita > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running!"
    echo "   Start it with: brew services start postgresql@15"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Run the initialization script
echo "📦 Initializing database 'echoIntune'..."
echo ""

psql -U deekshita -d postgres -f backend/config/init-database.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ Database initialized successfully!"
    echo "============================================"
    echo ""
    echo "Database name: echoIntune"
    echo "Tables created: 7"
    echo "  - users"
    echo "  - journal_entries"
    echo "  - mood_entries"
    echo "  - tasks"
    echo "  - habits"
    echo "  - habit_tracking"
    echo "  - contact_messages"
    echo ""
    echo "Next steps:"
    echo "  1. Start backend: cd backend && npm start"
    echo "  2. Start frontend: cd frontend && npm run dev"
    echo "  3. Visit: http://localhost:3000"
    echo ""
else
    echo ""
    echo "❌ Database initialization failed!"
    echo "   Check the error messages above"
    exit 1
fi
