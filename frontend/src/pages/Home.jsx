import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMood } from '../contexts/MoodContext'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Heart,
  Calendar,
  CheckSquare,
  TrendingUp,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Star,
} from 'lucide-react'
import MoodIcon from '../components/MoodIcon'
import MoodSelector from '../components/MoodSelector'
import ShellBadge from '../components/ShellBadge'
import { formatRelativeTime } from '../utils/helpers'
import axios from 'axios'

const Home = () => {
  const { user } = useAuth()
  const { getMoodEmoji } = useMood()
  const [stats, setStats] = useState(null)
  const [recentJournals, setRecentJournals] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [todayHabits, setTodayHabits] = useState([])
  const [todayMood, setTodayMood] = useState(null)
  const [dailyInsights, setDailyInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [clickedDecor, setClickedDecor] = useState(null)

  // Daily quotes and tips
  const dailyQuotes = [
    "The ocean stirs the heart, inspires the imagination, and brings eternal joy to the soul. 🌊",
    "Every wave brings new possibilities. Every tide teaches us to flow. 🌊",
    "Like the ocean, your emotions are deep, powerful, and ever-changing. 🌊",
    "Find your rhythm in the gentle ebb and flow of life. 🌊",
    "Your inner calm is like the ocean's depths—vast, peaceful, and full of life. 🌊"
  ]

  const dailyTips = [
    "Start your day with a moment of gratitude by the window. ☀️",
    "Take three deep breaths before checking your phone. 🧘‍♀️",
    "Write down one thing you're looking forward to today. ✨",
    "Notice the small moments of joy throughout your day. 🌸",
    "End your day by reflecting on one thing you learned. 🌙"
  ]

  const [currentQuote] = useState(dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)])
  const [currentTip] = useState(dailyTips[Math.floor(Math.random() * dailyTips.length)])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Debug: Log when dailyInsights changes
  useEffect(() => {
    console.log('🔍 dailyInsights state updated:', dailyInsights)
  }, [dailyInsights])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch critical data first (what user sees immediately)
      const [tasksRes, habitsRes, moodRes] = await Promise.all([
        axios.get('/api/tasks?date=today'),
        axios.get('/api/habits'),
        axios.get('/api/moods/today'),
      ])
      
      // Process and set critical data immediately
      const today = new Date().toISOString().split('T')[0]
      
      setTodayTasks(tasksRes.data.tasks)
      
      const uniqueHabits = habitsRes.data.habits.reduce((acc, habit) => {
        if (!acc.find(h => h.id === habit.id)) {
          acc.push(habit)
        }
        return acc
      }, [])
      
      const habitsWithStatus = uniqueHabits.map(habit => ({
        ...habit,
        completedToday: habit.marked_days?.includes(today) || false
      }))
      
      setTodayHabits(habitsWithStatus)
      setTodayMood(moodRes.data)
      setLoading(false)
      
      // Fetch non-critical data in background (stats, journals, insights)
      try {
        const [statsRes, journalsRes, insightsRes] = await Promise.all([
          axios.get('/api/user/stats'),
          axios.get('/api/journal?limit=3'),
          axios.get('/api/ai/daily-insights'),
        ])

        console.log('📊 Daily insights response:', insightsRes.data)
        setStats(statsRes.data)
        setRecentJournals(journalsRes.data.journals)
        
        // Ensure insights is an array
        const insights = Array.isArray(insightsRes.data?.insights) 
          ? insightsRes.data.insights 
          : insightsRes.data?.insights 
            ? [insightsRes.data.insights]
            : []
        
        setDailyInsights(insights)
        console.log('📊 Daily insights set:', insights.length, 'items')
      } catch (bgError) {
        console.error('❌ Failed to fetch background data:', bgError)
        console.error('Error details:', bgError.response?.data || bgError.message)
        // Set default insights on error
        setDailyInsights([
          { icon: '✨', text: 'Start your journey by writing your first journal entry!' },
          { icon: '🎯', text: 'Set up daily habits to build a consistent routine.' },
          { icon: '📝', text: 'Add tasks to stay organized throughout the day.' }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setLoading(false)
    }
  }

  const handleMoodSelected = async (emotion, note) => {
    try {
      // Get local date (YYYY-MM-DD format) to avoid timezone issues
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const localDate = `${year}-${month}-${day}`
      
      console.log('📅 Saving mood for local date:', localDate, 'emotion:', emotion)
      
      await axios.post('/api/moods', {
        emotion,
        note,
        date: localDate  // Send local date to backend
      })
      // Refresh mood data
      const moodRes = await axios.get('/api/moods/today')
      setTodayMood(moodRes.data)
    } catch (error) {
      console.error('Failed to save mood:', error)
      throw error
    }
  }

  const handleToggleTask = async (taskId) => {
    try {
      console.log('✅ Home: Toggling task', taskId)
      
      // Update in backend FIRST
      await axios.patch(`/api/tasks/${taskId}/toggle`)
      console.log('✅ Home: Task toggled in backend successfully')
      
      // Immediately refetch to ensure consistency
      const tasksRes = await axios.get('/api/tasks?date=today')
      setTodayTasks(tasksRes.data.tasks)
      console.log('✅ Home: Tasks refetched and state updated')
    } catch (error) {
      console.error('Failed to toggle task:', error)
      alert('Failed to update task. Please try again.')
      // Refetch on error
      const tasksRes = await axios.get('/api/tasks?date=today')
      setTodayTasks(tasksRes.data.tasks)
    }
  }

  const handleToggleHabit = async (habitId, currentStatus) => {
    const today = new Date().toISOString().split('T')[0]
    
    try {
      console.log('✅ Home: Toggling habit', habitId, currentStatus ? 'unmark' : 'mark')
      
      // Update in backend FIRST (no optimistic update to avoid race conditions)
      if (currentStatus) {
        // Unmark
        await axios.delete(`/api/habits/${habitId}/mark`, { data: { date: today } })
      } else {
        // Mark
        await axios.post(`/api/habits/${habitId}/mark`, { date: today })
      }
      console.log('✅ Home: Habit toggled in backend successfully')
      
      // Immediately refetch to ensure consistency
      const habitsRes = await axios.get('/api/habits')
      
      // Remove duplicates
      const uniqueHabits = habitsRes.data.habits.reduce((acc, habit) => {
        if (!acc.find(h => h.id === habit.id)) {
          acc.push(habit)
        }
        return acc
      }, [])
      
      const habitsWithStatus = uniqueHabits.map(habit => ({
        ...habit,
        completedToday: habit.marked_days?.includes(today) || false
      }))
      
      setTodayHabits(habitsWithStatus)
      console.log('✅ Home: Habits refetched and state updated')
    } catch (error) {
      console.error('Failed to toggle habit:', error)
      alert('Failed to update habit. Please try again.')
      // Refetch on error
      const habitsRes = await axios.get('/api/habits')
      
      // Remove duplicates based on habit ID
      const uniqueHabits = habitsRes.data.habits.reduce((acc, habit) => {
        if (!acc.find(h => h.id === habit.id)) {
          acc.push(habit)
        }
        return acc
      }, [])
      
      const habitsWithStatus = uniqueHabits.map(habit => ({
        ...habit,
        completedToday: habit.marked_days?.includes(today) || false
      }))
      setTodayHabits(habitsWithStatus)
    }
  }

  const quickActions = [
    { 
      name: 'Journal', 
      path: '/journal', 
      icon: BookOpen, 
      color: 'from-ocean-midnight to-ocean-deep',
      description: 'Write your thoughts'
    },
    { 
      name: 'Mood Tracker', 
      path: '/mood', 
      icon: Heart, 
      color: 'from-blush-coral/80 to-blush-coral',
      description: 'Track your emotions'
    },
    { 
      name: 'Planner', 
      path: '/planner', 
      icon: Calendar, 
      color: 'from-aqua-soft to-turquoise-tide',
      description: 'Plan your day'
    },
    { 
      name: 'Habits', 
      path: '/habits', 
      icon: CheckSquare, 
      color: 'from-lavender-shell/80 to-lavender-shell',
      description: 'Build good habits'
    },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getGreetingIcon = () => {
    const hour = new Date().getHours()
    if (hour < 12) return <Sun className="w-6 h-6 text-yellow-500" />
    if (hour < 17) return <Coffee className="w-6 h-6 text-amber-500" />
    return <Moon className="w-6 h-6 text-indigo-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean-200 border-t-ocean-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-500">Loading your cozy space...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Decorative elements */}
      <motion.img
        src="/design-elements/8.png"
        alt=""
        className="absolute top-10 right-10 w-80 h-80 opacity-80 z-20"
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 3, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        onClick={(e) => {
          setClickedDecor('whale')
          setTimeout(() => setClickedDecor(null), 1000)
        }}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          {getGreetingIcon()}
          <h1 className="text-3xl font-bold text-ocean-800 flex items-center gap-2">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
            <img src="/icons/22.png" alt="" className="w-8 h-8 scale-[10] inline-block" />
          </h1>
        </div>
        <p className="text-lg text-muted-500 max-w-2xl mx-auto">
          {currentQuote}
        </p>
      </motion.div>

      {/* Daily Tip - Sunset Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card backdrop-blur-sm border-2 border-peach-glow/40 text-center shadow-sunset"
        style={{
          background: 'linear-gradient(135deg, #FFE9D9 30%, #FFE0DE 60%, #EDE6F9 100%)'
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">🌅</span>
          <span className="font-handwriting text-lg text-ocean-deep font-bold">
            Today's Tip
          </span>
          <span className="text-2xl">✨</span>
        </div>
        <p className="text-ocean-800 font-medium">{currentTip}</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-ocean-800 mb-6 text-center">
          <span className="font-cursive text-3xl">Your </span>
          <span className="text-ocean-midnight font-bold">Workspace</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={action.path}
                className="card text-center group block h-full hover:shadow-sunset transition-all"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.color} backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                  <action.icon className="w-6 h-6 text-white drop-shadow-sm" />
                </div>
                <h3 className="font-bold text-ocean-800 mb-1">{action.name}</h3>
                <p className="text-sm text-muted-500">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Row: Today's Tasks and Today's Habits */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-bold text-ocean-800">Today's Tasks</h3>
            </div>
            <Link to="/planner" className="text-ocean-600 hover:text-ocean-800 text-sm font-medium">
              View All →
              </Link>
          </div>
          
          {todayTasks.length > 0 ? (
            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((task) => {
                // Determine task type icon
                const taskIcon = task.task_type === 'goal' ? '🎯' :
                                task.task_type === 'reminder' ? '🔔' :
                                '✓' // todo
                
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="task-checkbox cursor-pointer"
                    />
                    <span className="text-lg">{taskIcon}</span>
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-500' : 'text-ocean-800'}`}>
                      {task.title}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                )
              })}
              {todayTasks.length > 4 && (
                <p className="text-xs text-muted-500 text-center pt-2">
                  +{todayTasks.length - 4} more tasks
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm text-muted-500 mb-3">No tasks for today</p>
              <Link
                to="/planner"
                className="text-sm text-ocean-600 hover:text-ocean-800 font-medium"
              >
                Add Task →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Today's Habits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-ocean-800">Today's Habits</h3>
            </div>
            <Link to="/habits" className="text-ocean-600 hover:text-ocean-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {todayHabits.length > 0 ? (
            <div className="space-y-2">
              {todayHabits.slice(0, 4).map((habit) => (
                <div key={habit.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={habit.completedToday}
                    onChange={() => handleToggleHabit(habit.id, habit.completedToday)}
                    className="task-checkbox cursor-pointer"
                  />
                  <span className="text-2xl">{habit.icon}</span>
                  <span className={`flex-1 text-sm ${habit.completedToday ? 'line-through text-muted-500' : 'text-ocean-800'}`}>
                    {habit.name}
                  </span>
                  <span className="text-xs text-muted-500 capitalize">
                    {habit.frequency}
                  </span>
                </div>
              ))}
              {todayHabits.length > 4 && (
                <p className="text-xs text-muted-500 text-center pt-2">
                  +{todayHabits.length - 4} more habits
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-muted-500 mb-3">No habits set up yet</p>
              <Link
                to="/habits"
                className="text-sm text-ocean-600 hover:text-ocean-800 font-medium"
              >
                Create Habit →
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row: Today's Mood (small box) and Daily Insights (rectangle) */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Today's Mood - Compact Box */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-1 card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold text-ocean-800">Today's Mood</h3>
          </div>
          
          {todayMood && (todayMood.averageMood || todayMood.manualEntry || todayMood.journalMood) ? (
            <div className="space-y-2">
              {todayMood.averageMood && (
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-blush-50 border-2 border-pink-200">
                  <div className="text-6xl mb-3 breathing">{getMoodEmoji(todayMood.averageMood.emotion)}</div>
                  <p className="text-base font-bold text-ocean-800 capitalize mb-1">
                    {todayMood.averageMood.emotion}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-4 rounded-full ${
                            i < todayMood.averageMood.score 
                              ? 'bg-gradient-to-t from-pink-400 to-pink-600' 
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-pink-600">
                    {todayMood.averageMood.score}/10
                  </p>
                </div>
              )}
              
              {!todayMood.averageMood && todayMood.manualEntry && (
                <div className="text-center">
                  <div className="text-5xl mb-2">{getMoodEmoji(todayMood.manualEntry.emotion)}</div>
                  <p className="text-sm font-semibold text-ocean-800 capitalize">
                    {todayMood.manualEntry.emotion}
                  </p>
                </div>
              )}
              
              {!todayMood.averageMood && !todayMood.manualEntry && todayMood.journalMood && (
                <div className="text-center">
                  <div className="text-5xl mb-2">{getMoodEmoji(todayMood.journalMood.emotion)}</div>
                  <p className="text-sm font-semibold text-ocean-800 capitalize">
                    {todayMood.journalMood.emotion}
                  </p>
                </div>
              )}
              
              <div className="text-center pt-1">
                <button
                  onClick={() => setShowMoodSelector(true)}
                  className="text-xs text-ocean-600 hover:text-ocean-800 font-medium"
                >
                  Update →
                </button>
              </div>
          </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">😊</div>
              <button
                onClick={() => setShowMoodSelector(true)}
                className="text-xs text-ocean-600 hover:text-ocean-800 font-medium"
              >
                Add Mood →
              </button>
          </div>
          )}
        </motion.div>

        {/* Daily Insights - Wide Rectangle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-3 card bg-gradient-to-br from-ocean-50 to-sand-100 border-ocean-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-ocean-600" />
            <h3 className="text-lg font-bold text-ocean-800">Daily Insights</h3>
            <Sparkles className="w-4 h-4 text-ocean-500 ml-auto" title="Naia🐬 powered" />
          </div>
          
          {dailyInsights.length > 0 ? (
            <div className="space-y-2">
              {dailyInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                  <p className="text-sm text-ocean-800 leading-relaxed">{insight.text}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🤔</div>
              <p className="text-sm text-muted-500">
                Start adding data to get magical insights from Naia 🐬!
              </p>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-ocean-200 flex items-center justify-between">
            <p className="text-xs text-muted-500">
              Personalized insights from your journals, moods, tasks & habits
            </p>
            <button
              onClick={() => window.location.href = '/insights'}
              className="text-xs font-medium text-ocean-600 hover:text-ocean-800 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Meet Naia 🐬 →
            </button>
          </div>
        </motion.div>
      </div>


      {/* Mood Selector Modal */}
      <MoodSelector
        isOpen={showMoodSelector}
        onClose={() => setShowMoodSelector(false)}
        onMoodSelected={handleMoodSelected}
      />
    </div>
  )
}

export default Home
