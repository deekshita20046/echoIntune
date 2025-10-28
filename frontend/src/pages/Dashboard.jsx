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
} from 'lucide-react'
import MoodIcon from '../components/MoodIcon'
import { formatRelativeTime } from '../utils/helpers'
import axios from 'axios'

const Dashboard = () => {
  const { user } = useAuth()
  const { getMoodEmoji } = useMood()
  const [clickedDecor, setClickedDecor] = useState(null)
  const [stats, setStats] = useState(null)
  const [recentJournals, setRecentJournals] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, journalsRes, tasksRes] = await Promise.all([
        axios.get('/api/user/stats'),
        axios.get('/api/journal?limit=3'),
        axios.get('/api/tasks?date=today'),
      ])

      setStats(statsRes.data)
      setRecentJournals(journalsRes.data.journals)
      setTodayTasks(tasksRes.data.tasks)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { name: 'New Journal Entry', path: '/journal', icon: BookOpen, color: 'from-ocean-midnight to-ocean-deep' },
    { name: 'View Mood Trends', path: '/mood', icon: Heart, color: 'from-blush-coral/80 to-blush-coral' },
    { name: 'Manage Tasks', path: '/planner', icon: Calendar, color: 'from-aqua-soft to-turquoise-tide' },
    { name: 'Track Habits', path: '/habits', icon: CheckSquare, color: 'from-lavender-shell/80 to-lavender-shell' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Decorative corner elements */}
      <img src="/design-elements/12.png" alt="" className={`absolute top-0 right-0 w-56 h-56 md:w-64 md:h-64 opacity-100 z-20 cursor-pointer hover:scale-110 transition-transform ${clickedDecor === 'dash1' ? 'animate-spin-bounce' : 'animate-float'}`}
        onClick={() => {
          setClickedDecor('dash1')
          setTimeout(() => setClickedDecor(null), 1000)
        }}
      />
      <img src="/design-elements/15.png" alt="" className={`absolute top-1/4 left-0 w-48 h-48 md:w-56 md:h-56 opacity-100 z-20 cursor-pointer hover:scale-110 transition-transform ${clickedDecor === 'dash2' ? 'animate-spin-bounce' : 'animate-pulse-slow'}`}
        onClick={() => {
          setClickedDecor('dash2')
          setTimeout(() => setClickedDecor(null), 1000)
        }}
      />
      <img src="/design-elements/8.png" alt="" className={`absolute bottom-10 right-10 w-44 h-44 md:w-52 md:h-52 opacity-100 z-20 cursor-pointer hover:scale-110 transition-transform ${clickedDecor === 'dash3' ? 'animate-spin-bounce' : 'animate-float'}`}
        onClick={() => {
          setClickedDecor('dash3')
          setTimeout(() => setClickedDecor(null), 1000)
        }}
      />
      
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center py-4 relative z-10"
      >
        <img 
          src="/logos/2.png" 
          alt="echo: Intune" 
          className="h-32 w-auto object-contain scale-[2.5]"
        />
      </motion.div>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-gradient-to-br from-ocean-deep to-aqua-soft text-white relative z-10"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading mb-2 flex items-center gap-3">
              Welcome back, {user?.name}! 
              <img src="/icons/24.png" alt="" className="w-10 h-10 scale-[10] inline-block" />
            </h1>
            <p className="text-lg opacity-90 font-cursive">
              How are you feeling today? Let's make it productive!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/journal"
              className="inline-block px-6 py-3 bg-white text-ocean-600 rounded-xl font-semibold hover:shadow-2xl transition-all duration-200"
            >
              <BookOpen className="inline w-5 h-5 mr-2" />
              Write Journal
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={action.path}
              className="card hover:scale-105 transition-transform duration-200"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm md:text-base text-ocean-deep">{action.name}</h3>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 relative z-10">
        <div className="card relative overflow-hidden">
          <img src="/design-elements/18.png" alt="" className={`absolute bottom-0 right-0 w-56 h-56 opacity-100 z-20 cursor-pointer hover:scale-110 transition-transform ${clickedDecor === 'stat1' ? 'animate-spin-bounce' : ''}`}
            onClick={() => {
              setClickedDecor('stat1')
              setTimeout(() => setClickedDecor(null), 1000)
            }}
          />
          <div className="flex items-center justify-between relative z-30">
            <div>
              <p className="text-sea-pebble text-sm font-details">Journal Entries</p>
              <p className="text-3xl font-bold text-ocean-deep">{stats?.totalJournals || 0}</p>
            </div>
            <img src="/icons/20.png" alt="" className="w-10 h-10 scale-[10]" />
          </div>
        </div>

        <div className="card relative overflow-hidden">
          <img src="/design-elements/6.png" alt="" className={`absolute bottom-0 right-0 w-56 h-56 opacity-100 z-20 cursor-pointer hover:scale-110 transition-transform ${clickedDecor === 'stat2' ? 'animate-spin-bounce' : ''}`}
            onClick={() => {
              setClickedDecor('stat2')
              setTimeout(() => setClickedDecor(null), 1000)
            }}
          />
          <div className="flex items-center justify-between relative z-30">
            <div>
              <p className="text-sea-pebble text-sm font-details">Average Mood</p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-blush-coral">{stats?.averageMood || 'N/A'}</p>
                <span className="text-2xl">{getMoodEmoji(stats?.mostCommonMood)}</span>
              </div>
            </div>
            <img src="/icons/21.png" alt="" className="w-10 h-10 scale-[10]" />
          </div>
        </div>

        <div className="card relative overflow-hidden">
          <img src="/design-elements/5.png" alt="" className={`absolute bottom-0 right-0 w-56 h-56 opacity-100 z-20 cursor-pointer hover:scale-110 transition-transform ${clickedDecor === 'stat3' ? 'animate-spin-bounce' : ''}`}
            onClick={() => {
              setClickedDecor('stat3')
              setTimeout(() => setClickedDecor(null), 1000)
            }}
          />
          <div className="flex items-center justify-between relative z-30">
            <div>
              <p className="text-sea-pebble text-sm font-details">Active Tasks</p>
              <p className="text-3xl font-bold text-aqua-soft">{stats?.activeTasks || 0}</p>
            </div>
            <img src="/icons/23.png" alt="" className="w-10 h-10 scale-[10]" />
          </div>
        </div>

        <div className="card relative overflow-hidden">
          <img src="/design-elements/9.png" alt="" className={`absolute bottom-0 right-0 w-56 h-56 opacity-100 z-20 cursor-pointer hover:scale-110 transition-transform ${clickedDecor === 'stat4' ? 'animate-spin-bounce' : ''}`}
            onClick={() => {
              setClickedDecor('stat4')
              setTimeout(() => setClickedDecor(null), 1000)
            }}
          />
          <div className="flex items-center justify-between relative z-30">
            <div>
              <p className="text-sea-pebble text-sm font-details">Longest Streak</p>
              <p className="text-3xl font-bold text-lavender-shell">{stats?.longestStreak || 0} days</p>
            </div>
            <img src="/icons/25.png" alt="" className="w-10 h-10 scale-[10]" />
          </div>
        </div>
      </div>

      {/* Recent Journals & Tasks */}
      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        {/* Recent Journals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading text-ocean-deep">Recent Journals</h2>
            <Link to="/journal" className="text-ocean-600 hover:text-ocean-800 text-sm">
              View all →
            </Link>
          </div>

          {recentJournals.length > 0 ? (
            <div className="space-y-3">
              {recentJournals.map((journal) => (
                <div
                  key={journal.id}
                  className="p-3 bg-white/50 rounded-lg border border-white/20 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 line-clamp-2">{journal.content}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatRelativeTime(journal.created_at)}
                      </p>
                    </div>
                    <MoodIcon emotion={journal.emotion} size="small" animated={false} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No journal entries yet</p>
              <Link to="/journal" className="text-ocean-600 hover:text-ocean-800 text-sm mt-2 inline-block">
                Write your first entry
              </Link>
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading text-ocean-deep">Today's Tasks</h2>
            <Link to="/planner" className="text-ocean-600 hover:text-ocean-800 text-sm">
              View all →
            </Link>
          </div>

          {todayTasks.length > 0 ? (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="task-checkbox"
                    readOnly
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-slate-400' : ''}`}>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tasks for today</p>
              <Link to="/planner" className="text-ocean-600 hover:text-ocean-800 text-sm mt-2 inline-block">
                Add a task
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-shell-white to-driftwood-beige border-turquoise-tide/20"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-ocean-midnight to-ocean-deep rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg mb-2 text-ocean-deep">💡 Daily Insight</h3>
            <p className="text-ocean-deep/80">
              {stats?.dailyInsight || "You've been consistent with journaling this week! Keep up the great work. Your mood tends to improve on days when you complete tasks early."}
            </p>
            <Link
              to="/insights"
              className="inline-block mt-3 text-ocean-600 hover:text-ocean-800 font-medium text-sm"
            >
              View all insights →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard

