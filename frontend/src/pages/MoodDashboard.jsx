import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line, Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Calendar as CalendarIcon, TrendingUp, Heart, Award, BarChart3, PieChart, ChevronLeft, ChevronRight } from 'lucide-react'
import { moodAPI } from '../utils/api'
import { useMood } from '../contexts/MoodContext'
import { getMoodScore, formatDate, getWeekRange, getMonthRange } from '../utils/helpers'
import LoadingSpinner from '../components/LoadingSpinner'
import MoodIcon from '../components/MoodIcon'
import ShellBadge from '../components/ShellBadge'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const MoodDashboard = () => {
  const { getMoodEmoji, getMoodColor } = useMood()
  const [timeRange, setTimeRange] = useState('month') // week, month, all
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Fetch calendar and insights once (not affected by time range)
  useEffect(() => {
    fetchStaticData()
  }, [])

  // Fetch stats and trends when time range changes
  useEffect(() => {
    fetchFilteredData()
  }, [timeRange])

  const fetchStaticData = async () => {
    try {
      const [calendarRes, insightsRes] = await Promise.all([
        moodAPI.getTrends(null), // Get all data for calendar
        moodAPI.getInsights(null), // Get all data for insights
      ])

      // Process calendar data into monthly format
      const calendarData = calendarRes.data.calendar || []
      setCalendar(calendarData)
      setInsights(insightsRes.data.insights || [])
      
      const today = new Date().toISOString().split('T')[0]
      const todayData = calendarData.find(d => d.date === today)
      
      console.log('📊 Mood insights source:', insightsRes.data.source)
      console.log('📅 Calendar loaded:', calendarData.length, 'days')
      console.log('📅 Days with mood:', calendarData.filter(d => d.mood).length)
      console.log('🗓️ Today is:', today)
      console.log('🎯 Today in calendar data:', todayData)
      console.log('😊 Today mood value:', todayData?.mood)
      console.log('📊 All calendar data:', calendarData)
    } catch (error) {
      console.error('Failed to fetch static data:', error)
    }
  }

  const fetchFilteredData = async () => {
    try {
      setLoading(true)
      const range =
        timeRange === 'week'
          ? getWeekRange()
          : timeRange === 'month'
          ? getMonthRange()
          : null

      const [statsRes, trendsRes] = await Promise.all([
        moodAPI.getStats(range),
        moodAPI.getTrends(range),
      ])

      setStats(statsRes.data)
      setTrends(trendsRes.data)
    } catch (error) {
      console.error('Failed to fetch filtered data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate calendar for selected month
  const generateMonthCalendar = () => {
    if (!calendar || calendar.length === 0) return []
    
    const today = new Date()
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const todayDate = today.getDate()
    const todayMonth = today.getMonth()
    const todayYear = today.getFullYear()
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    // Create calendar array
    const monthCalendar = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      monthCalendar.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = calendar.find(d => d.date === dateStr)
      
      const isToday = day === todayDate && month === todayMonth && year === todayYear
      
      monthCalendar.push({
        date: dateStr,
        day: day,
        mood: dayData?.mood || null,
        isToday: isToday
      })
    }
    
    return monthCalendar
  }
  
  // Month navigation handlers
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  // Generate personalized mood booster based on stats
  const generateMoodBooster = () => {
    if (!stats || !stats.mostCommonMood) {
      return getDefaultMoodBooster()
    }
    
    const mood = stats.mostCommonMood
    const avgMood = stats.averageMood || 5
    
    // Determine mood category
    const isPositive = ['joy', 'happy', 'excited', 'calm'].includes(mood) || avgMood >= 7
    const isNegative = ['sad', 'anxious', 'angry'].includes(mood) || avgMood <= 4
    
    if (isNegative || avgMood <= 4) {
      return {
        meditation: {
          title: "Stress Relief",
          emoji: "🧘",
          color: "from-blue-50 to-indigo-50",
          border: "border-blue-200",
          suggestions: [
            { text: "10-min guided meditation for anxiety", link: "https://www.youtube.com/watch?v=ZToicYcHIOU" },
            { text: "Deep breathing exercises (5 minutes)", link: "https://www.youtube.com/watch?v=tybOi4hjZFQ" },
            { text: "Book: 'The Anxiety and Phobia Workbook'", link: "https://www.amazon.com/Anxiety-Phobia-Workbook-Edmund-Bourne/dp/1626252157" }
          ]
        },
        music: {
          title: "Uplifting Sounds",
          emoji: "🎵",
          color: "from-purple-50 to-pink-50",
          border: "border-purple-200",
          suggestions: [
            { text: "Happy mood-boosting playlist", link: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0" },
            { text: "Positive affirmations with music", link: "https://www.youtube.com/watch?v=C9rF5uk-hp4" },
            { text: "Energizing morning music", link: "https://www.youtube.com/watch?v=7qWbi0s6mnA" }
          ]
        },
        selfCare: {
          title: "Mood Lifters",
          emoji: "🌱",
          color: "from-green-50 to-emerald-50",
          border: "border-green-200",
          suggestions: [
            { text: "15-minute walk in nature", link: null },
            { text: "Call a friend or loved one", link: null },
            { text: "Watch uplifting TED talk", link: "https://www.ted.com/playlists/171/the_most_popular_talks_of_all" }
          ]
        }
      }
    } else if (isPositive || avgMood >= 7) {
      return {
        meditation: {
          title: "Maintain Balance",
          emoji: "🧘",
          color: "from-blue-50 to-sky-50",
          border: "border-blue-200",
          suggestions: [
            { text: "Gratitude meditation practice", link: "https://www.youtube.com/watch?v=nj3WkV6vZYA" },
            { text: "Morning mindfulness routine", link: "https://www.youtube.com/watch?v=6p_yaNFSYao" },
            { text: "Book: 'The Power of Now' by Eckhart Tolle", link: "https://www.amazon.com/Power-Now-Guide-Spiritual-Enlightenment/dp/1577314808" }
          ]
        },
        music: {
          title: "Feel-Good Vibes",
          emoji: "🎵",
          color: "from-yellow-50 to-orange-50",
          border: "border-yellow-200",
          suggestions: [
            { text: "Happy indie folk playlist", link: "https://open.spotify.com/playlist/37i9dQZF1DX1gRalH0ehVq" },
            { text: "Upbeat acoustic covers", link: "https://www.youtube.com/watch?v=kON_KRmFRKk" },
            { text: "Feel-good pop hits", link: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0" }
          ]
        },
        selfCare: {
          title: "Keep Thriving",
          emoji: "🌱",
          color: "from-green-50 to-teal-50",
          border: "border-green-200",
          suggestions: [
            { text: "Share your positivity with others", link: null },
            { text: "Try a new hobby or activity", link: null },
            { text: "Write in your gratitude journal", link: null }
          ]
        }
      }
    } else {
      return getDefaultMoodBooster()
    }
  }

  const getDefaultMoodBooster = () => {
    return {
      meditation: {
        title: "Mindful Moments",
        emoji: "🧘",
        color: "from-blue-50 to-ocean-50",
        border: "border-ocean-200",
        suggestions: [
          { text: "5-minute breathing exercises", link: "https://www.youtube.com/watch?v=tybOi4hjZFQ" },
          { text: "Guided meditation for beginners", link: "https://www.youtube.com/watch?v=ZToicYcHIOU" },
          { text: "Book: 'Mindfulness in Plain English'", link: "https://www.amazon.com/Mindfulness-Plain-English-Bhante-Gunaratana/dp/0861719069" }
        ]
      },
      music: {
        title: "Soothing Sounds",
        emoji: "🎵",
        color: "from-purple-50 to-pink-50",
        border: "border-purple-200",
        suggestions: [
          { text: "Lo-fi beats for relaxation", link: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
          { text: "Nature sounds & rain ambience", link: "https://www.youtube.com/watch?v=eKFTSSKCzWA" },
          { text: "Calming piano melodies", link: "https://www.youtube.com/watch?v=4oStw0r33so" }
        ]
      },
      selfCare: {
        title: "Self-Care Tips",
        emoji: "🌱",
        color: "from-green-50 to-emerald-50",
        border: "border-green-200",
        suggestions: [
          { text: "Take a short walk outside", link: null },
          { text: "Stay hydrated throughout the day", link: null },
          { text: "Connect with a friend or loved one", link: null }
        ]
      }
    }
  }

  const monthCalendar = generateMonthCalendar()
  const moodBooster = generateMoodBooster()
  const currentMonthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()

  // Chart configurations
  const lineChartData = {
    labels: trends?.dates || [],
    datasets: [
      {
        label: 'Mood Score',
        data: trends?.scores || [],
        borderColor: '#0ea5e9', // ocean-500
        backgroundColor: 'rgba(14, 165, 233, 0.1)', // ocean-500 with opacity
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#38bdf8', // ocean-400
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
  }

  const pieChartData = {
    labels: stats?.moodDistribution?.map((m) => m.mood) || [],
    datasets: [
      {
        data: stats?.moodDistribution?.map((m) => m.count) || [],
        backgroundColor: [
          '#38bdf8', // joy - ocean-400
          '#7dd3fc', // happy - ocean-300
          '#bae6fd', // neutral - ocean-200
          '#0ea5e9', // calm - ocean-500
          '#fca5a5', // sad - blush-300
          '#fcd34d', // anxious - sand-300
          '#0284c7', // excited - ocean-600
          '#e0f2fe', // other - ocean-100
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  const barChartData = {
    labels: stats?.moodDistribution?.map((m) => m.mood) || [],
    datasets: [
      {
        label: 'Frequency',
        data: stats?.moodDistribution?.map((m) => m.count) || [],
        backgroundColor: 'rgba(14, 165, 233, 0.7)', // ocean-500
        borderColor: '#0ea5e9', // ocean-500
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading mood analytics..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Decorative corner elements */}
      <img src="/design-elements/9.png" alt="" className="absolute top-0 left-0 w-48 h-48 opacity-100 animate-float z-20 pointer-events-none" />
      <img src="/design-elements/13.png" alt="" className="absolute top-20 right-0 w-40 h-40 opacity-100 animate-pulse-slow z-20 pointer-events-none" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/icons/21.png" alt="" className="w-8 h-8 scale-[10]" />
          <h1 className="text-4xl font-bold">
            <span className="font-cursive text-5xl">Mood Tracker</span>
          </h1>
        </div>
        <p className="text-lg text-muted-500 max-w-2xl mx-auto">
          Visualize your emotional journey with gentle insights and patterns
        </p>
      </motion.div>

      {/* Overview Section Header with Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ocean-800">Overview</h2>
            <p className="text-xs text-muted-500">
              {timeRange === 'week' && 'Showing last 7 days'}
              {timeRange === 'month' && 'Showing last 30 days'}
              {timeRange === 'all' && 'Showing all-time data'}
            </p>
          </div>

        {/* Time Range Selector */}
          <div className="bg-white/50 rounded-lg p-1.5 border border-ocean-200">
            {[
              { value: 'week', label: 'Week', desc: '7 days' },
              { value: 'month', label: 'Month', desc: '30 days' },
              { value: 'all', label: 'All Time', desc: 'Everything' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === range.value
                    ? 'bg-gradient-to-r from-ocean-400 to-ocean-600 text-white shadow-md'
                    : 'text-muted-500 hover:text-ocean-800 hover:bg-white/50'
                }`}
              >
                <div className="text-center">
                  <div>{range.label}</div>
                  <div className={`text-[10px] ${timeRange === range.value ? 'text-white/80' : 'text-muted-400'}`}>
                    {range.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-ocean-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-500 text-xs mb-1">Total Entries</p>
              <p className="text-2xl font-bold text-ocean-800">{stats?.totalEntries || 0}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-ocean-400 to-ocean-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-ocean-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-500 text-xs mb-1">Average Mood</p>
              <div className="flex items-center space-x-1.5">
                <p className="text-2xl font-bold text-ocean-800">
                  {stats?.averageMood ? Number(stats.averageMood).toFixed(1) : 'N/A'}
                </p>
                <span className="text-xl">{getMoodEmoji(stats?.mostCommonMood)}</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blush-300 to-shell-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-ocean-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-500 text-xs mb-1">Most Common</p>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl">{getMoodEmoji(stats?.mostCommonMood)}</span>
                <p className="text-base font-bold capitalize text-ocean-800">{stats?.mostCommonMood || 'N/A'}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-sand-300 to-ocean-200 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-ocean-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-500 text-xs mb-1">This {timeRange}</p>
              <p className="text-2xl font-bold text-ocean-800">
                {stats?.currentPeriodCount || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-ocean-400 to-ocean-600 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Line Chart - Mood Over Time */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card-sand"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShellBadge icon="starfish" className="mb-0">Mood Trends</ShellBadge>
          </div>
          <div className="h-[300px]">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </motion.div>

        {/* Pie Chart - Mood Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-sand"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShellBadge icon="clam" className="mb-0">Mood Distribution</ShellBadge>
          </div>
          <div className="h-[300px]">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar Chart - Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-sand"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShellBadge icon="shell" className="mb-0">Mood Frequency</ShellBadge>
          </div>
          <div className="h-[300px]">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </motion.div>

        {/* Mood Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-sand"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShellBadge icon="starfish" className="mb-0">Detailed Breakdown</ShellBadge>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[300px]">
            {stats?.moodDistribution?.map((mood, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/70 rounded-xl border border-ocean-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                  <div>
                    <p className="font-semibold capitalize text-ocean-800">{mood.mood}</p>
                    <p className="text-sm text-muted-500">{mood.count} entries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-ocean-800">{mood.percentage}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Your Journey Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 mb-4"
      >
        <h2 className="text-xl font-semibold text-ocean-800">Your Journey</h2>
        <p className="text-xs text-muted-500">Patterns and insights from all your data</p>
      </motion.div>

      {/* Calendar and Insights Row */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Mood Calendar - Monthly View */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="md:col-span-1 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-ocean-200 shadow-sm"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-ocean-100 rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-ocean-600" />
            </button>
            
            <div className="text-center">
              <h3 className="text-sm font-semibold text-ocean-800">{currentMonthName}</h3>
              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  className="text-xs text-ocean-500 hover:text-ocean-700 underline"
                >
                  Go to today
                </button>
              )}
            </div>
            
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-ocean-100 rounded-lg transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-5 h-5 text-ocean-600" />
            </button>
          </div>
          
          <p className="text-xs text-muted-500 mb-3 text-center">Your emotional journey</p>
          
          {monthCalendar && monthCalendar.length > 0 ? (
            <div>
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={i} className="text-center text-[10px] font-semibold text-ocean-700">
                    {day}
                  </div>
                ))}
        </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthCalendar.map((day, index) => (
                  day ? (
            <motion.div
              key={index}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedDate(day.date)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-xs transition-all cursor-pointer ${
                        day.isToday
                          ? 'bg-gradient-to-br from-pink-200/40 to-rose-200/40 backdrop-blur-sm text-ocean-800 font-bold border-2 border-pink-300/50 shadow-md'
                          : selectedDate === day.date
                          ? 'bg-gradient-to-br from-pink-100/60 to-rose-100/60 backdrop-blur-sm border border-pink-300/40'
                          : day.mood
                          ? 'bg-gradient-to-br from-ocean-100 to-ocean-200 border border-ocean-300'
                          : 'bg-white/40 border border-ocean-100/30'
                      }`}
                      title={day.mood ? `${day.date}: ${day.mood}` : `${day.date}: No mood tracked`}
                    >
                      <span className={`text-xs font-semibold ${day.isToday ? 'text-ocean-800' : 'text-ocean-800'}`}>
                        {day.day}
                      </span>
                      {day.mood && (
                        <span className="text-2xl leading-none mt-1">{getMoodEmoji(day.mood)}</span>
                      )}
            </motion.div>
                  ) : (
                    <div key={index} className="aspect-square"></div>
                  )
          ))}
        </div>
              
              {/* Legend */}
              <div className="mt-3 pt-2 border-t border-ocean-200 flex items-center justify-center gap-3 text-[10px] text-muted-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded bg-gradient-to-br from-pink-200/40 to-rose-200/40 border border-pink-300/50"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded bg-gradient-to-br from-ocean-100 to-ocean-200 border border-ocean-300"></div>
                  <span>Tracked</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-xs text-muted-500">Loading calendar...</p>
            </div>
          )}
      </motion.div>

        {/* Insights Panel - Rectangle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="md:col-span-2 bg-gradient-to-br from-ocean-50 to-sand-100 rounded-xl p-5 border border-ocean-200 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-ocean-800 mb-1">Personalized Insights</h3>
            <p className="text-xs text-muted-500">Based on your mood patterns and activities</p>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 bg-white/50 rounded-lg p-3"
                >
                  <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                  <div>
                    <p className="text-ocean-800 font-medium text-sm mb-0.5">{insight.title}</p>
                    <p className="text-muted-600 text-xs leading-relaxed">{insight.text}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <span className="text-3xl mb-2 block">💭</span>
                <p className="text-muted-500 text-sm">Start tracking your mood to receive personalized insights!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mood Booster Section - Personalized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card-sand"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-ocean-800 mb-1">Mood Booster 🌟</h3>
          <p className="text-xs text-muted-500">
            {stats?.mostCommonMood 
              ? `Personalized for your ${stats.mostCommonMood} mood` 
              : 'Personalized suggestions to enhance your wellbeing'}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Meditation */}
          <div className={`bg-gradient-to-br ${moodBooster.meditation.color} rounded-lg p-4 border ${moodBooster.meditation.border}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{moodBooster.meditation.emoji}</span>
              <h4 className="font-semibold text-ocean-800">{moodBooster.meditation.title}</h4>
            </div>
            <ul className="space-y-2 text-xs text-muted-600">
              {moodBooster.meditation.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-ocean-500 mt-0.5">•</span>
                  {suggestion.link ? (
                    <a 
                      href={suggestion.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-ocean-700 hover:underline transition-colors"
                    >
                      {suggestion.text}
                    </a>
                  ) : (
                    <span>{suggestion.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Music */}
          <div className={`bg-gradient-to-br ${moodBooster.music.color} rounded-lg p-4 border ${moodBooster.music.border}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{moodBooster.music.emoji}</span>
              <h4 className="font-semibold text-ocean-800">{moodBooster.music.title}</h4>
            </div>
            <ul className="space-y-2 text-xs text-muted-600">
              {moodBooster.music.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  {suggestion.link ? (
                    <a 
                      href={suggestion.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-ocean-700 hover:underline transition-colors"
                    >
                      {suggestion.text}
                    </a>
                  ) : (
                    <span>{suggestion.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Self-Care */}
          <div className={`bg-gradient-to-br ${moodBooster.selfCare.color} rounded-lg p-4 border ${moodBooster.selfCare.border}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{moodBooster.selfCare.emoji}</span>
              <h4 className="font-semibold text-ocean-800">{moodBooster.selfCare.title}</h4>
            </div>
            <ul className="space-y-2 text-xs text-muted-600">
              {moodBooster.selfCare.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {suggestion.link ? (
                    <a 
                      href={suggestion.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-ocean-700 hover:underline transition-colors"
                    >
                      {suggestion.text}
                    </a>
                  ) : (
                    <span>{suggestion.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MoodDashboard

