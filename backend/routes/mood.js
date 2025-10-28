/**
 * Mood Tracking Routes
 * 
 * Handles mood entries, statistics, and trends
 * Combines manual mood entries with AI-detected moods from journal entries
 * All routes require authentication
 */

import express from 'express'
import { query } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Require authentication for all mood routes
router.use(authenticate)

// Get today's mood (manual entry + journal analysis)
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get manual mood entry for today
    const manualMoodResult = await query(
      'SELECT * FROM mood_entries WHERE user_id = $1 AND date = $2',
      [req.user.userId, today]
    )
    
    // Get journal-based mood for today
    const journalMoodResult = await query(
      `SELECT emotion, probability, COUNT(*) as count 
       FROM journal_entries 
       WHERE user_id = $1 AND DATE(created_at) = $2 AND emotion IS NOT NULL
       GROUP BY emotion, probability
       ORDER BY count DESC`,
      [req.user.userId, today]
    )
    
    const moodScores = {
      joy: 10, happy: 9, excited: 8, calm: 7, neutral: 5,
      anxious: 4, sad: 3, angry: 2, fear: 1,
    }
    
    let response = {
      manualEntry: manualMoodResult.rows[0] || null,
      journalMood: null,
      averageMood: null,
      source: null
    }
    
    // Calculate journal-based mood if exists
    if (journalMoodResult.rows.length > 0) {
      const totalCount = journalMoodResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
      const avgScore = journalMoodResult.rows.reduce((sum, row) => {
        return sum + (moodScores[row.emotion] || 5) * parseInt(row.count)
      }, 0) / totalCount
      
      const mostCommonEmotion = journalMoodResult.rows[0].emotion
      const avgProbability = journalMoodResult.rows.reduce((sum, row) => 
        sum + (parseFloat(row.probability) || 0) * parseInt(row.count), 0
      ) / totalCount
      
      response.journalMood = {
        emotion: mostCommonEmotion,
        score: avgScore.toFixed(1),
        probability: avgProbability.toFixed(4),
        count: totalCount
      }
    }
    
    // Calculate average if both exist
    if (response.manualEntry && response.journalMood) {
      const manualScore = response.manualEntry.score || moodScores[response.manualEntry.emotion] || 5
      const journalScore = parseFloat(response.journalMood.score)
      const avgScore = (manualScore + journalScore) / 2
      
      // Find emotion closest to average score
      let closestEmotion = 'neutral'
      let minDiff = Infinity
      for (const [emotion, score] of Object.entries(moodScores)) {
        const diff = Math.abs(score - avgScore)
        if (diff < minDiff) {
          minDiff = diff
          closestEmotion = emotion
        }
      }
      
      response.averageMood = {
        emotion: closestEmotion,
        score: avgScore.toFixed(1),
        probability: ((parseFloat(response.manualEntry.probability || 1) + 
                      parseFloat(response.journalMood.probability)) / 2).toFixed(4)
      }
      response.source = 'combined'
    } else if (response.manualEntry) {
      response.source = 'manual'
    } else if (response.journalMood) {
      response.source = 'journal'
    }
    
    res.json(response)
  } catch (error) {
    console.error('Get today mood error:', error)
    res.status(500).json({ error: 'Failed to fetch today\'s mood' })
  }
})

