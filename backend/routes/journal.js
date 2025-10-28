import express from 'express'
import { body, validationResult } from 'express-validator'
import { query } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * Journal Routes
 * Handles CRUD operations for journal entries
 * All routes require authentication
 */

// Require authentication for all journal routes
router.use(authenticate)

// Search journal entries with filters
// IMPORTANT: This route MUST be defined before /:id to avoid route conflicts
router.get('/search', async (req, res) => {
  try {
    const { q, emotion, date, startDate, endDate } = req.query
    
    let sql = 'SELECT * FROM journal_entries WHERE user_id = $1'
    const params = [req.user.userId]
    let paramIndex = 2

    // Search by keywords in content
    if (q && q.trim()) {
      sql += ` AND content ILIKE $${paramIndex}`
      params.push(`%${q.trim()}%`)
      paramIndex++
    }

    // Filter by emotion
    if (emotion && emotion.trim()) {
      sql += ` AND emotion = $${paramIndex}`
      params.push(emotion.trim())
      paramIndex++
    }

    // Filter by specific date
    if (date) {
      sql += ` AND DATE(created_at) = $${paramIndex}`
      params.push(date)
      paramIndex++
    }

    // Filter by date range
    if (startDate && endDate) {
      sql += ` AND DATE(created_at) BETWEEN $${paramIndex} AND $${paramIndex + 1}`
      params.push(startDate, endDate)
      paramIndex += 2
    } else if (startDate) {
      sql += ` AND DATE(created_at) >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    } else if (endDate) {
      sql += ` AND DATE(created_at) <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    sql += ' ORDER BY created_at DESC'

    const result = await query(sql, params)
    res.json({ journals: result.rows, count: result.rows.length })
  } catch (error) {
    res.status(500).json({ error: 'Failed to search journal entries' })
  }
})

// Get all journal entries for authenticated user (paginated)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const result = await query(
      'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.userId, limit, offset]
    )

    res.json({ journals: result.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' })
  }
})

// Get single journal entry by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }

    res.json({ journal: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry' })
  }
})

// Create new journal entry with optional emotion detection
router.post(
  '/',
  [
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('emotion').optional(),
    body('probability').optional().isFloat({ min: 0, max: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { content, emotion, probability } = req.body

      const result = await query(
        'INSERT INTO journal_entries (user_id, content, emotion, probability) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.userId, content, emotion || null, probability || null]
      )

      res.status(201).json({ journal: result.rows[0] })
    } catch (error) {
      res.status(500).json({ error: 'Failed to create journal entry' })
    }
  }
)

// Update existing journal entry
router.put('/:id', async (req, res) => {
  try {
    const { content, emotion, probability } = req.body

    const result = await query(
      'UPDATE journal_entries SET content = $1, emotion = $2, probability = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [content, emotion, probability, req.params.id, req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }

    res.json({ journal: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update journal entry' })
  }
})

// Delete journal entry permanently
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }

    res.json({ message: 'Journal entry deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry' })
  }
})

export default router

