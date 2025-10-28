// Timezone utility - Always use IST (Indian Standard Time)
// IST is UTC+5:30

/**
 * Get current date/time in IST
 * @returns {Date} Date object representing current IST time
 */
export const getISTDate = () => {
  const now = new Date()
  
  // Get UTC time
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
  
  // IST offset is +5:30 (330 minutes)
  const istOffset = 330 * 60000
  
  // Create IST date
  const istDate = new Date(utcTime + istOffset)
  
  return istDate
}

/**
 * Get current IST time as HH:MM string
 * @returns {string} Time in HH:MM format
 */
export const getISTTime = () => {
  const istDate = getISTDate()
  const hours = String(istDate.getHours()).padStart(2, '0')
  const minutes = String(istDate.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Get current IST date as YYYY-MM-DD string
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getISTDateString = () => {
  const istDate = getISTDate()
  const year = istDate.getFullYear()
  const month = String(istDate.getMonth() + 1).padStart(2, '0')
  const day = String(istDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format IST date for display
 * @returns {string} Formatted date string
 */
export const formatISTDateTime = () => {
  const istDate = getISTDate()
  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

/**
 * Format time string from 24hr to 12hr format
 * @param {string} time24 - Time in HH:MM format (24hr)
 * @returns {string} Time in 12hr format (e.g., "4:30 PM")
 */
export const formatTime12Hour = (time24) => {
  if (!time24) return ''
  
  const [hours24, minutes] = time24.split(':').map(Number)
  
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12
  
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Format time string from 12hr to 24hr format
 * @param {string} time12 - Time in 12hr format
 * @returns {string} Time in HH:MM format (24hr)
 */
export const formatTime24Hour = (time12) => {
  if (!time12) return ''
  
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return time12
  
  let hours = parseInt(match[1])
  const minutes = match[2]
  const period = match[3].toUpperCase()
  
  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

/**
 * Check if current IST time matches a specific time
 * @param {string} timeString - Time in HH:MM format
 * @returns {boolean}
 */
export const isISTTimeMatch = (timeString) => {
  if (!timeString) return false
  
  const currentTime = getISTTime()
  const match = currentTime === timeString
  
  if (match) {
    console.log('🇮🇳 IST TIME MATCH!', { 
      expected: timeString, 
      current: currentTime,
      fullDateTime: formatISTDateTime()
    })
  }
  
  return match
}

/**
 * Get IST hours and minutes separately
 * @returns {object} { hours, minutes }
 */
export const getISTHoursMinutes = () => {
  const istDate = getISTDate()
  return {
    hours: istDate.getHours(),
    minutes: istDate.getMinutes()
  }
}

/**
 * Log current IST time for debugging
 */
export const logISTTime = () => {
  const istDate = getISTDate()
  console.log('🇮🇳 Current IST:', formatISTDateTime())
  console.log('🕐 Time:', getISTTime())
  console.log('📅 Date:', getISTDateString())
  console.log('⏰ Hours:', istDate.getHours(), 'Minutes:', istDate.getMinutes())
}

/**
 * Convert UTC date string to IST date string (YYYY-MM-DD)
 * This is crucial for displaying tasks on the correct date
 * @param {string} utcDateString - UTC date string (e.g., "2025-10-27T18:30:00.000Z")
 * @returns {string} IST date string (e.g., "2025-10-28")
 */
export const convertUTCToISTDateString = (utcDateString) => {
  if (!utcDateString) return null
  
  console.log('🔄 Converting UTC to IST date:', utcDateString)
  
  // Parse the UTC date
  const utcDate = new Date(utcDateString)
  
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours in milliseconds
  const istDate = new Date(utcDate.getTime() + istOffset)
  
  // Extract date components in UTC (since we've already added the offset)
  const year = istDate.getUTCFullYear()
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(istDate.getUTCDate()).padStart(2, '0')
  
  const istDateString = `${year}-${month}-${day}`
  
  console.log('✅ Converted to IST date:', istDateString)
  
  return istDateString
}

export default {
  getISTDate,
  getISTTime,
  getISTDateString,
  formatISTDateTime,
  isISTTimeMatch,
  getISTHoursMinutes,
  logISTTime,
  formatTime12Hour,
  formatTime24Hour,
  convertUTCToISTDateString
}