// Save or update manual mood entry
router.post('/', async (req, res) => {
  try {
    const { emotion, note, score, date } = req.body
    
    // Use provided date or get local date (not UTC)
    let entryDate
    if (date) {
      entryDate = date
    } else {
      // Get local date (not UTC) to avoid timezone issues
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      entryDate = `${year}-${month}-${day}`
    }
    
    console.log('💾 Saving mood for date:', entryDate, 'emotion:', emotion)
    
    if (!emotion) {
      return res.status(400).json({ error: 'Emotion is required' })
    }
    
    // Calculate score from emotion if not provided
    const moodScores = {
      joy: 10, happy: 9, excited: 8, calm: 7, neutral: 5,
      anxious: 4, sad: 3, angry: 2, fear: 1,
    }
    const finalScore = score || moodScores[emotion] || 5
    
    // Upsert (insert or update if exists)
    const result = await query(
      `INSERT INTO mood_entries (user_id, emotion, score, note, date, probability)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date)
       DO UPDATE SET emotion = $2, score = $3, note = $4, probability = $6, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, emotion, finalScore, note || null, entryDate, 1.0]
    )
    
    console.log('✅ Mood saved successfully:', result.rows[0])
    
    res.status(201).json({ 
      success: true,
      mood: result.rows[0],
      message: 'Mood saved successfully'
    })
  } catch (error) {
    console.error('Save mood error:', error)
    res.status(500).json({ error: 'Failed to save mood' })
  }
})

// Delete mood entry
router.delete('/:date', async (req, res) => {
  try {
    const { date } = req.params
    
    await query(
      'DELETE FROM mood_entries WHERE user_id = $1 AND date = $2',
      [req.user.userId, date]
    )
    
    res.json({ 
      success: true,
      message: 'Mood deleted successfully'
    })
  } catch (error) {
    console.error('Delete mood error:', error)
    res.status(500).json({ error: 'Failed to delete mood' })
  }
})

// Get mood statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    let sql = 'SELECT emotion, COUNT(*) as count FROM journal_entries WHERE user_id = $1'
    const params = [req.user.userId]

    if (startDate && endDate) {
      sql += ' AND created_at BETWEEN $2 AND $3'
      params.push(startDate, endDate)
    }

    sql += ' GROUP BY emotion'

    const result = await query(sql, params)

    // Calculate stats
    const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
    const moodDistribution = result.rows.map(row => ({
      mood: row.emotion,
      count: parseInt(row.count),
      percentage: ((parseInt(row.count) / total) * 100).toFixed(1),
    }))

    const mostCommon = result.rows.sort((a, b) => b.count - a.count)[0]

    // Calculate average mood score (simplified)
    const moodScores = {
      joy: 10,
      happy: 9,
      excited: 8,
      calm: 7,
      neutral: 5,
      anxious: 4,
      sad: 3,
      angry: 2,
      fear: 1,
    }

    const avgMood = result.rows.reduce((sum, row) => {
      return sum + (moodScores[row.emotion] || 5) * parseInt(row.count)
    }, 0) / total

    res.json({
      totalEntries: total,
      averageMood: total > 0 ? parseFloat(avgMood.toFixed(1)) : 0,
      mostCommonMood: mostCommon?.emotion || 'neutral',
      moodDistribution,
      currentPeriodCount: total,
    })
  } catch (error) {
    console.error('Get mood stats error:', error)
    res.status(500).json({ error: 'Failed to fetch mood statistics' })
  }
})

// Get mood trends
router.get('/trends', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    // Get journal entries (cast date to text to ensure string format)
    let journalSql = `
      SELECT 
        DATE(created_at)::text as date,
        emotion,
        COUNT(*) as count
      FROM journal_entries 
      WHERE user_id = $1
    `
    const journalParams = [req.user.userId]

    if (startDate && endDate) {
      journalSql += ' AND created_at BETWEEN $2 AND $3'
      journalParams.push(startDate, endDate)
    }

    journalSql += ' GROUP BY DATE(created_at), emotion ORDER BY date'

    // Get manual mood entries (ensure date is YYYY-MM-DD format)
    let moodSql = `
      SELECT 
        to_char(date, 'YYYY-MM-DD') as date,
        emotion,
        1 as count
      FROM mood_entries 
      WHERE user_id = $1
    `
    const moodParams = [req.user.userId]

    if (startDate && endDate) {
      moodSql += ' AND date BETWEEN $2 AND $3'
      moodParams.push(startDate?.split('T')[0], endDate?.split('T')[0])
    }

    moodSql += ' ORDER BY date'

    const [journalResult, moodResult] = await Promise.all([
      query(journalSql, journalParams),
      query(moodSql, moodParams)
    ])

    console.log('📊 Journal entries found:', journalResult.rows.length)
    console.log('💭 Manual mood entries found:', moodResult.rows.length)
    console.log('💭 Manual moods:', moodResult.rows)

    // Transform data for charts
    const moodScores = {
      joy: 10, happy: 9, excited: 8, calm: 7, neutral: 5,
      anxious: 4, sad: 3, angry: 2, fear: 1,
    }

    const trendsByDate = {}
    
    // Add journal entries (date is now always a string from SQL)
    journalResult.rows.forEach(row => {
      const dateStr = row.date // Already a string from ::text cast
      console.log('📝 Journal entry date:', dateStr, 'emotion:', row.emotion)
      
      if (!trendsByDate[dateStr]) {
        trendsByDate[dateStr] = []
      }
      trendsByDate[dateStr].push({
        emotion: row.emotion,
        count: parseInt(row.count),
        score: moodScores[row.emotion] || 5,
      })
    })
    
    // Add manual mood entries (date is now always a string from SQL)
    moodResult.rows.forEach(row => {
      const dateStr = row.date // Already a string from ::text cast
      console.log('💭 Manual mood date:', dateStr, 'emotion:', row.emotion)
      
      if (!trendsByDate[dateStr]) {
        trendsByDate[dateStr] = []
      }
      trendsByDate[dateStr].push({
        emotion: row.emotion,
        count: parseInt(row.count),
        score: moodScores[row.emotion] || 5,
      })
    })

    const dates = Object.keys(trendsByDate).sort()
    const scores = dates.map(date => {
      const dayMoods = trendsByDate[date]
      const avgScore = dayMoods.reduce((sum, m) => sum + m.score * m.count, 0) / 
                      dayMoods.reduce((sum, m) => sum + m.count, 0)
      return avgScore.toFixed(1)
    })

    // Generate calendar data for the past 35 days (5 weeks) INCLUDING TODAY
    const calendar = []
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    console.log('📅 Generating calendar for today:', todayStr)
    console.log('📊 Available mood dates:', Object.keys(trendsByDate))
    console.log('📊 Full trendsByDate object:', JSON.stringify(trendsByDate, null, 2))
    
    for (let i = 34; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Find mood for this date
      const dayMoods = trendsByDate[dateStr]
      let mood = null
      
      if (dayMoods && dayMoods.length > 0) {
        // Get most common mood for the day
        const mostCommon = dayMoods.reduce((prev, current) => 
          (prev.count > current.count) ? prev : current
        )
        mood = mostCommon.emotion
        
        // Log today's mood specifically
        if (dateStr === todayStr) {
          console.log('✅ Today mood found:', mood)
        }
      } else if (dateStr === todayStr) {
        console.log('❌ No mood data for today')
      }
      
      calendar.push({
        date: dateStr,
        mood: mood,
        day: date.getDate()
      })
    }
    
    console.log('📅 Total calendar days:', calendar.length)
    console.log('📊 Days with mood:', calendar.filter(d => d.mood).length)

    res.json({
      dates,
      scores,
      calendar,
    })
  } catch (error) {
    console.error('Get mood trends error:', error)
    res.status(500).json({ error: 'Failed to fetch mood trends' })
  }
})

// Get AI-powered mood insights
router.get('/insights', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    // Fetch comprehensive user data
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    
    const [moodsResult, journalsResult, tasksResult, habitsResult] = await Promise.all([
      query(
        `SELECT emotion, score, note, date FROM mood_entries 
         WHERE user_id = $1 AND date >= $2 ORDER BY date DESC`,
        [req.user.userId, twoWeeksAgo.toISOString().split('T')[0]]
      ),
      query(
        `SELECT emotion, probability, created_at FROM journal_entries 
         WHERE user_id = $1 AND created_at >= $2 AND emotion IS NOT NULL 
         ORDER BY created_at DESC`,
        [req.user.userId, twoWeeksAgo]
      ),
      query(
        `SELECT COUNT(*) as total, COUNT(CASE WHEN completed THEN 1 END) as completed 
         FROM tasks WHERE user_id = $1 AND created_at >= $2`,
        [req.user.userId, twoWeeksAgo]
      ),
      query(
        `SELECT COUNT(DISTINCT habit_id) as active_habits, 
         COUNT(*) as total_completions 
         FROM habit_tracking ht 
         JOIN habits h ON ht.habit_id = h.id 
         WHERE h.user_id = $1 AND ht.date >= $2`,
        [req.user.userId, twoWeeksAgo.toISOString().split('T')[0]]
      )
    ])
    
    // Check if user has sufficient data
    const hasData = moodsResult.rows.length > 0 || journalsResult.rows.length > 0
    
    if (!hasData) {
      return res.json({
        insights: [
          {
            icon: '✨',
            title: 'Start Your Journey',
            text: 'Begin by tracking your mood daily. Regular check-ins help you understand emotional patterns and trends over time.'
          },
          {
            icon: '📝',
            title: 'Journal Your Feelings',
            text: 'Writing about your emotions provides deeper insights. Our AI will analyze your entries and help you understand what affects your mood.'
          },
          {
            icon: '🎯',
            title: 'Build Healthy Habits',
            text: 'Track habits and tasks to see how your daily actions influence your emotional well-being.'
          }
        ],
        source: 'default'
      })
    }
    
    // Prepare data summary for AI
    const moodCounts = {}
    journalsResult.rows.forEach(row => {
      moodCounts[row.emotion] = (moodCounts[row.emotion] || 0) + 1
    })
    
    const moodSummary = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, count]) => `${emotion}: ${count}`)
      .join(', ')
    
    const taskStats = tasksResult.rows[0]
    const habitStats = habitsResult.rows[0]
    
    const dataContext = `
User Mood Data (Last 14 days):
- Manual mood entries: ${moodsResult.rows.length}
- Journal-detected emotions: ${moodSummary}
- Most common emotion: ${Object.keys(moodCounts)[0] || 'neutral'}
- Task completion: ${taskStats.completed}/${taskStats.total} tasks
- Habit tracking: ${habitStats.active_habits} habits, ${habitStats.total_completions} completions

Recent mood trend: ${moodsResult.rows.slice(0, 7).map(m => m.emotion).join(' → ')}
`.trim()
    
    // Try Gemini first
    const geminiApiKey = process.env.GEMINI_API_KEY
    
    if (geminiApiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(geminiApiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        
        const prompt = `You are a compassionate wellness AI analyzing mood patterns. Based on this user's data, provide 3 specific, actionable, personalized insights.

${dataContext}

Generate exactly 3 insights in this JSON format:
[
  {"icon": "emoji", "title": "Short Title", "text": "2-3 sentences of specific, personalized insight with actionable advice"},
  {"icon": "emoji", "title": "Short Title", "text": "2-3 sentences of specific, personalized insight with actionable advice"},
  {"icon": "emoji", "title": "Short Title", "text": "2-3 sentences of specific, personalized insight with actionable advice"}
]

Guidelines:
- Reference their actual emotions (${Object.keys(moodCounts)[0]}, etc.)
- Be specific about patterns you see
- Provide actionable suggestions
- Use warm, supportive tone
- Focus on recent trends (last 2 weeks)
- Don't be generic - use their actual data`
        
        const result = await model.generateContent(prompt)
        const response = await result.response
        const aiText = response.text()
        
        // Parse JSON from response
        const jsonMatch = aiText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const insights = JSON.parse(jsonMatch[0])
          return res.json({
            insights,
            source: 'gemini'
          })
        }
      } catch (geminiError) {
        console.error('Gemini insights error:', geminiError)
      }
    }
    
    // Fallback: Generate rule-based personalized insights
    const insights = generatePersonalizedInsights(
      moodCounts,
      moodsResult.rows,
      taskStats,
      habitStats
    )
    
    res.json({
      insights,
      source: 'rules'
    })
    
  } catch (error) {
    console.error('Get mood insights error:', error)
    res.status(500).json({ error: 'Failed to generate insights' })
  }
})

