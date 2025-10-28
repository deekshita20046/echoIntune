import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, TrendingUp, Award, Target, Heart, Calendar, CheckCircle, X, Info, BarChart3, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { habitAPI } from '../utils/api'
import { useMood } from '../contexts/MoodContext'
import { calculateStreak, getMonthProgress } from '../utils/helpers'
import LoadingSpinner from '../components/LoadingSpinner'
import ShellBadge from '../components/ShellBadge'

const HabitTracker = () => {
  const { getMoodEmoji } = useMood()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null) // For detail modal
  const [editingHabit, setEditingHabit] = useState(null) // For edit modal
  const [newHabit, setNewHabit] = useState({
    name: '',
    frequency: 'daily',
    icon: '🎯',
  })

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  // Calculate mood impact for each habit
  const getHabitMoodImpact = (habit) => {
    const completionRate = habit.marked_days ? habit.marked_days.length / daysInMonth : 0
    
    if (completionRate >= 0.8) return { emoji: '😊', color: 'text-ocean-600', impact: 'Very Positive' }
    if (completionRate >= 0.6) return { emoji: '😌', color: 'text-ocean-400', impact: 'Positive' }
    if (completionRate >= 0.4) return { emoji: '😐', color: 'text-muted-500', impact: 'Neutral' }
    if (completionRate >= 0.2) return { emoji: '😔', color: 'text-sand-300', impact: 'Needs Attention' }
    return { emoji: '😢', color: 'text-blush-300', impact: 'Needs Focus' }
  }

  // Check if habit is completed today
  const isCompletedToday = (habit) => {
    return habit.marked_days?.includes(today) || false
  }

  // Fetch habits when page mounts
  useEffect(() => {
    console.log('📍 Habits page mounted, fetching habits...')
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      setLoading(true)
      const response = await habitAPI.getAll()
      console.log('📊 HabitTracker: Fetched habits from backend:', response.data.habits.length)
      
      // Log each habit's marked days
      response.data.habits.forEach(habit => {
        console.log(`  📅 ${habit.name}: ${habit.marked_days?.length || 0} marked days`, 
                    habit.marked_days?.slice(0, 3))
        const isToday = habit.marked_days?.includes(today)
        console.log(`    Today (${today}) is ${isToday ? 'MARKED' : 'NOT marked'}`)
      })
      
      setHabits(response.data.habits)
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHabit = async () => {
    if (!newHabit.name.trim()) return

    try {
      const response = await habitAPI.create(newHabit)
      setHabits([...habits, response.data.habit])
      setNewHabit({ name: '', frequency: 'daily', icon: '🎯' })
      setShowAddHabit(false)
    } catch (error) {
      console.error('Failed to add habit:', error)
      alert('Failed to add habit. Please try again.')
    }
  }

  const handleEditHabit = async () => {
    if (!editingHabit.name.trim()) return

    try {
      const response = await habitAPI.update(editingHabit.id, {
        name: editingHabit.name,
        icon: editingHabit.icon,
        frequency: editingHabit.frequency
      })
      setHabits(habits.map(h => h.id === editingHabit.id ? response.data.habit : h))
      setEditingHabit(null)
    } catch (error) {
      console.error('Failed to edit habit:', error)
      alert('Failed to update habit. Please try again.')
    }
  }

  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Delete this habit?')) return

    try {
      await habitAPI.delete(id)
      setHabits(habits.filter((h) => h.id !== id))
      setSelectedHabit(null)
    } catch (error) {
      console.error('Failed to delete habit:', error)
    }
  }

  const handleToggleToday = async (habitId) => {
    const habit = habits.find((h) => h.id === habitId)
    const isMarked = habit.marked_days?.includes(today)

    try {
      console.log('✅ HabitTracker: Toggling habit', habitId, isMarked ? 'unmark' : 'mark')
      console.log('📅 Today:', today)
      console.log('📋 Current marked_days:', habit.marked_days)
      
      // Update backend FIRST
      if (isMarked) {
        await habitAPI.unmarkDay(habitId, today)
      } else {
        await habitAPI.markDay(habitId, today)
      }
      console.log('✅ HabitTracker: Habit toggled in backend successfully')

      // Immediately refetch to ensure consistency
      const response = await habitAPI.getAll()
      const fetchedHabits = response.data.habits
      setHabits(fetchedHabits)
      console.log('✅ HabitTracker: Habits refetched and state updated')
      
      // Update selected habit if modal is open
      if (selectedHabit && selectedHabit.id === habitId) {
        const updatedHabit = fetchedHabits.find(h => h.id === habitId)
        if (updatedHabit) {
          console.log('📝 Updating modal with fresh data:', updatedHabit.marked_days)
          setSelectedHabit(updatedHabit)
        }
      }
    } catch (error) {
      console.error('Failed to toggle today:', error)
      alert('Failed to update habit. Please try again.')
      // Refetch on error to show correct state
      const response = await habitAPI.getAll()
      setHabits(response.data.habits)
    }
  }

  const habitIcons = [
    '', // No emoji option
    '🎯', '💪', '📚', '🧘‍♀️', '🏃', '💧', '🥗', '😴', '✍️', '🎨', '🎵', '🧠',
    '🏋️', '🚴', '🍎', '☕', '🌱', '💻', '🎮', '📱', '🏠', '✈️', '📷', '🎬',
    '🎸', '⚽', '🎾', '🏀', '⛷️', '🏊', '🧩', '🎲', '🃏', '🎭', '🎪', '🎺',
    '🥁', '🎹', '🎤', '🎧', '📖', '📝', '🖊️', '✏️', '📐', '🔬', '🔭', '💡',
    '🔥', '⭐', '✨', '🌟', '💫', '🌙', '☀️', '🌤️', '⛅', '🌈', '🔔', '⏰'
  ]

  // Generate calendar data based on frequency
  const generateCalendarData = (habit) => {
    const calendarDays = []
    const now = new Date()
    
    if (habit.frequency === 'daily') {
      // Show all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const isMarked = habit.marked_days?.includes(dateStr)
        const isToday = dateStr === today
        const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0)
        
        calendarDays.push({ day, dateStr, isMarked, isToday, isPast })
      }
    } else if (habit.frequency === 'weekly') {
      // Show only current week (7 days: Sun-Sat)
      const currentDayOfWeek = now.getDay() // 0 = Sunday
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - currentDayOfWeek)
      
      for (let i = 0; i < 7; i++) {
        const weekDay = new Date(startOfWeek)
        weekDay.setDate(startOfWeek.getDate() + i)
        const dateStr = weekDay.toISOString().split('T')[0]
        const isMarked = habit.marked_days?.includes(dateStr)
        const isToday = dateStr === today
        const isPast = weekDay < new Date().setHours(0, 0, 0, 0)
        
        calendarDays.push({ 
          day: weekDay.getDate(),
          dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          dateStr, 
          isMarked, 
          isToday, 
          isPast 
        })
      }
    } else if (habit.frequency === 'monthly') {
      // Show only current month (just the checkable box for this month)
      const monthName = now.toLocaleString('default', { month: 'long' })
      const isMarked = habit.marked_days?.some(d => d.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`))
      calendarDays.push({ 
        day: monthName, 
        dateStr: today, 
        isMarked, 
        isToday: true, 
        isPast: false 
      })
    }
    
    return calendarDays
  }

  const todayHabits = habits.filter(h => h.frequency === 'daily' || 
    (h.frequency === 'weekly' && new Date().getDay() !== 0) ||
    (h.frequency === 'monthly' && new Date().getDate() === 1))

  return (
    <div className="space-y-6 relative">
      {/* Decorative corner elements */}
      <img src="/design-elements/14.png" alt="" className="absolute top-0 right-0 w-48 h-48 opacity-100 animate-float z-20 pointer-events-none" />
      <img src="/design-elements/17.png" alt="" className="absolute top-4 left-0 w-40 h-40 opacity-100 animate-pulse-slow z-20 pointer-events-none" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/icons/25.png" alt="" className="w-8 h-8 scale-[10]" />
          <h1 className="text-4xl font-bold">
            <span className="font-cursive text-5xl">Habit Tracker</span>
          </h1>
        </div>
        <p className="text-lg text-muted-500 max-w-2xl mx-auto">
          Build consistency with gentle progress tracking and mood-aware insights
        </p>
        <button
          onClick={() => setShowAddHabit(true)}
          className="mt-6 btn-gradient flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Habit</span>
        </button>
      </motion.div>

      {/* Today's Checklist */}
      {!loading && habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-ocean-50 to-teal-50 border-2 border-ocean-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-ocean-600" />
              <h2 className="text-2xl font-bold text-ocean-800">Today's Habits</h2>
            </div>
            <div className="text-sm text-ocean-600 font-medium">
              {habits.filter(h => isCompletedToday(h)).length} / {habits.length} completed
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {habits.map((habit) => (
              <motion.div
                key={habit.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isCompletedToday(habit)
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400'
                    : 'bg-white border-ocean-200 hover:border-ocean-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isCompletedToday(habit)}
                    onChange={() => handleToggleToday(habit.id)}
                    className="task-checkbox cursor-pointer w-5 h-5"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-3xl">{habit.icon}</span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isCompletedToday(habit) ? 'line-through text-muted-600' : 'text-ocean-900'}`}>
                      {habit.name}
                    </p>
                    <p className="text-xs text-muted-500 capitalize">{habit.frequency}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddHabit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-sand max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShellBadge icon="starfish" className="mb-0">Add New Habit</ShellBadge>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="e.g., Morning Exercise, Meditation, Reading..."
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {habitIcons.map((icon, index) => (
                      <button
                        key={index}
                        onClick={() => setNewHabit({ ...newHabit, icon })}
                        className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                          newHabit.icon === icon
                            ? 'bg-gradient-to-r from-ocean-400 to-ocean-600 border-2 border-ocean-500 scale-110 shadow-lg text-white'
                            : 'bg-white/70 hover:bg-white border border-ocean-200'
                        } ${icon === '' ? 'text-xs font-medium' : 'text-3xl'}`}
                      >
                        {icon === '' ? 'None' : icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Frequency
                  </label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddHabit(false)}
                    className="flex-1 px-4 py-3 text-muted-500 hover:text-ocean-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddHabit}
                    disabled={!newHabit.name.trim()}
                    className="flex-1 btn-gradient disabled:opacity-50"
                  >
                    Add Habit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Habit Modal */}
      <AnimatePresence>
        {editingHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingHabit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-sand max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <Edit2 className="w-6 h-6 text-ocean-600" />
                <h2 className="text-2xl font-bold text-ocean-800">Edit Habit</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={editingHabit.name}
                    onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                    placeholder="e.g., Morning Exercise, Meditation, Reading..."
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {habitIcons.map((icon, index) => (
                      <button
                        key={index}
                        onClick={() => setEditingHabit({ ...editingHabit, icon })}
                        className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                          editingHabit.icon === icon
                            ? 'bg-gradient-to-r from-ocean-400 to-ocean-600 border-2 border-ocean-500 scale-110 shadow-lg text-white'
                            : 'bg-white/70 hover:bg-white border border-ocean-200'
                        } ${icon === '' ? 'text-xs font-medium' : 'text-3xl'}`}
                      >
                        {icon === '' ? 'None' : icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Frequency
                  </label>
                  <select
                    value={editingHabit.frequency}
                    onChange={(e) => setEditingHabit({ ...editingHabit, frequency: e.target.value })}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingHabit(null)}
                    className="flex-1 px-4 py-3 text-muted-500 hover:text-ocean-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditHabit}
                    disabled={!editingHabit.name.trim()}
                    className="flex-1 btn-gradient disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit Detail Modal */}
      <AnimatePresence>
        {selectedHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedHabit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-sand max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedHabit.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-ocean-800">{selectedHabit.name}</h2>
                    <p className="text-sm text-muted-500 capitalize">{selectedHabit.frequency}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHabit(null)}
                  className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-500" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/70 rounded-xl p-4 border border-ocean-200">
                  <div className="flex flex-col items-center text-center">
                    <TrendingUp className="w-6 h-6 text-ocean-500 mb-2" />
                    <p className="text-xs text-muted-500 mb-1">Current Streak</p>
                    <p className="text-2xl font-bold text-ocean-800">
                      {calculateStreak(selectedHabit.marked_days || [])}
                    </p>
                  </div>
                </div>

                <div className="bg-white/70 rounded-xl p-4 border border-ocean-200">
                  <div className="flex flex-col items-center text-center">
                    <Target className="w-6 h-6 text-ocean-600 mb-2" />
                    <p className="text-xs text-muted-500 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-ocean-800">
                      {getMonthProgress(selectedHabit.marked_days || [], daysInMonth)}%
                    </p>
                  </div>
                </div>

                <div className="bg-white/70 rounded-xl p-4 border border-ocean-200">
                  <div className="flex flex-col items-center text-center">
                    <Heart className="w-6 h-6 text-blush-400 mb-2" />
                    <p className="text-xs text-muted-500 mb-1">Mood Impact</p>
                    <p className="text-2xl">
                      {getHabitMoodImpact(selectedHabit).emoji}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-ocean-500" />
                  <h3 className="font-bold text-ocean-800">Progress Calendar</h3>
                  <span className="text-xs text-muted-500">
                    ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
                  </span>
                </div>
                
                <div className={`grid gap-2 ${
                  selectedHabit.frequency === 'monthly' ? 'grid-cols-1' : 
                  selectedHabit.frequency === 'weekly' ? 'grid-cols-7' : 
                  'grid-cols-7 md:grid-cols-10'
                }`}>
                  {generateCalendarData(selectedHabit).map((dayData, idx) => {
                    const { day, dayName, dateStr, isMarked, isToday, isPast } = dayData
                    const canClick = isToday // Only today is clickable
                    const displayText = selectedHabit.frequency === 'weekly' && dayName 
                      ? dayName 
                      : selectedHabit.frequency === 'monthly' 
                      ? day 
                      : day
                    
                    return (
                      <motion.button
                        key={idx}
                        onClick={canClick ? () => handleToggleToday(selectedHabit.id) : undefined}
                        whileHover={canClick ? { scale: 1.1 } : {}}
                        whileTap={canClick ? { scale: 0.95 } : {}}
                        disabled={!canClick}
                        className={`${
                          selectedHabit.frequency === 'weekly' ? 'aspect-auto p-3' : 
                          selectedHabit.frequency === 'monthly' ? 'aspect-auto p-4' : 
                          'aspect-square'
                        } rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                          isMarked
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md'
                            : isToday
                            ? 'bg-ocean-100 border-2 border-ocean-400 text-ocean-800 cursor-pointer hover:bg-ocean-200'
                            : isPast
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-ocean-200 text-muted-500 cursor-not-allowed'
                        } ${isToday ? 'ring-2 ring-ocean-400 ring-offset-2' : ''}`}
                      >
                        {selectedHabit.frequency === 'weekly' ? (
                          <>
                            <div className="text-xs mb-1">{dayName}</div>
                            <div className="text-lg">{isMarked ? '✓' : day}</div>
                          </>
                        ) : selectedHabit.frequency === 'monthly' ? (
                          <>
                            <div className="text-xs text-muted-600 mb-1">This Month</div>
                            <div className="text-base font-semibold">{isMarked ? '✓' : day}</div>
                          </>
                        ) : (
                          <div>{isMarked ? '✓' : day}</div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-emerald-500"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-ocean-100 border-2 border-ocean-400"></div>
                    <span>Today (clickable)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100"></div>
                    <span>Past (locked)</span>
                  </div>
                </div>
              </div>

              {/* Mood Insight */}
              <div className="p-4 bg-gradient-to-r from-ocean-50 to-sand-100 rounded-xl border border-ocean-200 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getHabitMoodImpact(selectedHabit).emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-ocean-800 mb-1">Mood Insight</p>
                    <p className="text-sm text-muted-500">
                      {getHabitMoodImpact(selectedHabit).impact === 'Very Positive' 
                        ? `You tend to feel happier on days you complete "${selectedHabit.name}"! Keep it up! 🌊`
                        : getHabitMoodImpact(selectedHabit).impact === 'Positive'
                        ? `"${selectedHabit.name}" has a positive effect on your mood. Great work! 😊`
                        : getHabitMoodImpact(selectedHabit).impact === 'Neutral'
                        ? `"${selectedHabit.name}" has a neutral effect on your mood. Consider how it makes you feel. 🤔`
                        : getHabitMoodImpact(selectedHabit).impact === 'Needs Attention'
                        ? `"${selectedHabit.name}" might need some adjustment. Try a gentler approach. 🌱`
                        : `"${selectedHabit.name}" needs more focus. Consider breaking it into smaller steps. 💪`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteHabit(selectedHabit.id)}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Habit
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Habits List */}
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="text-muted-500 mt-4">Loading your habits...</p>
        </div>
      ) : habits.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-ocean-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-ocean-500" />
            All Habits
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit, index) => {
            const streak = calculateStreak(habit.marked_days || [])
            const progress = getMonthProgress(habit.marked_days || [], daysInMonth)
            const moodImpact = getHabitMoodImpact(habit)

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedHabit(habit)}
                  className="card bg-white hover:shadow-xl transition-all cursor-pointer group"
                >
                  {/* Compact Header */}
                  <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                      <div className="text-4xl group-hover:scale-110 transition-transform">
                        {habit.icon || '🎯'}
                      </div>
                      <div>
                        <h3 className="font-bold text-ocean-800 group-hover:text-ocean-600 transition-colors">
                          {habit.name}
                        </h3>
                        <p className="text-xs text-muted-500 capitalize">{habit.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingHabit(habit)
                        }}
                        className="p-2 rounded-lg hover:bg-ocean-100 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit habit"
                      >
                        <Edit2 className="w-4 h-4 text-ocean-600" />
                      </button>
                      <div className="text-2xl">{moodImpact.emoji}</div>
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-ocean-50 rounded-lg">
                      <p className="text-xs text-muted-500">Streak</p>
                      <p className="text-lg font-bold text-ocean-800">{streak}</p>
                    </div>
                    <div className="text-center p-2 bg-teal-50 rounded-lg">
                      <p className="text-xs text-muted-500">Month</p>
                      <p className="text-lg font-bold text-ocean-800">{progress}%</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-muted-500">Today</p>
                      <p className="text-lg font-bold text-ocean-800">
                        {isCompletedToday(habit) ? '✓' : '○'}
                      </p>
                    </div>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full bg-ocean-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-ocean-400 to-teal-500"
                    />
                </div>

                  <p className="text-xs text-center text-ocean-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click for details →
                  </p>
              </motion.div>
            )
          })}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-sand text-center py-16"
        >
          <div className="text-8xl mb-6">🌱</div>
          <h3 className="text-2xl font-bold text-ocean-800 mb-3">No habits yet</h3>
          <p className="text-muted-500 mb-8 max-w-md mx-auto">
            Start building healthy habits today! Small steps lead to big changes. 🌊
          </p>
          <button 
            onClick={() => setShowAddHabit(true)} 
            className="btn-gradient flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Your First Habit
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default HabitTracker
