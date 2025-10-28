import express from 'express'
import { body, validationResult } from 'express-validator'
import { query } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * Habit Tracker Routes
 * Handles CRUD operations for habits and habit tracking
 * All routes require authentication
 */

// Require authentication for all habit routes
router.use(authenticate)

// Get all habits for user with their tracking history
router.get('/', async (req, res) => {
  try {
    const habitsResult = await query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    )

    // Get tracking data for each habit
    const habits = await Promise.all(
      habitsResult.rows.map(async (habit) => {
        const trackingResult = await query(
          'SELECT to_char(date, \'YYYY-MM-DD\') as date FROM habit_tracking WHERE habit_id = $1 AND completed = true ORDER BY date DESC',
          [habit.id]
        )
        
        // Convert dates to YYYY-MM-DD string format
        const marked_days = trackingResult.rows.map(row => row.date)
        
        return {
          ...habit,
          marked_days,
        }
      })
    )

    res.json({ habits })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' })
  }
})

// Create a new habit
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('icon').optional(),
    body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'custom']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, icon, frequency } = req.body

      const result = await query(
        'INSERT INTO habits (user_id, name, icon, frequency) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.userId, name, icon || '🎯', frequency || 'daily']
      )

      res.status(201).json({ habit: { ...result.rows[0], marked_days: [] } })
    } catch (error) {
      res.status(500).json({ error: 'Failed to create habit' })
    }
  }
)

// Update existing habit
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, frequency } = req.body

    const result = await query(
      'UPDATE habits SET name = COALESCE($1, name), icon = COALESCE($2, icon), frequency = COALESCE($3, frequency) WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, icon, frequency, req.params.id, req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    // Get tracking data for the updated habit
    const trackingResult = await query(
      'SELECT to_char(date, \'YYYY-MM-DD\') as date FROM habit_tracking WHERE habit_id = $1 AND completed = true ORDER BY date DESC',
      [req.params.id]
    )
    
    const marked_days = trackingResult.rows.map(row => row.date)

    res.json({ habit: { ...result.rows[0], marked_days } })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit' })
  }
})

// Delete habit permanently
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    res.json({ message: 'Habit deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' })
  }
})

// Mark a specific day as complete for a habit
router.post('/:id/mark', async (req, res) => {
  try {
    const { date } = req.body

    // Verify habit belongs to authenticated user
    const habitCheck = await query(
      'SELECT id FROM habits WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    )

    if (habitCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    // Insert or update tracking entry (upsert)
    await query(
      'INSERT INTO habit_tracking (habit_id, date, completed) VALUES ($1, $2, true) ON CONFLICT (habit_id, date) DO UPDATE SET completed = true',
      [req.params.id, date]
    )

    res.json({ message: 'Day marked successfully', habitId: req.params.id, date })
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark day' })
  }
})

// Unmark a specific day for a habit
router.delete('/:id/mark', async (req, res) => {
  try {
    const { date } = req.body

    // Remove tracking entry for the specified date
    await query(
      'DELETE FROM habit_tracking WHERE habit_id = $1 AND date = $2',
      [req.params.id, date]
    )

    res.json({ message: 'Day unmarked successfully', habitId: req.params.id, date })
  } catch (error) {
    res.status(500).json({ error: 'Failed to unmark day' })
  }
})

// Get habit statistics (total days, streak, etc.)
router.get('/:id/stats', async (req, res) => {
  try {
    const trackingResult = await query(
      'SELECT date, completed FROM habit_tracking WHERE habit_id = $1 ORDER BY date DESC',
      [req.params.id]
    )

    const markedDays = trackingResult.rows.filter(row => row.completed).map(row => row.date)

    // Calculate current streak (consecutive days from today backwards)
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < markedDays.length; i++) {
      const markedDate = new Date(markedDays[i])
      markedDate.setHours(0, 0, 0, 0)
      const daysDiff = Math.floor((today - markedDate) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }

    res.json({
      totalDays: markedDays.length,
      currentStreak: streak,
      markedDays,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habit statistics' })
  }
})

export default router

