/**
 * echo:Intune - Backend Server
 * 
 * Main Express server configuration and setup
 * Handles API routing, authentication, and middleware configuration
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import session from 'express-session'

// Import route handlers
import authRoutes from './routes/auth.js'
import journalRoutes from './routes/journal.js'
import moodRoutes from './routes/mood.js'
import taskRoutes from './routes/tasks.js'
import habitRoutes from './routes/habits.js'
import aiRoutes from './routes/ai.js'
import userRoutes from './routes/user.js'
import oauthRoutes from './routes/oauth.js'
import contactRoutes from './routes/contact.js'

// Import passport configuration
import passport from './config/passport.js'

// Load environment variables from .env file
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5002

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Security middleware - Sets various HTTP headers for security
app.use(helmet())

// CORS - Allow requests from frontend (configure for production domains)
app.use(cors({
  origin: [
    'http://localhost:3000',  // React default port
    'http://localhost:5173'   // Vite default port
  ],
  credentials: true  // Allow cookies for session management
}))

// HTTP request logging (only in development)
app.use(morgan('dev'))

// Parse JSON request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session middleware - Required for OAuth authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Initialize Passport.js for authentication
app.use(passport.initialize())
app.use(passport.session())

// ============================================
// ROUTES
// ============================================

// Health check endpoint - Used to verify server is running
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'echo:Intune API is running' })
})

// Mount API route handlers
app.use('/api/auth', authRoutes)
app.use('/api/auth', oauthRoutes) // OAuth routes (Google, GitHub, forgot password)
app.use('/api/journal', journalRoutes)
app.use('/api/moods', moodRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/user', userRoutes)
app.use('/api/contact', contactRoutes)

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - Catch all undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler - Catches all errors from routes
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    // Include stack trace only in development mode for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  }
})

export default app

