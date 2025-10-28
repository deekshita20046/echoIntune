import { useEffect, useRef, useState } from 'react'
import NotificationService from '../utils/notifications'
import { plannerAPI } from '../utils/api'
import { getISTDateString, getISTTime, isISTTimeMatch, logISTTime } from '../utils/timezone'

const ReminderChecker = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const notifiedReminders = useRef(new Set()) // Track which reminders we've already notified
  const checkInterval = useRef(null)

  // Check notification permission on mount
  useEffect(() => {
    console.log('🔔 ReminderChecker component mounted!')
    console.log('🌐 Notification API available:', 'Notification' in window)
    
    const checkPermission = async () => {
      if ('Notification' in window) {
        console.log('🔐 Current notification permission:', Notification.permission)
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true)
          console.log('✅ Notifications already enabled')
        } else if (Notification.permission === 'default') {
          // Automatically request permission
          console.log('❓ Requesting notification permission...')
          const granted = await NotificationService.requestPermission()
          setNotificationsEnabled(granted)
          if (granted) {
            console.log('✅ User granted notification permission')
          } else {
            console.log('❌ User denied notification permission - will use alerts')
          }
        } else {
          console.log('❌ Notifications blocked by user - will use alerts as fallback')
        }
      } else {
        console.log('❌ Notification API not available - will use alerts')
      }
    }
    
    checkPermission()
  }, [])

  // Check for reminders that need to be triggered
  const checkReminders = async () => {
    try {
      // Use IST timezone
      const todayDate = getISTDateString()
      const currentTime = getISTTime()
      
      console.log('🇮🇳 ⏰ Checking reminders at IST:', currentTime, 'for date', todayDate)
      logISTTime()

      // Fetch today's tasks
      const response = await plannerAPI.getTasks()
      const tasks = response.tasks || []
      
      console.log('📋 Total tasks fetched:', tasks.length)
      
      // Filter for reminders with time set
      const allReminders = tasks.filter(task => task.reminder_time && task.task_type === 'reminder')
      console.log('🔔 Total reminders found:', allReminders.length, allReminders.map(t => ({ title: t.title, time: t.reminder_time, date: t.due_date })))
      
      // Filter for reminders due today
      const todayReminders = allReminders.filter(task => {
        if (task.completed) return false
        
        // Parse due_date properly handling timezone
        let taskDateStr
        if (task.due_date.includes('T')) {
          // Full timestamp - extract date part
          const taskDate = new Date(task.due_date)
          const taskYear = taskDate.getFullYear()
          const taskMonth = String(taskDate.getMonth() + 1).padStart(2, '0')
          const taskDay = String(taskDate.getDate()).padStart(2, '0')
          taskDateStr = `${taskYear}-${taskMonth}-${taskDay}`
        } else {
          // Already in YYYY-MM-DD format
          taskDateStr = task.due_date
        }
        
        console.log('📅 Comparing:', taskDateStr, 'with today:', todayDate, 'match:', taskDateStr === todayDate)
        return taskDateStr === todayDate
      })
      
      console.log('📅 Today\'s reminders:', todayReminders.length, todayReminders.map(t => ({ title: t.title, time: t.reminder_time })))

      // Check each reminder
      todayReminders.forEach(task => {
        // Strip seconds from reminder time if present (16:30:00 -> 16:30)
        const reminderTime = task.reminder_time ? task.reminder_time.substring(0, 5) : ''
        const reminderKey = `${task.id}-${reminderTime}-${todayDate}`
        
        console.log('🔍 Checking reminder:', task.title, 'time:', reminderTime, 'current:', currentTime)
        
        // Skip if we've already notified for this reminder
        if (notifiedReminders.current.has(reminderKey)) {
          console.log('⏭️ Already notified for:', task.title)
          return
        }

        // Check if reminder time has arrived (using IST)
        if (isISTTimeMatch(reminderTime)) {
          console.log('🔔 🔔 🔔 IST REMINDER TIME ARRIVED! 🔔 🔔 🔔')
          console.log('Task:', task.title, 'Time:', reminderTime)
          console.log('Current IST Time:', currentTime)
          
          // Always play sound first
          NotificationService.playNotificationSound()
          
          // Try browser notification
          if (notificationsEnabled && Notification.permission === 'granted') {
            console.log('📱 Showing browser notification...')
            NotificationService.showReminder(task)
            // Also show alert for better visibility
            setTimeout(() => {
              alert(`🔔 REMINDER!\n\n${task.title}\n\nTime: ${reminderTime}${task.description ? '\n\n' + task.description : ''}`)
            }, 100)
          } else {
            console.log('⚠️ Browser notifications not available, using alert')
            // ALWAYS show alert as backup
            setTimeout(() => {
              alert(`🔔 REMINDER!\n\n${task.title}\n\nTime: ${reminderTime}${task.description ? '\n\n' + task.description : ''}`)
            }, 100)
          }
          
          // Mark as notified
          notifiedReminders.current.add(reminderKey)
          console.log('✅ Reminder notification complete')
          
          // Clean up old entries (keep only last 100)
          if (notifiedReminders.current.size > 100) {
            const entries = Array.from(notifiedReminders.current)
            entries.slice(0, 50).forEach(key => notifiedReminders.current.delete(key))
          }
        }
      })
    } catch (error) {
      console.error('Error checking reminders:', error)
    }
  }

  // Set up interval to check reminders every 10 seconds (more frequent)
  useEffect(() => {
    console.log('🚀 ReminderChecker STARTED - Will check every 10 seconds')
    console.log('📊 Notifications enabled:', notificationsEnabled)
    
    // Check immediately
    checkReminders()
    
    // Then check every 10 seconds (faster than 30s)
    checkInterval.current = setInterval(() => {
      console.log('⏰ 10-second interval triggered')
      checkReminders()
    }, 10000)
    
    console.log('✅ Interval set up successfully')
    
    return () => {
      if (checkInterval.current) {
        console.log('🛑 ReminderChecker stopped')
        clearInterval(checkInterval.current)
      }
    }
  }, [notificationsEnabled])

  // Clear notified reminders at midnight (new day)
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        console.log('🌙 New day - clearing notified reminders')
        notifiedReminders.current.clear()
      }
    }

    const midnightInterval = setInterval(checkMidnight, 60000) // Check every minute
    
    return () => clearInterval(midnightInterval)
  }, [])

  return null // Component runs in background, no UI needed
}

export default ReminderChecker

