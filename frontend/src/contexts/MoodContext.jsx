import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const MoodContext = createContext()

export const useMood = () => {
  const context = useContext(MoodContext)
  if (!context) {
    throw new Error('useMood must be used within MoodProvider')
  }
  return context
}

export const MoodProvider = ({ children }) => {
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchMoods = async (startDate, endDate) => {
    try {
      setLoading(true)
      const response = await axios.get('/api/moods', {
        params: { startDate, endDate },
      })
      setMoods(response.data.moods)
    } catch (error) {
      console.error('Failed to fetch moods:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoodStats = () => {
    if (!moods.length) return null

    const moodCounts = moods.reduce((acc, entry) => {
      const mood = entry.emotion
      acc[mood] = (acc[mood] || 0) + 1
      return acc
    }, {})

    const totalMoods = moods.length
    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: ((count / totalMoods) * 100).toFixed(1),
    }))

    const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]

    return {
      moodDistribution,
      mostCommonMood,
      totalEntries: totalMoods,
    }
  }

  const getMoodEmoji = (emotion) => {
    const emojiMap = {
      joy: '😊',
      happy: '😃',
      neutral: '😐',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      excited: '🤩',
      calm: '😌',
      love: '🥰',
      fear: '😨',
    }
    return emojiMap[emotion?.toLowerCase()] || '😐'
  }

  const getMoodColor = (emotion) => {
    const colorMap = {
      joy: 'text-mood-joy',
      happy: 'text-mood-happy',
      neutral: 'text-mood-neutral',
      sad: 'text-mood-sad',
      angry: 'text-mood-angry',
      anxious: 'text-mood-anxious',
      excited: 'text-mood-excited',
      calm: 'text-mood-calm',
    }
    return colorMap[emotion?.toLowerCase()] || 'text-mood-neutral'
  }

  const value = {
    moods,
    loading,
    fetchMoods,
    getMoodStats,
    getMoodEmoji,
    getMoodColor,
  }

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>
}

