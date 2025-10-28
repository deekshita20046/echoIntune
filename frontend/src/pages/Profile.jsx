import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User as UserIcon, Mail, Calendar, Award, Heart, BookOpen, CheckSquare, TrendingUp, Edit2, Save, Camera, UserCircle, MapPin, Briefcase, Star, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMood } from '../contexts/MoodContext'
import { userAPI, moodAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ShellBadge from '../components/ShellBadge'
import CustomIcon from '../components/CustomIcon'
import { formatDate } from '../utils/helpers'

const Profile = () => {
  const { user, updateUser, logout } = useAuth()
  const { getMoodEmoji } = useMood()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: 'shell',
    gender: '',
    birthday: '',
    bio: '',
    pronouns: '',
    timezone: 'UTC',
    occupation: '',
    location: '',
    interests: '',
  })
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [calendar, setCalendar] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  
  const avatarOptions = [
    { icon: 'shell', bg: 'bg-blush-coral/40', border: 'border-blush-coral/60' },
    { icon: 'wave', bg: 'bg-turquoise-tide/40', border: 'border-turquoise-tide/60' },
    { icon: 'sun', bg: 'bg-peach-cream/50', border: 'border-peach-cream/70' },
    { icon: 'moon', bg: 'bg-lavender-shell/40', border: 'border-lavender-shell/60' },
    { icon: 'heart', bg: 'bg-blush-coral/50', border: 'border-blush-coral/70' },
    { icon: 'whale', bg: 'bg-aqua-splash/40', border: 'border-aqua-splash/60' },
    { icon: 'leaf', bg: 'bg-seafoam-mist/60', border: 'border-turquoise-tide/50' },
    { icon: 'cloud', bg: 'bg-shell-white/80', border: 'border-sand-beige/60' },
    { icon: 'anchor', bg: 'bg-ocean-deep/30', border: 'border-ocean-deep/50' },
    { icon: 'lighthouse', bg: 'bg-peach-cream/60', border: 'border-peach-cream/80' },
    { icon: 'sparkles', bg: 'bg-lavender-shell/50', border: 'border-lavender-shell/70' },
    { icon: 'compass', bg: 'bg-turquoise-tide/50', border: 'border-aqua-splash/60' },
  ]

  useEffect(() => {
    fetchUserProfile()
    fetchUserStats()
    fetchMoodData()
  }, [])
  
  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      console.log('Fetched user profile:', response.data.user)
      setProfile({
        name: response.data.user.name || '',
        email: response.data.user.email || '',
        avatar: response.data.user.avatar || 'shell',
        gender: response.data.user.gender || '',
        birthday: response.data.user.birthday || '',
        bio: response.data.user.bio || '',
        pronouns: response.data.user.pronouns || '',
        timezone: response.data.user.timezone || 'UTC',
        occupation: response.data.user.occupation || '',
        location: response.data.user.location || '',
        interests: response.data.user.interests || '',
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Fall back to user from context
      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || 'shell',
        gender: '',
        birthday: '',
        bio: '',
        pronouns: '',
        timezone: 'UTC',
        occupation: '',
        location: '',
        interests: '',
      })
    }
  }

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      // Mock data
      setStats({
        totalJournals: 45,
        totalTasks: 128,
        completedTasks: 89,
        totalHabits: 6,
        longestStreak: 12,
        averageMood: 7.8,
        mostCommonMood: 'happy',
        joinedDate: user?.created_at || new Date().toISOString(),
        moodBreakdown: [
          { mood: 'happy', count: 20 },
          { mood: 'calm', count: 15 },
          { mood: 'neutral', count: 8 },
          { mood: 'anxious', count: 2 },
        ],
      })
    } finally {
      setLoading(false)
    }
  }
  
  const fetchMoodData = async () => {
    try {
      const response = await moodAPI.getTrends(null) // Get all data for calendar
      console.log('Fetched mood data for profile:', response.data)
      
      const calendarData = response.data.calendar || []
      setCalendar(calendarData)
      
      console.log('📅 Calendar loaded:', calendarData.length, 'days')
      console.log('📅 Days with mood:', calendarData.filter(d => d.mood).length)
    } catch (error) {
      console.error('Failed to fetch mood data:', error)
      setCalendar([])
    }
  }

  // Generate calendar for selected month (same as MoodDashboard)
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

  const handleUpdateProfile = async () => {
    try {
      console.log('💾 Saving profile (no validation, saving all fields as-is):', profile)
      
      // Send all profile data to backend (including empty strings)
      const response = await userAPI.updateProfile(profile)
      console.log('✅ Profile saved successfully:', response.data)
      
      // Update the local profile state with confirmed data from server
      if (response.data.user) {
        const updatedProfile = {
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          avatar: response.data.user.avatar || '🐚',
          gender: response.data.user.gender || '',
          birthday: response.data.user.birthday || '',
          bio: response.data.user.bio || '',
          pronouns: response.data.user.pronouns || '',
          timezone: response.data.user.timezone || 'UTC',
          occupation: response.data.user.occupation || '',
          location: response.data.user.location || '',
          interests: response.data.user.interests || '',
        }
        
        setProfile(updatedProfile)
        
        // Update the auth context so user data persists across the app
        if (updateUser) {
          updateUser(response.data.user)
        }
        
        console.log('✅ Local state and auth context updated with new profile data')
      }
      
      setEditing(false)
      
      // Show success message
      const message = response.data.message || 'Profile updated successfully! ✨'
      alert(message)
      
      // Trigger a refetch of dashboard data if on home page (to update AI insights)
      console.log('💡 Profile updated - AI insights will be more personalized on next generation')
    } catch (error) {
      console.error('❌ Failed to update profile:', error)
      console.error('Error details:', error.response?.data || error.message)
      
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to update profile. Please try again.'
      alert('Error: ' + errorMsg)
    }
  }
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/')
    }
  }
  
  const handleAvatarSelect = async (avatar) => {
    const updatedProfile = { ...profile, avatar }
    setProfile(updatedProfile)
    setShowAvatarSelector(false)
    
    // Save avatar immediately
    try {
      console.log('Saving avatar:', avatar)
      const response = await userAPI.updateProfile({ avatar })
      console.log('Avatar saved:', response.data)
      
      if (updateUser && response.data.user) {
        updateUser(response.data.user)
      }
    } catch (error) {
      console.error('Failed to save avatar:', error)
      alert('Failed to save avatar. Please try editing your profile and saving.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading profile..." />
      </div>
    )
  }

  const monthCalendar = generateMonthCalendar()
  const currentMonthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <UserCircle className="w-8 h-8 text-ocean-600" />
          <h1 className="text-4xl font-bold">
            <span className="font-cursive text-5xl">Profile</span>
          </h1>
        </div>
        <p className="text-lg text-muted-500 max-w-2xl mx-auto">
          Your personal information and ocean-themed statistics
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-sand"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 flex-shrink-0 breathing overflow-hidden relative ${
              avatarOptions.find(a => a.icon === profile.avatar)?.bg || 'bg-peach-cream/25'
            } ${
              avatarOptions.find(a => a.icon === profile.avatar)?.border || 'border-peach-cream/50'
            }`}>
              {profile.avatar?.startsWith('http') ? (
                <img 
                  src={profile.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CustomIcon name={profile.avatar || 'shell'} className="w-6 h-6 scale-[11]" />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-sand-300 to-shell-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800"
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800"
                  placeholder="Email"
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={profile.pronouns}
                    onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
                    className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800"
                    placeholder="Pronouns (e.g., she/her, he/him, they/them)"
                  />
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800"
                  >
                    <option value="">Gender (optional)</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800"
                  placeholder="Birthday"
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800"
                    placeholder="Occupation"
                  />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800"
                    placeholder="Location (City, Country)"
                  />
                </div>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800 resize-none"
                  placeholder="Bio / About Me"
                  rows="3"
                />
                <textarea
                  value={profile.interests}
                  onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white/70 text-ocean-800 resize-none"
                  placeholder="Interests / Hobbies (comma-separated)"
                  rows="2"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-ocean-800">{profile.name}</h2>
                {profile.pronouns && (
                  <p className="text-sm text-muted-400 italic">({profile.pronouns})</p>
                )}
                <p className="text-muted-500 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
                {profile.birthday && (
                  <p className="text-muted-500 flex items-center gap-2 mt-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(profile.birthday, 'PPP')}
                  </p>
                )}
                {profile.occupation && (
                  <p className="text-muted-500 flex items-center gap-2 mt-1 text-sm">
                    <Briefcase className="w-4 h-4" />
                    {profile.occupation}
                  </p>
                )}
                {profile.location && (
                  <p className="text-muted-500 flex items-center gap-2 mt-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-sm text-ocean-700 mt-3 italic">"{profile.bio}"</p>
                )}
                {profile.interests && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.interests.split(',').map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-xs flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-muted-500 flex items-center gap-2 mt-3 text-sm">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(stats?.joinedDate || user?.created_at, 'PPP')}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
          <button
            onClick={editing ? handleUpdateProfile : () => setEditing(true)}
            className={`${
              editing ? 'btn-gradient' : 'px-6 py-3 bg-white/70 border border-ocean-200 rounded-xl hover:bg-white transition-all text-ocean-800'
            } flex items-center space-x-2`}
          >
            {editing ? (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
            
            {!editing && (
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all text-red-600 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Avatar Selector Modal */}
      <AnimatePresence>
        {showAvatarSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAvatarSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-sand max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShellBadge icon="starfish" className="mb-0">Choose Avatar</ShellBadge>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {avatarOptions.map((avatarOption) => (
                  <motion.button
                    key={avatarOption.icon}
                    onClick={() => handleAvatarSelect(avatarOption.icon)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square rounded-xl transition-all duration-200 flex items-center justify-center overflow-hidden relative ${
                      profile.avatar === avatarOption.icon
                        ? `${avatarOption.bg} border-2 ${avatarOption.border} scale-110 shadow-lg ring-2 ring-ocean-200/50`
                        : `${avatarOption.bg} border ${avatarOption.border} hover:scale-105`
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CustomIcon name={avatarOption.icon} className="w-4 h-4 scale-[11]" />
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="w-full mt-6 px-4 py-3 text-muted-500 hover:text-ocean-800 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-sand"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-ocean-400 to-ocean-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-500">Journal Entries</p>
          <p className="text-3xl font-bold text-ocean-800">{stats?.totalJournals || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-sand"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-ocean-200 to-ocean-400 rounded-full flex items-center justify-center mb-4">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-500">Tasks Completed</p>
          <p className="text-3xl font-bold text-ocean-800">
            {stats?.completedTasks || 0}/{stats?.totalTasks || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-sand"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-sand-300 to-ocean-200 rounded-full flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-500">Longest Streak</p>
          <p className="text-3xl font-bold text-ocean-800">{stats?.longestStreak || 0} days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-sand"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blush-300 to-shell-500 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-500">Average Mood</p>
          <div className="flex items-center space-x-2">
            <p className="text-3xl font-bold text-ocean-800">{stats?.averageMood ? Number(stats.averageMood).toFixed(1) : 'N/A'}</p>
            <span className="text-2xl">{getMoodEmoji(stats?.mostCommonMood)}</span>
          </div>
        </motion.div>
      </div>

      {/* Mood Journey - Calendar + Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-ocean-200 shadow-sm"
      >
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Your Mood Journey
        </h2>

        {calendar && calendar.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Left: Compact Calendar */}
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1 hover:bg-ocean-100 rounded transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4 text-ocean-600" />
                </button>
                
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-ocean-800">{currentMonthName}</h3>
                  {!isCurrentMonth && (
                    <button
                      onClick={goToToday}
                      className="text-[10px] text-ocean-500 hover:text-ocean-700 underline"
                    >
                      Go to today
                    </button>
                  )}
                </div>
                
                <button
                  onClick={goToNextMonth}
                  className="p-1 hover:bg-ocean-100 rounded transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4 text-ocean-600" />
                </button>
              </div>

              {monthCalendar && monthCalendar.length > 0 ? (
                <div>
                  {/* Day labels */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[9px] font-semibold text-ocean-700">
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
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setSelectedDate(day.date)}
                          className={`aspect-square rounded flex flex-col items-center justify-center text-[9px] transition-all cursor-pointer ${
                            day.isToday
                              ? 'bg-gradient-to-br from-pink-200/40 to-rose-200/40 text-ocean-800 font-bold border border-pink-300/50'
                              : selectedDate === day.date
                              ? 'bg-gradient-to-br from-pink-100/60 to-rose-100/60 border border-pink-300/40'
                              : day.mood
                              ? 'bg-gradient-to-br from-ocean-100 to-ocean-200 border border-ocean-300'
                              : 'bg-white/40 border border-ocean-100/30'
                          }`}
                          title={day.mood ? `${day.date}: ${day.mood}` : `${day.date}: No mood tracked`}
                        >
                          <span className="text-[9px] font-semibold">{day.day}</span>
                          {day.mood && (
                            <span className="text-sm leading-none">{getMoodEmoji(day.mood)}</span>
                          )}
                        </motion.div>
                      ) : (
                        <div key={index} className="aspect-square"></div>
                      )
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-2 pt-2 border-t border-ocean-200 flex items-center justify-center gap-2 text-[9px] text-muted-500">
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
                <div className="text-center py-4">
                  <div className="text-2xl mb-1">📅</div>
                  <p className="text-[10px] text-muted-500">Loading...</p>
                </div>
              )}
            </div>

            {/* Right: Mood Journey Stats */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-ocean-700 mb-2">Mood Summary</h3>
                <div className="space-y-2">
                  {/* Total Entries */}
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-ocean-50 to-blush-50 rounded-lg">
                    <span className="text-xs text-muted-600">Total Entries</span>
                    <span className="text-sm font-bold text-ocean-700">
                      {calendar.filter(d => d.mood).length}
                  </span>
                  </div>

                  {/* Most Common Mood */}
                  {(() => {
                    const moodCounts = {}
                    calendar.forEach(day => {
                      if (day.mood) {
                        moodCounts[day.mood] = (moodCounts[day.mood] || 0) + 1
                      }
                    })
                    const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
                    return mostCommon ? (
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blush-50 to-sand-50 rounded-lg">
                        <span className="text-xs text-muted-600">Most Common</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getMoodEmoji(mostCommon[0])}</span>
                          <span className="text-xs font-medium capitalize text-ocean-700">{mostCommon[0]}</span>
                        </div>
                      </div>
                    ) : null
                  })()}

                  {/* This Month */}
                  {(() => {
                    const thisMonthMoods = monthCalendar?.filter(d => d?.mood).length || 0
                    return (
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-sand-50 to-ocean-50 rounded-lg">
                        <span className="text-xs text-muted-600">This Month</span>
                        <span className="text-sm font-bold text-ocean-700">{thisMonthMoods} days</span>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Mood Distribution (Compact) */}
              <div>
                <h3 className="text-sm font-semibold text-ocean-700 mb-2">Mood Distribution</h3>
                <div className="space-y-1.5">
                  {(() => {
                    const moodCounts = {}
                    calendar.forEach(day => {
                      if (day.mood) {
                        moodCounts[day.mood] = (moodCounts[day.mood] || 0) + 1
                      }
                    })
                    const breakdown = Object.entries(moodCounts)
                      .map(([mood, count]) => ({ mood, count }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 4) // Top 4 moods
                    
                    const total = breakdown.reduce((sum, m) => sum + m.count, 0)
                    
                    return breakdown.map((mood, index) => {
                      const percentage = ((mood.count / total) * 100).toFixed(0)
                      return (
                        <div key={mood.mood}>
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{getMoodEmoji(mood.mood)}</span>
                              <span className="text-[10px] font-medium capitalize text-ocean-700">{mood.mood}</span>
                            </div>
                            <span className="text-[9px] text-muted-500">{percentage}%</span>
                          </div>
                          <div className="w-full bg-ocean-100 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="bg-gradient-to-r from-ocean-400 to-ocean-600 h-1.5 rounded-full"
                  />
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">😊</div>
            <p className="text-sm text-muted-500 mb-2">No mood data yet</p>
            <p className="text-xs text-muted-400">
              Start tracking your mood on the Mood Tracker page or by writing journal entries
            </p>
        </div>
        )}
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Award className="w-6 h-6 mr-2 text-ocean-600" />
          Achievements
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: '🔥',
              title: 'Streak Master',
              description: '7-day journaling streak',
              unlocked: stats?.longestStreak >= 7,
            },
            {
              icon: '📚',
              title: 'Prolific Writer',
              description: '50+ journal entries',
              unlocked: stats?.totalJournals >= 50,
            },
            {
              icon: '✅',
              title: 'Task Crusher',
              description: '100+ completed tasks',
              unlocked: stats?.completedTasks >= 100,
            },
            {
              icon: '🎯',
              title: 'Habit Builder',
              description: '5+ active habits',
              unlocked: stats?.totalHabits >= 5,
            },
            {
              icon: '😊',
              title: 'Positive Vibes',
              description: 'Average mood 7+',
              unlocked: stats?.averageMood >= 7,
            },
            {
              icon: '🌟',
              title: 'Consistency King',
              description: '30-day streak',
              unlocked: stats?.longestStreak >= 30,
            },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-sand-100 to-shell-500 border-ocean-300'
                  : 'bg-ocean-100 border-ocean-200 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="font-bold mb-1">{achievement.title}</h3>
              <p className="text-sm text-muted-500">{achievement.description}</p>
              {achievement.unlocked && (
                <p className="text-xs text-ocean-600 font-medium mt-2">✓ Unlocked!</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card bg-gradient-to-br from-ocean-50 to-sand-100 border-ocean-200"
      >
        <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
        <div className="space-y-3">
          <p className="text-ocean-800">
            🎉 You've been on an amazing journey of self-improvement! With{' '}
            <strong>{stats?.totalJournals || 0} journal entries</strong>, you've taken time to
            reflect and understand yourself better.
          </p>
          <p className="text-ocean-800">
            💪 You've crushed <strong>{stats?.completedTasks || 0} tasks</strong> and are building{' '}
            <strong>{stats?.totalHabits || 0} positive habits</strong>. Keep up the fantastic work!
          </p>
          <p className="text-ocean-800">
            🌟 Your longest streak of <strong>{stats?.longestStreak || 0} days</strong> shows your
            dedication and consistency. You're doing great!
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Profile

