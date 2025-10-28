import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  Plus,
  Check,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Target,
  Bell,
  Star,
  Flag,
  X,
  Info,
} from 'lucide-react'
import { plannerAPI, aiAPI } from '../utils/api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns'
import LoadingSpinner from '../components/LoadingSpinner'
import ShellBadge from '../components/ShellBadge'
import SelectedDatePanel from '../components/SelectedDatePanel'
import { formatTime12Hour, convertUTCToISTDateString } from '../utils/timezone'

const Planner = () => {
  const [activeTab, setActiveTab] = useState('today') // 'today' or 'week'
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [allTasks, setAllTasks] = useState({}) // All tasks organized by date
  const [loading, setLoading] = useState(false)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTaskDetail, setShowTaskDetail] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  
  // New task form - Initialize with today's date
  const [newTask, setNewTask] = useState(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    console.log('📅 Initializing newTask with today:', today)
    return {
      title: '',
      taskType: 'todo', // 'todo', 'goal', 'reminder'
      priority: 'medium',
      dueDate: today,
      reminderTime: '',
      isImportant: false,
      description: '',
      isCalendarTask: false, // Track if task was created from calendar
    }
  })

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState({})
  const [loadingAI, setLoadingAI] = useState(false)
  const [selectedTaskForAI, setSelectedTaskForAI] = useState(null)
  const [currentSuggestions, setCurrentSuggestions] = useState(null)

  // Fetch tasks on mount
  useEffect(() => {
    console.log('📍 Planner page mounted, fetching tasks...')
    fetchTasks()
  }, [])

  // Also fetch when month changes
  useEffect(() => {
    console.log('📅 Month changed, fetching tasks for new month')
    fetchTasks()
  }, [currentMonth])

  // Watch for task state changes
  useEffect(() => {
    console.log('🔄 AllTasks state updated:', allTasks)
    console.log('📊 Total dates with tasks:', Object.keys(allTasks).length)
    console.log('📅 Today:', format(new Date(), 'yyyy-MM-dd'))
    console.log('📋 Tasks for today:', allTasks[format(new Date(), 'yyyy-MM-dd')])
  }, [allTasks])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const start = format(subMonths(currentMonth, 1), 'yyyy-MM-dd')
      const end = format(addMonths(currentMonth, 1), 'yyyy-MM-dd')
      
      console.log('📅 Fetching tasks from', start, 'to', end)
      
      const response = await plannerAPI.getTasks({
        startDate: start,
        endDate: end,
      })

      console.log('✅ Tasks received:', response)
      const tasks = response.tasks || []
      console.log('✅ Tasks array:', tasks.length, 'tasks')
      console.log('📊 Task data:', tasks)

      // Organize tasks by date (convert to YYYY-MM-DD string format in IST)
      const tasksByDate = {}
      tasks.forEach((task) => {
        // Format date as YYYY-MM-DD string, converting UTC to IST
        let dateKey
        if (task.due_date) {
          // Handle different date formats from backend
          if (task.due_date.includes('T')) {
            // ISO timestamp in UTC - convert to IST date
            dateKey = convertUTCToISTDateString(task.due_date)
          } else {
            // Already in YYYY-MM-DD format
            dateKey = task.due_date
          }
        } else {
          dateKey = format(new Date(), 'yyyy-MM-dd')
        }
        
        console.log('📅 Task:', task.title, '| Type:', task.task_type, '| Raw UTC date:', task.due_date, '| IST date:', dateKey)
        
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = []
        }
        tasksByDate[dateKey].push(task)
      })

      console.log('🗂️ Tasks organized by date:', tasksByDate)
      setAllTasks(tasksByDate)
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    console.log('🚀 handleAddTask called')
    console.log('📝 Current newTask state:', JSON.stringify(newTask, null, 2))
    console.log('✏️ Current editingTask:', editingTask)
    
    if (!newTask.title.trim()) {
      console.log('❌ Cannot add task: title is empty')
      alert('Please enter a task title')
      return
    }

    try {
      console.log('📝 Creating/Updating task with data:', {
        ...newTask,
        dueDate: newTask.dueDate,
        taskType: newTask.taskType,
        reminderTime: newTask.reminderTime,
        editingTask: editingTask?.id,
        isEditing: !!editingTask
      })
      
      // If editing, update existing task
      if (editingTask) {
        console.log('✏️ Updating task ID:', editingTask.id)
        console.log('📋 Original task:', JSON.stringify(editingTask, null, 2))
        console.log('📝 New data:', JSON.stringify(newTask, null, 2))
        
        const updateData = {
          title: newTask.title,
          description: newTask.description || '',
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          taskType: newTask.taskType,
          reminderTime: newTask.reminderTime || null,
          isImportant: newTask.isImportant,
        }
        
        console.log('📤 UPDATE REQUEST DATA:', JSON.stringify(updateData, null, 2))
        
        try {
          const response = await plannerAPI.updateTask(editingTask.id, updateData)
          console.log('✅ UPDATE RESPONSE:', JSON.stringify(response, null, 2))
          
          // Reset states
          setEditingTask(null)
          setShowAddModal(false)
          
          // Reset form
          setNewTask({ 
            title: '', 
            taskType: 'todo',
            priority: 'medium', 
            dueDate: format(selectedDate, 'yyyy-MM-dd'),
            reminderTime: '',
            isImportant: false,
            description: '',
            isCalendarTask: false,
          })
          
          // Refresh all tasks from backend to ensure sync
          console.log('🔄 Refreshing tasks from backend after update...')
          await fetchTasks()
          console.log('✅ Tasks refreshed after update!')
          
          // Exit early, don't continue to create flow
          return
        } catch (updateError) {
          console.error('❌ UPDATE ERROR:', updateError)
          console.error('❌ Error response:', updateError.response?.data)
          console.error('❌ Full error object:', JSON.stringify(updateError.response?.data, null, 2))
          const errorMsg = updateError.response?.data?.details || updateError.response?.data?.error || updateError.message
          alert(`Failed to update task: ${errorMsg}`)
          return
        }
      } else {
        // Creating new task
        const createData = {
          title: newTask.title,
          description: newTask.description || '',
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          taskType: newTask.taskType,
          reminderTime: newTask.reminderTime || null,
          isImportant: newTask.isImportant,
          notes: newTask.isCalendarTask ? 'calendar_task' : '', // Mark calendar tasks
        }
        
        console.log('📤 CREATE REQUEST DATA:', JSON.stringify(createData, null, 2))
        console.log('📅 Due date being sent:', createData.dueDate)
        
        try {
          const response = await plannerAPI.createTask(createData)
          console.log('✅ CREATE RESPONSE:', JSON.stringify(response, null, 2))
          
          const task = response.task
          console.log('📝 Created task:', task)
          console.log('📅 Task due_date:', task.due_date)
          
          // Get AI suggestions for this task (in background)
          if (newTask.title.length > 5) {
            fetchAISuggestions(task.id, newTask.title)
          }
        } catch (createError) {
          console.error('❌ CREATE ERROR:', createError)
          console.error('Error response:', createError.response?.data)
          alert(`Failed to create task: ${createError.response?.data?.error || createError.message}`)
          return
        }
      }

      // Reset form to today's date
      const today = format(new Date(), 'yyyy-MM-dd')
      console.log('🔄 Resetting form with today:', today)
      setNewTask({ 
        title: '', 
        taskType: 'todo',
        priority: 'medium', 
        dueDate: today,
        reminderTime: '',
        isImportant: false,
        description: '',
        isCalendarTask: false,
      })
      setShowAddModal(false)
      
      // Refresh all tasks from backend to ensure sync
      console.log('🔄 Refreshing tasks from backend after create...')
      await fetchTasks()
      
      console.log('✅ Task added and data refreshed!')
    } catch (error) {
      console.error('❌ Failed to add/update task:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        alert(`Failed to save task: ${error.response.data.error || 'Unknown error'}`)
      } else {
        alert('Failed to save task. Please check your connection.')
      }
    }
  }

  const fetchAISuggestions = async (taskId, taskTitle) => {
    try {
      setLoadingAI(true)
      const response = await aiAPI.getTaskSuggestions({ taskTitle })
      setAiSuggestions({ ...aiSuggestions, [taskId]: response.data })
    } catch (error) {
      console.log('ℹ️ AI suggestions not available (optional feature)')
      // Don't show error - AI is optional
    } finally {
      setLoadingAI(false)
    }
  }

  const handleToggleTask = async (taskId, dateKey) => {
    try {
      console.log('✅ Planner: Toggling task', taskId)
      
      // Update backend FIRST
      await plannerAPI.toggleTask(taskId)
      console.log('✅ Planner: Task toggled in backend successfully')
      
      // Immediately refetch to ensure consistency
      await fetchTasks()
      console.log('✅ Planner: Tasks refetched and state updated')
    } catch (error) {
      console.error('Failed to toggle task:', error)
      alert('Failed to update task. Please try again.')
      // Refetch on error to show correct state
      await fetchTasks()
    }
  }

  const handleDeleteTask = async (taskId, dateKey) => {
    if (!window.confirm('Delete this task?')) return

    try {
      console.log('🗑️ Deleting task:', taskId)
      await plannerAPI.deleteTask(taskId)
      console.log('✅ Task deleted successfully')
      
      // Refresh all tasks from backend to ensure sync
      await fetchTasks()
      
      setShowTaskDetail(null)
      console.log('✅ Task list refreshed')
    } catch (error) {
      console.error('❌ Failed to delete task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  const handleGetAISuggestions = async (task) => {
    try {
      setSelectedTaskForAI(task)
      setLoadingAI(true)
      setCurrentSuggestions(null)
      
      console.log('🤖 Fetching AI suggestions for:', task.title)
      
      const response = await aiAPI.getTaskSuggestions({
        taskTitle: task.title,
        taskType: task.task_type,
        priority: task.priority,
        description: task.description
      })
      
      console.log('✅ AI suggestions received:', response.data)
      setCurrentSuggestions(response.data.suggestions)
      
    } catch (error) {
      console.error('❌ Failed to get AI suggestions:', error)
      alert('Failed to generate suggestions. Please try again.')
    } finally {
      setLoadingAI(false)
    }
  }

  const handleUpdateTask = async (taskId, dateKey, updates) => {
    try {
      await plannerAPI.updateTask(taskId, updates)
      
      // Update local state
      const updatedTasks = allTasks[dateKey].map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
      setAllTasks({ ...allTasks, [dateKey]: updatedTasks })
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  // Get tasks for today
  const getTodayTasks = () => {
    const todayKey = format(new Date(), 'yyyy-MM-dd')
    const tasks = allTasks[todayKey] || []
    console.log('📅 Today key:', todayKey)
    console.log('📋 Today tasks:', tasks)
    console.log('🗂️ All task dates:', Object.keys(allTasks))
    return tasks
  }

  // Get tasks for this week
  const getWeekTasks = () => {
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 0 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))
    
    const weekTasksByDay = weekDays.map(day => ({
      date: day,
      dateKey: format(day, 'yyyy-MM-dd'),
      tasks: allTasks[format(day, 'yyyy-MM-dd')] || []
    }))
    
    return weekTasksByDay
  }

  return (
    <div className="space-y-6 pb-8 relative">
      {/* Decorative corner elements */}
      <img src="/design-elements/8.png" alt="" className="absolute top-0 right-0 w-44 h-44 opacity-100 animate-float z-20 pointer-events-none" />
      <img src="/design-elements/5.png" alt="" className="absolute top-24 left-0 w-40 h-40 opacity-100 animate-pulse-slow z-20 pointer-events-none" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/icons/23.png" alt="" className="w-8 h-8 scale-[10]" />
          <h1 className="text-4xl font-bold">
            <span className="font-cursive text-5xl">Planner</span>
          </h1>
        </div>
        <p className="text-lg text-muted-500 max-w-2xl mx-auto flex items-center justify-center gap-2">
          Organize your life with AI-powered insights 
          <img src="/icons/26.png" alt="" className="w-5 h-5 scale-[10] inline-block" />
        </p>
      </motion.div>

      {/* Main Content Section with Cute Tab Labels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        {/* Cute Label-Style Tabs */}
        <div className="flex justify-center mb-0 relative z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-2.5 rounded-t-2xl font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'today'
                  ? 'bg-white shadow-md text-ocean-700 transform scale-105 border-t-4 border-ocean-400'
                  : 'bg-white/40 text-muted-500 hover:bg-white/60 border-t-2 border-transparent hover:border-ocean-200'
              }`}
              style={{
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <Clock className="w-4 h-4" />
              <span>Today</span>
              {activeTab === 'today' && <span className="text-xs">✨</span>}
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`px-6 py-2.5 rounded-t-2xl font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'week'
                  ? 'bg-white shadow-md text-ocean-700 transform scale-105 border-t-4 border-purple-400'
                  : 'bg-white/40 text-muted-500 hover:bg-white/60 border-t-2 border-transparent hover:border-ocean-200'
              }`}
              style={{
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <Target className="w-4 h-4" />
              <span>This Week</span>
              {activeTab === 'week' && <span className="text-xs">🎯</span>}
            </button>
        </div>
        </div>

        {/* Unified Content Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-ocean-200 shadow-lg" style={{ borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem' }}>
      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
            <TodayView 
                key="today"
                tasks={getTodayTasks()}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
                onEditTask={(task) => {
                  setEditingTask(task)
                  
                  // Convert UTC timestamp to IST date string for editing
                  let dateForEdit = task.due_date
                  if (dateForEdit && dateForEdit.includes('T')) {
                    dateForEdit = convertUTCToISTDateString(dateForEdit)
                  }
                  
                  setNewTask({
                    title: task.title,
                    taskType: task.task_type || 'todo',
                    priority: task.priority || 'medium',
                    dueDate: dateForEdit,
                    reminderTime: task.reminder_time || '',
                    isImportant: task.is_important || false,
                    description: task.description || '',
                    isCalendarTask: task.notes?.includes('calendar_task') || false,
                  })
                  setShowAddModal(true)
                }}
                onAddTask={(taskType = 'todo') => {
                  const today = format(new Date(), 'yyyy-MM-dd')
                  console.log('📅 Opening add task modal for TODAY:', today, 'Type:', taskType)
                  setNewTask({ 
                    title: '',
                    taskType: taskType,
                    priority: 'medium',
                    dueDate: today,
                    reminderTime: '',
                    isImportant: false,
                    description: '',
                    isCalendarTask: false,
                  })
                  setShowAddModal(true)
                }}
                onTaskClick={(task) => setShowTaskDetail(task)}
                aiSuggestions={aiSuggestions}
              />
        )}

        {activeTab === 'week' && (
            <WeekView 
                key="week"
                weekTasks={getWeekTasks()}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
                onEditTask={(task) => {
                  setEditingTask(task)
                  
                  // Convert UTC timestamp to IST date string for editing
                  let dateForEdit = task.due_date
                  if (dateForEdit && dateForEdit.includes('T')) {
                    dateForEdit = convertUTCToISTDateString(dateForEdit)
                  }
                  
                  setNewTask({
                    title: task.title,
                    taskType: task.task_type || 'todo',
                    priority: task.priority || 'medium',
                    dueDate: dateForEdit,
                    reminderTime: task.reminder_time || '',
                    isImportant: task.is_important || false,
                    description: task.description || '',
                    isCalendarTask: task.notes?.includes('calendar_task') || false,
                  })
                  setShowAddModal(true)
                }}
                onAddTask={(date, taskType = 'todo') => {
                  setNewTask({ ...newTask, dueDate: format(date, 'yyyy-MM-dd'), taskType })
                  setShowAddModal(true)
                }}
                onTaskClick={(task) => setShowTaskDetail(task)}
                aiSuggestions={aiSuggestions}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Schedule & Planning Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-ocean-800 mb-2">
            <span className="font-handwriting text-3xl">Calendar</span>
          </h2>
          <p className="text-sm text-muted-500">Schedule tasks for specific dates 📅</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar - 2/3 width */}
          <div className="lg:col-span-2">
            <FullCalendar 
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              allTasks={allTasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={(date) => {
                setNewTask({ ...newTask, dueDate: format(date, 'yyyy-MM-dd'), isCalendarTask: true })
                setShowAddModal(true)
              }}
              onTaskClick={(task) => setShowTaskDetail(task)}
              onEditTask={(task) => {
                setEditingTask(task)
                
                // Convert UTC timestamp to IST date string for editing
                let dateForEdit = task.due_date
                if (dateForEdit && dateForEdit.includes('T')) {
                  dateForEdit = convertUTCToISTDateString(dateForEdit)
                }
                
                setNewTask({
                  title: task.title,
                  taskType: task.task_type || 'todo',
                  priority: task.priority || 'medium',
                  dueDate: dateForEdit,
                  reminderTime: task.reminder_time || '',
                  isImportant: task.is_important || false,
                  description: task.description || '',
                  isCalendarTask: task.is_calendar_task || false,
                })
                setShowAddModal(true)
              }}
            />
          </div>
          
          {/* Selected Date Tasks - 1/3 width */}
          <div className="lg:col-span-1">
            <SelectedDatePanel
              selectedDate={selectedDate}
              tasks={allTasks[format(selectedDate, 'yyyy-MM-dd')] || []}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onTaskClick={(task) => setShowTaskDetail(task)}
              onEditTask={(task) => {
                setEditingTask(task)
                
                // Convert UTC timestamp to IST date string for editing
                let dateForEdit = task.due_date
                if (dateForEdit && dateForEdit.includes('T')) {
                  dateForEdit = convertUTCToISTDateString(dateForEdit)
                }
                
                setNewTask({
                  title: task.title,
                  taskType: task.task_type || 'todo',
                  priority: task.priority || 'medium',
                  dueDate: dateForEdit,
                  reminderTime: task.reminder_time || '',
                  isImportant: task.is_important || false,
                  description: task.description || '',
                  isCalendarTask: task.is_calendar_task || false,
                })
                setShowAddModal(true)
              }}
              onAddTask={() => {
                setNewTask({ ...newTask, dueDate: format(selectedDate, 'yyyy-MM-dd'), isCalendarTask: true })
                setShowAddModal(true)
              }}
              aiSuggestions={aiSuggestions}
            />
          </div>
        </div>
          </motion.div>

      {/* AI Suggestions Section */}
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-ocean-800 mb-2">
            <span className="font-handwriting text-3xl">Naia's Insights 🐬</span> ✨
          </h2>
          <p className="text-sm text-muted-500">Select a task to get personalized guidance from your Inner Compass</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Task Selection Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-ocean-200">
            <h3 className="text-lg font-bold text-ocean-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-ocean-500" />
              Select a Task
            </h3>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {(() => {
                const allPendingTasks = Object.entries(allTasks).flatMap(([date, tasks]) => 
                  tasks.filter(t => !t.completed)
                )
                return allPendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No pending tasks yet!</p>
                    <p className="text-xs mt-1">Add some tasks to get insights from your Inner Compass</p>
                  </div>
                ) : (
                  allPendingTasks.slice(0, 15).map(task => (
                    <motion.button
                      key={task.id}
                      onClick={() => handleGetAISuggestions(task)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTaskForAI?.id === task.id
                          ? 'bg-gradient-to-r from-ocean-100 to-teal-100 border-ocean-400 shadow-md'
                          : 'bg-white hover:bg-ocean-50 border-ocean-200 hover:border-ocean-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-ocean-900">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-500">
                              {format(new Date(task.due_date), 'MMM d')}
                            </span>
                            {task.task_type && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                task.task_type === 'goal' ? 'bg-purple-100 text-purple-700' :
                                task.task_type === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {task.task_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <Sparkles className={`w-4 h-4 flex-shrink-0 ${
                          selectedTaskForAI?.id === task.id ? 'text-ocean-600' : 'text-muted-400'
                        }`} />
                      </div>
                    </motion.button>
                  ))
                )
              })()}
            </div>
          </div>

          {/* Suggestions Display Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-ocean-200">
            <h3 className="text-lg font-bold text-ocean-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Inner Compass Guidance
            </h3>

            {loadingAI ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner />
                <p className="text-sm text-muted-500 mt-4">Generating suggestions...</p>
              </div>
            ) : !selectedTaskForAI ? (
              <div className="text-center py-12 text-muted-400">
                <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a task to see suggestions</p>
                <p className="text-xs mt-1">AI will help you complete it faster!</p>
              </div>
            ) : currentSuggestions && currentSuggestions.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="mb-4 p-3 bg-gradient-to-r from-ocean-50 to-teal-50 rounded-lg border border-ocean-200">
                  <p className="text-sm font-medium text-ocean-900">
                    Suggestions for: <span className="font-bold">{selectedTaskForAI.title}</span>
                  </p>
                </div>

                {currentSuggestions.map((suggestion, index) => (
            <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-br from-white to-ocean-50/50 rounded-lg border border-ocean-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        suggestion.type === 'link' ? 'bg-blue-100 text-blue-600' :
                        suggestion.type === 'tip' ? 'bg-green-100 text-green-600' :
                        suggestion.type === 'tool' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {suggestion.type === 'link' ? '🔗' :
                         suggestion.type === 'tip' ? '💡' :
                         suggestion.type === 'tool' ? '🔧' :
                         '📚'}
              </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-ocean-900 mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-muted-600 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-ocean-700">
                            Action: {suggestion.action}
                          </span>
                          {suggestion.link && (
                            <a
                              href={suggestion.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-ocean-500 hover:text-ocean-700 underline"
                            >
                              Open →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-400">
                <p>No suggestions available</p>
                <p className="text-xs mt-1">Try selecting a different task</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTaskModal
            newTask={newTask}
            setNewTask={setNewTask}
            onAdd={handleAddTask}
            onClose={() => {
              setShowAddModal(false)
              setEditingTask(null)
              setNewTask({
                title: '', 
                taskType: 'todo',
                priority: 'medium', 
                dueDate: format(new Date(), 'yyyy-MM-dd'),
                reminderTime: '',
                isImportant: false,
                description: '',
                isCalendarTask: false,
              })
            }}
            isEditing={!!editingTask}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {showTaskDetail && (
          <TaskDetailModal
            task={showTaskDetail}
            onClose={() => setShowTaskDetail(null)}
            onDelete={() => handleDeleteTask(showTaskDetail.id, showTaskDetail.due_date)}
            onToggle={() => handleToggleTask(showTaskDetail.id, showTaskDetail.due_date)}
            aiSuggestion={aiSuggestions[showTaskDetail.id]}
            onUpdate={(updates) => handleUpdateTask(showTaskDetail.id, showTaskDetail.due_date, updates)}
          />
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner />
                </div>
      )}
    </div>
  )
}

// ===== TODAY VIEW COMPONENT =====
const TodayView = ({ tasks, onToggleTask, onDeleteTask, onEditTask, onAddTask, onTaskClick, aiSuggestions }) => {
  const today = new Date()
  const todayKey = format(today, 'yyyy-MM-dd')
  const todayFormatted = format(today, 'EEEE, MMMM do, yyyy')
  
  // Filter OUT calendar tasks - only show regular tasks
  const regularTasks = tasks.filter(t => !t.notes?.includes('calendar_task'))
  
  const todos = regularTasks.filter(t => t.task_type === 'todo' || !t.task_type)
  const goals = regularTasks.filter(t => t.task_type === 'goal')
  const reminders = regularTasks.filter(t => t.task_type === 'reminder')
  const important = regularTasks.filter(t => t.is_important)

  console.log('👀 TodayView rendering with', tasks.length, 'tasks')
  console.log('📊 Breakdown - todos:', todos.length, 'goals:', goals.length, 'reminders:', reminders.length, 'important:', important.length)

  return (
          <motion.div
      key="today"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Today's Date Header */}
      <div className="text-center pb-2 border-b border-ocean-200">
        <h3 className="text-2xl font-bold text-ocean-800">{todayFormatted}</h3>
        <p className="text-sm text-muted-500 mt-1">Your tasks for today ✨</p>
                </div>

      {/* Tasks Grid */}
      <div className="grid md:grid-cols-2 gap-4"
    >
      {/* To-Do List */}
      <div className="bg-gradient-to-br from-blue-50/50 to-ocean-50/50 rounded-2xl p-5 border border-blue-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Check className="w-5 h-5 text-blue-600" />
            </div>
                <div>
              <h3 className="text-lg font-semibold text-ocean-800">To-Do List</h3>
              <p className="text-xs text-muted-500">{todos.filter(t => !t.completed).length} pending</p>
            </div>
          </div>
          <button
            onClick={() => onAddTask('todo')}
            className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
            title="Add to-do"
          >
            <Plus className="w-5 h-5 text-ocean-600" />
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {todos.length > 0 ? (
            todos.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id, todayKey)}
                onClick={() => onTaskClick(task)}
                onDelete={() => onDeleteTask(task.id, todayKey)}
                onEdit={() => onEditTask(task)}
                hasAI={!!aiSuggestions[task.id]}
              />
            ))
          ) : (
            <EmptyState icon="📝" message="No tasks yet" />
          )}
                </div>
              </div>

      {/* Goals for the Day */}
      <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-2xl p-5 border border-purple-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
                <div>
              <h3 className="text-lg font-semibold text-ocean-800">Goals for Today</h3>
              <p className="text-xs text-muted-500">{goals.filter(t => !t.completed).length} to achieve</p>
            </div>
          </div>
                <button
            onClick={() => onAddTask('goal')}
            className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
            title="Add goal"
                >
            <Plus className="w-5 h-5 text-ocean-600" />
                </button>
                </div>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {goals.length > 0 ? (
            goals.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id, todayKey)}
                onClick={() => onTaskClick(task)}
                onDelete={() => onDeleteTask(task.id, todayKey)}
                onEdit={() => onEditTask(task)}
                hasAI={!!aiSuggestions[task.id]}
                isGoal
              />
            ))
          ) : (
            <EmptyState icon="🎯" message="No goals set" />
          )}
                </div>
              </div>

      {/* Reminders */}
      <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 rounded-2xl p-5 border border-amber-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ocean-800">Reminders</h3>
              <p className="text-xs text-muted-500">{reminders.length} set</p>
            </div>
          </div>
                <button
            onClick={() => onAddTask('reminder')}
            className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
            title="Add reminder"
          >
            <Plus className="w-5 h-5 text-ocean-600" />
                </button>
              </div>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {reminders.length > 0 ? (
            reminders.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id, todayKey)}
                onClick={() => onTaskClick(task)}
                onDelete={() => onDeleteTask(task.id, todayKey)}
                onEdit={() => onEditTask(task)}
                hasAI={!!aiSuggestions[task.id]}
                showTime
              />
            ))
          ) : (
            <EmptyState icon="🔔" message="No reminders" />
          )}
    </div>
      </div>

      {/* Important Tasks */}
      <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-2xl p-5 border border-rose-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Star className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ocean-800">Important</h3>
              <p className="text-xs text-muted-500">Priority items</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {important.length > 0 ? (
            important.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id, todayKey)}
                onClick={() => onTaskClick(task)}
                hasAI={!!aiSuggestions[task.id]}
              />
            ))
          ) : (
            <EmptyState icon="⭐" message="No important tasks" />
          )}
        </div>
      </div>
      </div>
    </motion.div>
  )
}

// ===== WEEK VIEW COMPONENT =====
const WeekView = ({ weekTasks, onToggleTask, onDeleteTask, onEditTask, onAddTask, onTaskClick, aiSuggestions }) => {
  const [expandedDay, setExpandedDay] = useState(null)
  
  console.log('📆 WeekView rendering with', weekTasks.length, 'days of tasks')
  
  // Filter OUT calendar tasks from each day - only show regular tasks
  const regularWeekTasks = weekTasks.map(day => ({
    ...day,
    tasks: day.tasks.filter(t => !t.notes?.includes('calendar_task'))
  }))
  
  // Get ONLY weekly goals (not today's goals) - goals due this week but NOT today
  const today = new Date()
  const todayKey = format(today, 'yyyy-MM-dd')
  const weeklyGoals = regularWeekTasks
    .map(day => day.tasks.filter(t => t.task_type === 'goal' && day.dateKey !== todayKey))
    .flat()
    .slice(0, 6) // Show max 6 goals
  
  return (
    <motion.div
      key="week"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Weekly Goals Section - Separate from Today's Goals */}
      <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-2xl p-5 border border-purple-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
          </div>
            <div>
              <h3 className="text-xl font-bold text-ocean-800">Weekly Goals</h3>
              <p className="text-sm text-muted-500">Goals for the week (not today)</p>
            </div>
          </div>
          <button
            onClick={() => {
              // Get tomorrow's date (first day of the week)
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              onAddTask(tomorrow, 'goal')
            }}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {weeklyGoals.length > 0 ? (
            weeklyGoals.map(goal => (
              <div
                key={goal.id}
                onClick={() => onTaskClick(goal)}
                className="bg-white/70 p-4 rounded-xl border border-purple-200 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleTask(goal.id, goal.due_date)
                    }}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      goal.completed ? 'bg-purple-500 border-purple-500' : 'border-purple-300 hover:border-purple-500'
                    }`}
                  >
                    {goal.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1">
                    <p className={`font-medium text-sm ${goal.completed ? 'line-through text-muted-500' : 'text-ocean-800'}`}>
                      {goal.title}
                    </p>
                    <p className="text-xs text-muted-500 mt-1">Due: {format(new Date(goal.due_date), 'MMM d')}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditTask(goal)
                      }}
                      className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteTask(goal.id, goal.due_date)
                      }}
                      className="p-1 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
          </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-muted-500">
              <p>No weekly goals set</p>
              <p className="text-xs mt-1">Add goals for this week!</p>
          </div>
        )}
      </div>
    </div>

      {/* Day-by-Day View - Clean & Clickable */}
      <div className="bg-gradient-to-br from-ocean-50/30 to-teal-50/30 rounded-2xl p-5 border border-ocean-200/50">
        <h3 className="text-xl font-bold text-ocean-800 mb-6 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-ocean-600" />
          This Week's Schedule
        </h3>
        
        <div className="grid md:grid-cols-7 gap-3">
          {regularWeekTasks.map(({ date, dateKey, tasks }) => {
            const dayIsToday = isToday(date)
            const isPast = date < new Date() && !dayIsToday
            const isExpanded = expandedDay === dateKey
            
            // Filter out goals - they're in weekly goals section
            const dayTasks = tasks.filter(t => t.task_type !== 'goal')
            
            return (
              <div
                key={dateKey}
                onClick={() => setExpandedDay(isExpanded ? null : dateKey)}
                className={`rounded-xl p-3 border transition-all cursor-pointer ${
                  dayIsToday
                    ? 'bg-gradient-to-br from-ocean-100 to-teal-100 border-ocean-300 ring-2 ring-ocean-400'
                    : isPast
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-white border-ocean-200 hover:shadow-md hover:scale-105'
                }`}
              >
                {/* Day Header - Compact */}
                <div className="text-center">
                  <p className={`text-[10px] font-medium uppercase ${dayIsToday ? 'text-ocean-700' : 'text-muted-500'}`}>
                    {format(date, 'EEE')}
                  </p>
                  <p className={`text-xl font-bold ${dayIsToday ? 'text-ocean-800' : 'text-ocean-700'}`}>
                    {format(date, 'd')}
                  </p>
                  {dayIsToday && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-ocean-500 text-white text-[9px] rounded-full">
                      Today
                    </span>
                  )}
                  
                  {/* Task Count Badge - Compact */}
                  {dayTasks.length > 0 && (
                    <div className="mt-2">
                      <span className="inline-block px-1.5 py-0.5 bg-ocean-500 text-white text-[10px] rounded-full font-medium">
                        {dayTasks.length}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Expanded Tasks View - Scrollable */}
                {isExpanded && dayTasks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, maxHeight: 0 }}
                    animate={{ opacity: 1, maxHeight: '300px' }}
                    exit={{ opacity: 0, maxHeight: 0 }}
                    className="mt-3 pt-3 border-t border-ocean-200 space-y-2 overflow-y-auto custom-scrollbar"
                    style={{ maxHeight: '300px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {dayTasks.map((task) => (
                    <div
                      key={task.id}
                        onClick={() => onTaskClick(task)}
                        className="p-2 bg-white/70 rounded-lg border border-ocean-200 cursor-pointer hover:shadow-sm transition-all group text-xs"
                    >
                        <div className="flex items-start gap-2">
                        <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleTask(task.id, dateKey)
                            }}
                            className={`mt-0.5 w-3 h-3 rounded-full border flex-shrink-0 ${
                            task.completed ? 'bg-ocean-500 border-ocean-500' : 'border-ocean-300'
                          }`}
                        >
                          {task.completed && <Check className="w-2 h-2 text-white" />}
                        </button>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${task.completed ? 'line-through text-muted-500' : 'text-ocean-800'}`}>
                          {task.title}
                            </p>
                            {task.reminder_time && (
                              <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-1">
                                <Bell className="w-2.5 h-2.5" />
                                {formatTime12Hour(task.reminder_time)}
                              </p>
                            )}
                          </div>
                      </div>
                    </div>
                  ))}
                  </motion.div>
                  )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ===== FULL CALENDAR COMPONENT =====
const FullCalendar = ({ currentMonth, setCurrentMonth, selectedDate, setSelectedDate, allTasks, onToggleTask, onDeleteTask, onAddTask, onTaskClick, onEditTask }) => {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const daysInCalendar = eachDayOfInterval({ start: startDate, end: endDate })
  
  return (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-ocean-200 shadow-sm"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-ocean-800 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-ocean-600" />
              Full Calendar
            </h3>
            <p className="text-sm text-muted-500 mt-1">Plan ahead and manage your schedule</p>
        </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-ocean-600" />
            </button>
            
            <div className="text-center min-w-[180px]">
              <p className="text-lg font-bold text-ocean-800">
                {format(currentMonth, 'MMMM yyyy')}
              </p>
            </div>
            
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-5 h-5 text-ocean-600" />
            </button>
            
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="ml-2 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-100 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
          </div>
        </div>

        {/* Calendar Grid */}
      <div className="border border-ocean-200 rounded-xl overflow-hidden">
          {/* Day headers */}
        <div className="grid grid-cols-7 bg-ocean-50 border-b border-ocean-200">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-ocean-700 border-r border-ocean-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

          {/* Calendar days */}
        <div className="grid grid-cols-7">
          {daysInCalendar.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const allDayTasks = allTasks[dateKey] || []
            // Only show calendar tasks on calendar view
            const dayTasks = allDayTasks.filter(t => t.notes?.includes('calendar_task'))
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentDay = isToday(day)
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth()

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[120px] p-3 border-r border-b border-ocean-200 last:border-r-0 cursor-pointer transition-all hover:bg-ocean-50 ${
                  !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                } ${isSelected ? 'ring-2 ring-ocean-400 ring-inset bg-ocean-50' : ''}`}
              >
                {/* Date */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${
                    isCurrentDay
                      ? 'bg-ocean-500 text-white w-7 h-7 rounded-full flex items-center justify-center'
                      : !isCurrentMonth
                      ? 'text-muted-400'
                      : 'text-ocean-800'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-ocean-200 text-ocean-700 rounded-full">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Tasks preview */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskClick(task)
                      }}
                      className={`text-[10px] px-2 py-1 rounded truncate transition-all hover:shadow-sm ${
                        task.completed
                          ? 'bg-gray-200 text-gray-600 line-through'
                          : task.priority === 'high'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : task.priority === 'low'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}
                      title={task.title}
                    >
                      <div className="flex items-center gap-1">
                        {task.task_type === 'goal' && <Target className="w-2.5 h-2.5 flex-shrink-0" />}
                        {task.task_type === 'reminder' && <Bell className="w-2.5 h-2.5 flex-shrink-0" />}
                        {task.is_important && <Star className="w-2.5 h-2.5 flex-shrink-0" />}
                        <span className="truncate">{task.title}</span>
                    </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="text-[9px] text-muted-500 text-center">+{dayTasks.length - 3}</p>
                  )}
                </div>

                {/* Add button */}
                {isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddTask(day)
                    }}
                    className="w-full mt-2 py-1 text-[10px] text-ocean-600 hover:bg-ocean-100 rounded transition-colors flex items-center justify-center gap-1 opacity-0 hover:opacity-100"
                  >
                    <Plus className="w-3 h-3" />
                    Add
              </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-3 h-3 text-rose-500" />
          <span>Important</span>
        </div>
      </div>
    </motion.div>
  )
}

// ===== TASK CARD COMPONENT =====
const TaskCard = ({ task, onToggle, onClick, onDelete, onEdit, hasAI, isGoal, showTime }) => {
  return (
              <motion.div
      initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer group relative
        ${task.is_important 
          ? 'border-2 border-rose-500 bg-gradient-to-br from-rose-50/80 to-pink-50/80 shadow-md' 
          : 'border border-ocean-200 bg-white/70'
        } hover:shadow-md`}
              >
                <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={`mt-0.5 w-5 h-5 rounded-${isGoal ? 'full' : 'md'} border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          task.completed
            ? 'bg-ocean-500 border-ocean-500'
            : 'border-ocean-300 hover:border-ocean-500'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-medium text-sm ${task.completed ? 'line-through text-muted-500' : 'text-ocean-800'}`}>
                    {task.title}
                  </p>
          {task.is_important && <Star className="w-3 h-3 text-rose-500 fill-rose-500 flex-shrink-0" />}
          {hasAI && (
            <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" title="AI suggestions available" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {showTime && task.reminder_time && (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs px-2.5 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full flex items-center gap-1.5 border border-amber-300 font-semibold shadow-sm"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>🔔 {formatTime12Hour(task.reminder_time)}</span>
            </motion.span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
            task.priority === 'low' ? 'bg-green-100 text-green-700' :
            'bg-yellow-100 text-yellow-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

      {/* Delete and Edit buttons - show on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
                <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
                </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
              </motion.div>
  )
}

// ===== EMPTY STATE COMPONENT =====
const EmptyState = ({ icon, message }) => (
  <div className="text-center py-8">
    <div className="text-4xl mb-2">{icon}</div>
    <p className="text-sm text-muted-500">{message}</p>
  </div>
)

// ===== ADD TASK MODAL =====
const AddTaskModal = ({ newTask, setNewTask, onAdd, onClose, isEditing }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-ocean-200 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-ocean-800">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ocean-800 mb-2">Task Title*</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all"
              autoFocus
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-ocean-800 mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'todo', label: 'To-Do', icon: Check },
                { value: 'goal', label: 'Goal', icon: Target },
                { value: 'reminder', label: 'Reminder', icon: Bell },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setNewTask({ ...newTask, taskType: type.value })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    newTask.taskType === type.value
                      ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                      : 'border-ocean-200 hover:border-ocean-300'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
            ))}
          </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">Due Date*</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all"
              />
            </div>
            
            {/* Reminder Time - Prominent Design */}
            {newTask.taskType === 'reminder' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-900">Reminder Time</label>
                    <p className="text-xs text-amber-600">Set when you want to be reminded</p>
                  </div>
                </div>
                <input
                  type="time"
                  value={newTask.reminderTime}
                  onChange={(e) => setNewTask({ ...newTask, reminderTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all bg-white text-lg font-medium text-ocean-800"
                  placeholder="HH:MM"
                />
                {newTask.reminderTime && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span>You'll be reminded at {formatTime12Hour(newTask.reminderTime)}</span>
          </div>
        )}
              </motion.div>
            )}
          </div>

          {/* Priority and Important */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-2">Mark Important</label>
        <button
                onClick={() => setNewTask({ ...newTask, isImportant: !newTask.isImportant })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  newTask.isImportant
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-ocean-200 hover:border-ocean-300'
                }`}
              >
                <Star className={`w-4 h-4 ${newTask.isImportant ? 'fill-rose-500' : ''}`} />
                {newTask.isImportant ? 'Important' : 'Not Important'}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ocean-800 mb-2">Description (optional)</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-muted-500 hover:text-ocean-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!newTask.title.trim()}
            className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isEditing ? (
            <>
              <Edit2 className="w-4 h-4" />
              Update Task
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Task
            </>
          )}
        </button>
    </div>
      </motion.div>
    </motion.div>
  )
}

// ===== TASK DETAIL MODAL =====
const TaskDetailModal = ({ task, onClose, onDelete, onToggle, aiSuggestion, onUpdate }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-ocean-200 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onToggle}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  task.completed
                    ? 'bg-ocean-500 border-ocean-500'
                    : 'border-ocean-300 hover:border-ocean-500'
                }`}
              >
                {task.completed && <Check className="w-4 h-4 text-white" />}
              </button>
              <h3 className={`text-2xl font-bold ${task.completed ? 'line-through text-muted-500' : 'text-ocean-800'}`}>
                {task.title}
              </h3>
              {task.is_important && <Star className="w-6 h-6 text-rose-500 fill-rose-500" />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Details */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              task.task_type === 'todo' ? 'bg-blue-100 text-blue-700' :
              task.task_type === 'goal' ? 'bg-purple-100 text-purple-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {task.task_type === 'todo' ? '📝 To-Do' :
               task.task_type === 'goal' ? '🎯 Goal' :
               '🔔 Reminder'}
            </span>
            
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              task.priority === 'high' ? 'bg-red-100 text-red-700' :
              task.priority === 'low' ? 'bg-green-100 text-green-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              <Flag className="w-4 h-4 inline mr-1" />
              {task.priority} priority
            </span>
            
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-ocean-100 text-ocean-700">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
            
            {task.reminder_time && (
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 text-amber-700">
                <Clock className="w-4 h-4 inline mr-1" />
                {formatTime12Hour(task.reminder_time)}
              </span>
            )}
          </div>

          {task.description && (
            <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200">
              <p className="text-sm text-ocean-800 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        {aiSuggestion && (
          <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">AI Suggestions</h4>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              {aiSuggestion.tips && aiSuggestion.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <p>{tip}</p>
                </div>
              ))}
              {aiSuggestion.timeEstimate && (
                <p className="text-xs text-purple-600 mt-2">
                  ⏱️ Estimated time: {aiSuggestion.timeEstimate}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn-gradient"
          >
            Close
          </button>
        </div>

        {/* Task Info */}
        <div className="mt-4 pt-4 border-t border-ocean-200 flex items-center justify-between text-xs text-muted-500">
          <span>Created: {format(new Date(task.created_at), 'MMM d, h:mm a')}</span>
          {task.updated_at !== task.created_at && (
            <span>Updated: {format(new Date(task.updated_at), 'MMM d, h:mm a')}</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Planner