// Helper function for rule-based insights
function generatePersonalizedInsights(moodCounts, recentMoods, taskStats, habitStats) {
  const insights = []
  
  // Analyze most common mood
  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])
  const mostCommon = sortedMoods[0]
  
  if (mostCommon) {
    const [emotion, count] = mostCommon
    const percentage = ((count / Object.values(moodCounts).reduce((a,b) => a+b, 0)) * 100).toFixed(0)
    
    if (['happy', 'joy', 'excited', 'calm'].includes(emotion)) {
      insights.push({
        icon: '✨',
        title: 'Positive Energy',
        text: `You've been feeling ${emotion} ${percentage}% of the time recently. This positive trend shows you're engaging in activities that bring you joy. Keep identifying and doing more of what makes you feel this way!`
      })
    } else if (['sad', 'anxious', 'angry'].includes(emotion)) {
      insights.push({
        icon: '💙',
        title: 'Emotional Support',
        text: `Your mood has been ${emotion} ${percentage}% of the time. Remember, it's okay to feel this way. Consider reaching out to supportive friends, practicing self-care activities, or talking to a professional if these feelings persist.`
      })
    }
  }
  
  // Task completion insight
  if (taskStats.total > 0) {
    const completionRate = ((taskStats.completed / taskStats.total) * 100).toFixed(0)
    
    if (completionRate >= 70) {
      insights.push({
        icon: '🎯',
        title: 'Productivity Win',
        text: `You've completed ${completionRate}% of your tasks! This sense of accomplishment likely contributes to your overall wellbeing. Breaking tasks into smaller steps is working well for you.`
      })
    } else {
      insights.push({
        icon: '📝',
        title: 'Task Management',
        text: `You've completed ${taskStats.completed} of ${taskStats.total} tasks (${completionRate}%). Try breaking larger tasks into smaller, manageable steps. Small wins can boost your mood and motivation.`
      })
    }
  }
  
  // Habit consistency insight
  if (habitStats.active_habits > 0) {
    const avgCompletions = (habitStats.total_completions / habitStats.active_habits / 14 * 100).toFixed(0)
    
    insights.push({
      icon: '🌟',
      title: 'Habit Consistency',
      text: `You're tracking ${habitStats.active_habits} habits with ${avgCompletions}% consistency. ${avgCompletions >= 60 ? 'Great work! ' : ''}Regular habits create stability and can positively impact your emotional wellbeing.`
    })
  }
  
  // Add mood variability insight if we have enough data
  if (recentMoods.length >= 5) {
    const recentEmotions = recentMoods.slice(0, 7).map(m => m.emotion)
    const uniqueEmotions = [...new Set(recentEmotions)].length
    
    if (uniqueEmotions <= 2) {
      insights.push({
        icon: '🌊',
        title: 'Mood Stability',
        text: `Your mood has been relatively consistent recently, fluctuating between just a few emotions. This stability can be comforting and indicates emotional balance in your daily life.`
      })
    } else if (uniqueEmotions >= 5) {
      insights.push({
        icon: '🎭',
        title: 'Emotional Range',
        text: `You've experienced ${uniqueEmotions} different emotions this week. This variety is natural. Identifying triggers for different moods can help you cultivate more positive experiences.`
      })
    }
  }
  
  // Ensure we return at least 3 insights
  while (insights.length < 3) {
    insights.push({
      icon: '💫',
      title: 'Keep Going',
      text: 'Continue tracking your moods and journaling. The more data you provide, the better insights we can offer about your emotional patterns and wellbeing.'
    })
  }
  
  return insights.slice(0, 3)
}

export default router

