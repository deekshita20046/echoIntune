// Browser Notification Utility for Reminders
import { useState } from 'react'

export const NotificationService = {
  // Request permission for browser notifications
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  },

  // Show a notification
  show(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return null
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'reminder',
        renotify: true,
        requireInteraction: true, // Keep notification visible until user interacts
        ...options
      })

      // Play sound
      this.playNotificationSound()

      return notification
    }

    return null
  },

  // Play notification sound
  playNotificationSound() {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Create oscillator (generates tone)
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Set frequency (higher = higher pitch)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      // Fade in/out for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)
      
      // Play
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)

      // Play again after a short delay for double beep
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()
        
        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)
        
        oscillator2.frequency.value = 1000
        oscillator2.type = 'sine'
        
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1)
        gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)
        
        oscillator2.start(audioContext.currentTime)
        oscillator2.stop(audioContext.currentTime + 0.5)
      }, 200)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  },

  // Check if a reminder time has arrived
  isReminderTime(reminderTime) {
    if (!reminderTime) {
      console.log('❌ No reminder time provided')
      return false
    }

    const now = new Date()
    const [hours, minutes] = reminderTime.split(':').map(Number)
    
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    
    const match = currentHours === hours && currentMinutes === minutes
    
    if (match) {
      console.log('✅ TIME MATCH!', { reminderTime, currentHours, currentMinutes })
    }
    
    // Check if current time matches reminder time (within the same minute)
    return match
  },

  // Format time for display
  formatTime(time) {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
    return `${displayHour}:${minutes} ${ampm}`
  },

  // Show reminder notification
  showReminder(task) {
    const timeFormatted = this.formatTime(task.reminder_time)
    
    const notification = this.show('⏰ Reminder!', {
      body: `${task.title}\n\nScheduled for: ${timeFormatted}`,
      icon: '/icon-192.png',
      data: { taskId: task.id }
    })

    if (notification) {
      // Handle notification click
      notification.onclick = () => {
        window.focus()
        notification.close()
        // You could navigate to the planner page here if needed
        if (window.location.pathname !== '/planner') {
          window.location.href = '/planner'
        }
      }
    }

    return notification
  }
}

// Hook for using notifications in React components
export const useNotifications = () => {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  const requestPermission = async () => {
    const granted = await NotificationService.requestPermission()
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
    return granted
  }

  return {
    permission,
    requestPermission,
    showNotification: NotificationService.show.bind(NotificationService),
    showReminder: NotificationService.showReminder.bind(NotificationService)
  }
}

export default NotificationService

