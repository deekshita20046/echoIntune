/**
 * OAuth and Password Reset Routes
 * 
 * Handles Google OAuth authentication and password reset functionality
 * Includes forgot password and reset password endpoints
 */

import express from 'express'
import passport from '../config/passport.js'
import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Google OAuth authentication routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      const user = req.user
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
    } catch (error) {
      console.error('Google OAuth error:', error)
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
    }
  }
)

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    
    // Check if user exists
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    
    if (!user) {
      // Return error if user not found
      return res.status(404).json({ 
        error: 'No account found with this email address.' 
      })
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    
    // Store reset token in database
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
      [resetToken, user.id]
    )
    
    // Send email using nodemailer
    const nodemailer = await import('nodemailer')
    
    try {
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      })
      
      // Create reset link
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request - echo:Intune',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Password Reset Request</h2>
            <p>Hello ${user.name || 'there'},</p>
            <p>You requested to reset your password for your echo:Intune account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666;">Or copy and paste this link into your browser:</p>
            <p style="color: #1e40af; word-break: break-all;">${resetLink}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">Echo: Intune - Your digital wellness companion</p>
          </div>
        `
      }
      
      await transporter.sendMail(mailOptions)
      console.log(`✉️ Password reset email sent to ${email}`)
      
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError)
      // Still return success but log the error
    }
    
    res.json({
      message: 'Password reset link sent to your email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    })
    
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Failed to process password reset request' })
  }
})

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }
    
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Check if reset token is valid and not expired
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
      [decoded.userId, token]
    )
    
    const user = result.rows[0]
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }
    
    // Hash new password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password and clear reset token
    await query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    )
    
    res.json({ message: 'Password reset successfully' })
    
  } catch (error) {
    console.error('Reset password error:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid reset token' })
    }
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

// Get OAuth providers status
router.get('/providers', (req, res) => {
  res.json({
    google: {
      enabled: !!process.env.GOOGLE_CLIENT_ID,
      clientId: process.env.GOOGLE_CLIENT_ID
    }
  })
})

export default router
