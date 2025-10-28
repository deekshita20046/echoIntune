import express from 'express'
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'
import { query } from '../config/database.js'
import { generateToken, authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * Authentication Routes
 * Handles user registration, login, and profile retrieval
 */

// Register endpoint - Creates a new user account
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, email, password } = req.body
      
      // Generate username from email if not provided
      const username = email.split('@')[0]

      // Check if user already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const result = await query(
        'INSERT INTO users (username, name, email, password, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, name, email, avatar, created_at',
        [username, name, email, hashedPassword, '🐚']
      )

      const user = result.rows[0]
      const token = generateToken(user.id, user.email)

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          created_at: user.created_at,
        },
      })
    } catch (error) {
      // Log error for debugging (remove in production or use proper logging service)
      res.status(500).json({ error: 'Registration failed' })
    }
  }
)

// Login endpoint - Authenticates user and returns JWT token
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Find user
      const result = await query('SELECT * FROM users WHERE email = $1', [email])
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const user = result.rows[0]

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = generateToken(user.id, user.email)

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          created_at: user.created_at,
        },
      })
    } catch (error) {
      res.status(500).json({ error: 'Login failed' })
    }
  }
)

// Get current user endpoint - Returns authenticated user's profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, name, email, avatar, created_at FROM users WHERE id = $1',
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router

