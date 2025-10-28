import { format, formatDistanceToNow, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// Date formatting
export const formatDate = (date, formatString = 'PPP') => {
  if (!date) return 'N/A'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'N/A'
    return format(dateObj, formatString)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'N/A'
  }
}

export const formatRelativeTime = date => {
  const dateObj = new Date(date)
  if (isToday(dateObj)) return 'Today'
  if (isYesterday(dateObj)) return 'Yesterday'
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

// Date ranges
export const getWeekRange = (date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  }
}

export const getMonthRange = (date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

// Mood helpers
export const getMoodScore = emotion => {
  const scoreMap = {
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
  return scoreMap[emotion?.toLowerCase()] || 5
}

export const calculateAverageMood = moods => {
  if (!moods.length) return 0
  const total = moods.reduce((sum, mood) => sum + getMoodScore(mood.emotion), 0)
  return (total / moods.length).toFixed(1)
}

// Task helpers
export const getPriorityColor = priority => {
  const colors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300',
  }
  return colors[priority?.toLowerCase()] || colors.low
}

export const sortTasksByPriority = tasks => {
  const priorityOrder = { high: 1, medium: 2, low: 3 }
  return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

// Habit helpers
export const calculateStreak = (markedDays) => {
  if (!markedDays || markedDays.length === 0) return 0
  
  const sortedDays = [...markedDays].sort((a, b) => new Date(b) - new Date(a))
  let streak = 0
  let currentDate = new Date()
  
  for (let day of sortedDays) {
    const dayDate = new Date(day)
    const diffDays = Math.floor((currentDate - dayDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

export const getMonthProgress = (markedDays, totalDaysInMonth) => {
  const completed = markedDays?.length || 0
  return Math.round((completed / totalDaysInMonth) * 100)
}

// AI helpers
export const generateAffirmation = mood => {
  const affirmations = {
    joy: "Your happiness is contagious! Keep spreading those positive vibes! ✨",
    happy: "You're doing amazing! Keep up the great energy! 🌟",
    excited: "Your enthusiasm is inspiring! Channel that energy into something creative! 🎨",
    calm: "Your peaceful energy is beautiful. Stay centered and mindful. 🧘‍♀️",
    neutral: "Every day is a new opportunity. What will you make of today? 🌅",
    anxious: "Take a deep breath. You've overcome challenges before, and you will again. 💪",
    sad: "It's okay to feel sad. Be gentle with yourself. Tomorrow is a new day. 🌈",
    angry: "Your feelings are valid. Channel this energy into positive action. 🔥",
    fear: "You are braver than you think. Take one small step forward. 🦋",
  }
  return affirmations[mood?.toLowerCase()] || affirmations.neutral
}

export const suggestTask = (mood, tasks) => {
  const moodScore = getMoodScore(mood)
  
  if (moodScore >= 7) {
    // Feeling good - suggest challenging tasks
    return tasks.filter(t => t.priority === 'high' && !t.completed)[0]
  } else if (moodScore >= 4) {
    // Neutral - suggest medium priority
    return tasks.filter(t => t.priority === 'medium' && !t.completed)[0]
  } else {
    // Low mood - suggest easy tasks
    return tasks.filter(t => t.priority === 'low' && !t.completed)[0]
  }
}

// Validation
export const validateEmail = email => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = password => {
  return password.length >= 6
}

// Local storage helpers
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Failed to get from localStorage:', error)
    return defaultValue
  }
}

