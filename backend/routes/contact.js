import express from 'express'
import nodemailer from 'nodemailer'
import { query } from '../config/database.js'

const router = express.Router()

/**
 * Contact Routes
 * Handles contact form submissions and saves them to database
 * Optionally sends email notifications to developer
 */

// Contact form submission endpoint
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Save to database first
    const insertQuery = `
      INSERT INTO contact_messages (name, email, message, status, email_sent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `
    const result = await query(insertQuery, [name, email, message, 'new', false])
    const contactId = result.rows[0].id

    // Try to send email notification to developer
    let emailSent = false
    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      })

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.DEVELOPER_EMAIL || 'mdratnam04@gmail.com',
        subject: `New Contact Form Message from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Message ID: ${contactId}<br>
            Submitted: ${new Date().toLocaleString()}
          </p>
        `,
        replyTo: email
      }

      // Send email
      await transporter.sendMail(mailOptions)
      emailSent = true

      // Update database with email_sent status
      await query(
        'UPDATE contact_messages SET email_sent = $1 WHERE id = $2',
        [true, contactId]
      )

    } catch (emailError) {
      // Email failed but message is saved in database
      // Update status to indicate email failed
      await query(
        'UPDATE contact_messages SET status = $1 WHERE id = $2',
        ['email_failed', contactId]
      )
    }

    // Return success even if email fails (message is saved in DB)
    res.status(200).json({ 
      message: 'Message sent successfully',
      success: true,
      contactId: contactId,
      emailSent: emailSent
    })

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send message. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get all contact messages (admin endpoint - for future admin panel)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, message, status, email_sent, created_at FROM contact_messages ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

export default router

