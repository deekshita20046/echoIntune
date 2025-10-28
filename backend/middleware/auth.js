/**
 * Authentication Middleware
 * 
 * Provides JWT-based authentication for protected routes
 * Handles token verification and user identification
 */

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Authenticate middleware - Verifies JWT token from Authorization header
 * Extracts user info and attaches it to req.user for use in routes
 * 
 * Usage: Add as middleware to protected routes
 * Example: router.get('/protected', authenticate, (req, res) => { ... })
 */
export const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header (format: "Bearer <token>")
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    // Remove "Bearer " prefix to get the actual token
    const token = authHeader.substring(7)

    // Verify token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // Attach user info to request object
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * Generate JWT token - Creates a signed JWT token for user authentication
 * 
 * @param {number} userId - User's database ID
 * @param {string} email - User's email address
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },  // Payload - data stored in token
    process.env.JWT_SECRET,  // Secret key for signing
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // Token expiration (default 7 days)
  )
}

