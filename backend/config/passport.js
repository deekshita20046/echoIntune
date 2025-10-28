import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'
import { query } from './database.js'

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return done(null, false, { message: 'Invalid email or password' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid email or password' })
    }

    return done(null, user)
  } catch (error) {
    return done(error)
  }
}))

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5002/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE google_id = $1', [profile.id])
    
    if (existingUser.rows.length > 0) {
      return done(null, existingUser.rows[0])
    }

    // Check if user exists with same email
    const emailUser = await query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value])
    
    if (emailUser.rows.length > 0) {
      // Update existing user with Google ID (keep existing avatar or use default emoji)
      const updatedUser = await query(
        'UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *',
        [profile.id, profile.emails[0].value]
      )
      return done(null, updatedUser.rows[0])
    }

    // Create new user with default emoji avatar
    const newUser = await query(
      'INSERT INTO users (username, email, google_id, avatar, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [
        profile.displayName || profile.emails[0].value.split('@')[0],
        profile.emails[0].value,
        profile.id,
        '🐚' // Default emoji instead of Google photo URL
      ]
    )

    return done(null, newUser.rows[0])
  } catch (error) {
    return done(error)
  }
}))

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id])
    const user = result.rows[0]
    done(null, user)
  } catch (error) {
    done(error)
  }
})

export default passport
