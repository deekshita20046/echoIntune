/**
 * Task Management Routes
 * 
 * Handles CRUD operations for tasks, reminders, and goals
 * Supports filtering, priority levels, and completion tracking
 * All routes require authentication
 */

import express from 'express'
import { body, validationResult } from 'express-validator'
import { query} from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Require authentication for all task routes
router.use(authenticate)

// Get tasks
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, date, completed } = req.query
    let sql = 'SELECT * FROM tasks WHERE user_id = $1'
    const params = [req.user.userId]

    if (date === 'today') {
      sql += ' AND due_date = CURRENT_DATE'
    } else if (startDate && endDate) {
      sql += ' AND due_date BETWEEN $2 AND $3'
      params.push(startDate, endDate)
    }

    if (completed !== undefined) {
      sql += ` AND completed = $${params.length + 1}`
      params.push(completed === 'true')
    }

    sql += ' ORDER BY completed ASC, priority DESC, due_date ASC'

    const result = await query(sql, params)
    res.json({ tasks: result.rows })
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// Create task
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional().isDate(),
    body('taskType').optional().isIn(['todo', 'goal', 'reminder']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array())
        return res.status(400).json({ errors: errors.array() })
      }

      const { title, description, priority, dueDate, taskType, reminderTime, isImportant, notes } = req.body
      
      console.log('📝 Backend: Creating task with data:', {
        title,
        description,
        priority,
        dueDate,
        taskType,
        reminderTime,
        isImportant,
        notes,
        userId: req.user.userId
      })

      // Fix timezone issue: append time to make it explicit date-only
      const dueDateFixed = dueDate ? `${dueDate}T00:00:00+05:30` : null
      
      console.log('🕐 Original dueDate:', dueDate)
      console.log('🕐 Fixed dueDate (IST):', dueDateFixed)
      
      const result = await query(
        `INSERT INTO tasks (user_id, title, description, priority, due_date, task_type, reminder_time, is_important, notes) 
         VALUES ($1, $2, $3, $4, $5::timestamptz, $6, $7, $8, $9) RETURNING *`,
        [
          req.user.userId, 
          title, 
          description || null, 
          priority || 'medium', 
          dueDateFixed,
          taskType || 'todo',
          reminderTime || null,
          isImportant || false,
          notes || null
        ]
      )
      
      console.log('✅ Task created:', result.rows[0])
      console.log('📅 Created with due_date:', result.rows[0].due_date)

      res.status(201).json({ task: result.rows[0] })
    } catch (error) {
      console.error('Create task error:', error)
      res.status(500).json({ error: 'Failed to create task' })
    }
  }
)

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed, taskType, reminderTime, isImportant, notes } = req.body
    
    console.log('📝 Backend: Updating task', req.params.id, 'with data:', req.body)

    // Build update query dynamically to handle all fields including nulls
    const updates = []
    const values = []
    let paramCount = 1
    
    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      values.push(title)
      paramCount++
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`)
      values.push(description || null)
      paramCount++
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`)
      values.push(priority)
      paramCount++
    }
    if (dueDate !== undefined) {
      // Fix timezone issue: append time to make it explicit date-only
      const dueDateFixed = dueDate ? `${dueDate}T00:00:00+05:30` : null
      console.log('🕐 Update - Original dueDate:', dueDate)
      console.log('🕐 Update - Fixed dueDate (IST):', dueDateFixed)
      updates.push(`due_date = $${paramCount}::timestamptz`)
      values.push(dueDateFixed)
      paramCount++
    }
    if (completed !== undefined) {
      updates.push(`completed = $${paramCount}`)
      values.push(completed)
      paramCount++
    }
    if (taskType !== undefined) {
      updates.push(`task_type = $${paramCount}`)
      values.push(taskType)
      paramCount++
    }
    if (reminderTime !== undefined) {
      updates.push(`reminder_time = $${paramCount}`)
      values.push(reminderTime || null)
      paramCount++
    }
    if (isImportant !== undefined) {
      updates.push(`is_important = $${paramCount}`)
      values.push(isImportant)
      paramCount++
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`)
      values.push(notes || null)
      paramCount++
    }
    
    // Always update timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    
    // Add WHERE clause parameters
    values.push(req.params.id)
    values.push(req.user.userId)
    
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`
    
    console.log('📤 SQL:', sql)
    console.log('📦 Values:', values)
    
    const result = await query(sql, values)
    
    console.log('✅ Update result:', result.rows)

    if (result.rows.length === 0) {
      console.log('❌ No task found with id:', req.params.id, 'and user_id:', req.user.userId)
      return res.status(404).json({ error: 'Task not found' })
    }
    
    console.log('✅ Returning updated task:', result.rows[0])
    res.json({ task: result.rows[0] })
  } catch (error) {
    console.error('❌ Update task error:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error message:', error.message)
    res.status(500).json({ 
      error: 'Failed to update task',
      details: error.message,
      code: error.code
    })
  }
})

// Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const result = await query(
      'UPDATE tasks SET completed = NOT completed WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.json({ task: result.rows[0] })
  } catch (error) {
    console.error('Toggle task error:', error)
    res.status(500).json({ error: 'Failed to toggle task' })
  }
})

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

export default router

