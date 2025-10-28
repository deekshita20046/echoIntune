/**
 * User Profile Routes
 * 
 * Handles user profile management and statistics
 * Includes profile updates, user stats, and AI personalization data
 * All routes require authentication
 */

import express from 'express'
import { query } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Require authentication for all user routes
router.use(authenticate)

/**
 * Helper function to get user profile for AI personalization
 * Fetches user demographics and interests for personalized AI responses
 * @param {number} userId - User's database ID
 * @returns {Object|null} User profile object or null if no data
 */
export const getUserProfileForAI = async (userId) => {
  try {
    const result = await query(
      'SELECT name, gender, birthday, bio, pronouns, occupation, location, interests FROM users WHERE id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    const user = result.rows[0]
    
    // Calculate age if birthday is provided
    let age = null
    if (user.birthday) {
      const today = new Date()
      const birthDate = new Date(user.birthday)
      age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
    }
    
    // Filter out empty/null values to avoid cluttering AI prompt
    const profile = {
      name: user.name || null,
      gender: user.gender || null,
      age: age,
      bio: user.bio || null,
      pronouns: user.pronouns || null,
      occupation: user.occupation || null,
      location: user.location || null,
      interests: user.interests ? user.interests.split(',').map(i => i.trim()).filter(i => i) : []
    }
    
    // Check if user has any profile data filled in
    const hasProfileData = profile.name || profile.gender || profile.age || profile.bio || 
                          profile.pronouns || profile.occupation || profile.location || 
                          profile.interests.length > 0
    
    return hasProfileData ? profile : null
  } catch (error) {
    console.error('Error fetching user profile for AI:', error)
    return null
  }
}

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, avatar, gender, birthday, bio, pronouns, timezone, occupation, location, interests, created_at FROM users WHERE id = $1',
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, avatar, gender, birthday, bio, pronouns, timezone, occupation, location, interests } = req.body

    console.log('Updating profile for user:', req.user.userId)
    console.log('Profile data:', { name, email, avatar, gender, birthday, bio, pronouns, timezone, occupation, location, interests })

    // Convert empty strings to null for proper database handling
    const cleanBirthday = birthday && birthday.trim() !== '' ? birthday : null
    const cleanGender = gender && gender.trim() !== '' ? gender : null
    const cleanBio = bio && bio.trim() !== '' ? bio : null
    const cleanPronouns = pronouns && pronouns.trim() !== '' ? pronouns : null
    const cleanOccupation = occupation && occupation.trim() !== '' ? occupation : null
    const cleanLocation = location && location.trim() !== '' ? location : null
    const cleanInterests = interests && interests.trim() !== '' ? interests : null

    console.log('Cleaned data:', { cleanBirthday, cleanGender, cleanBio, cleanPronouns, cleanOccupation, cleanLocation, cleanInterests })

    // Allow updating to null/empty - user can clear fields
    // Only skip update if value is undefined (not provided in request)
    const result = await query(
      `UPDATE users SET 
        name = CASE WHEN $1::text IS NOT NULL THEN $1 ELSE name END, 
        email = CASE WHEN $2::text IS NOT NULL THEN $2 ELSE email END,
        avatar = CASE WHEN $3::text IS NOT NULL THEN $3 ELSE avatar END,
        gender = $4,
        birthday = $5,
        bio = $6,
        pronouns = $7,
        timezone = CASE WHEN $8::text IS NOT NULL THEN $8 ELSE timezone END,
        occupation = $9,
        location = $10,
        interests = $11
      WHERE id = $12 
      RETURNING id, name, email, avatar, gender, birthday, bio, pronouns, timezone, occupation, location, interests, created_at`,
      [
        name || null, 
        email || null, 
        avatar || null, 
        cleanGender, 
        cleanBirthday, 
        cleanBio, 
        cleanPronouns, 
        timezone || 'UTC', 
        cleanOccupation, 
        cleanLocation, 
        cleanInterests, 
        req.user.userId
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    console.log('Profile updated successfully:', result.rows[0])
    res.json({ user: result.rows[0], message: 'Profile updated successfully!' })
  } catch (error) {
    console.error('Update profile error:', error)
    console.error('Error details:', error.message)
    res.status(500).json({ error: 'Failed to update profile', details: error.message })
  }
})

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    // Get journal count
    const journalResult = await query(
      'SELECT COUNT(*) as count FROM journal_entries WHERE user_id = $1',
      [req.user.userId]
    )

    // Get task counts
    const taskResult = await query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed FROM tasks WHERE user_id = $1',
      [req.user.userId]
    )

    // Get habit count
    const habitResult = await query(
      'SELECT COUNT(*) as count FROM habits WHERE user_id = $1',
      [req.user.userId]
    )

    // Calculate longest streak (simplified)
    const streakResult = await query(
      'SELECT DATE(created_at) as date FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    )

    let longestStreak = 0
    let currentStreak = 0
    const dates = streakResult.rows.map(r => r.date)
    
    for (let i = 0; i < dates.length; i++) {
      if (i === 0 || new Date(dates[i-1]) - new Date(dates[i]) === 86400000) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    // Get average mood
    const moodResult = await query(
      'SELECT emotion, COUNT(*) as count FROM journal_entries WHERE user_id = $1 GROUP BY emotion',
      [req.user.userId]
    )

    const moodScores = {
      joy: 10, happy: 9, excited: 8, calm: 7, neutral: 5,
      anxious: 4, sad: 3, angry: 2, fear: 1,
    }

    let totalMoodScore = 0
    let totalEntries = 0
    let mostCommonMood = 'neutral'
    let maxCount = 0

    moodResult.rows.forEach(row => {
      const count = parseInt(row.count)
      totalMoodScore += (moodScores[row.emotion] || 5) * count
      totalEntries += count
      if (count > maxCount) {
        maxCount = count
        mostCommonMood = row.emotion
      }
    })

    const averageMood = totalEntries > 0 ? totalMoodScore / totalEntries : 0

    res.json({
      totalJournals: parseInt(journalResult.rows[0].count),
      totalTasks: parseInt(taskResult.rows[0].total) || 0,
      completedTasks: parseInt(taskResult.rows[0].completed) || 0,
      activeTasks: (parseInt(taskResult.rows[0].total) || 0) - (parseInt(taskResult.rows[0].completed) || 0),
      totalHabits: parseInt(habitResult.rows[0].count),
      longestStreak,
      averageMood: averageMood.toFixed(1),
      mostCommonMood,
      dailyInsight: 'You\'ve been consistent with journaling this week! Keep up the great work.',
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

export default router

