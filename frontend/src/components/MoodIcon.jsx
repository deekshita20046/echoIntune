import { motion } from 'framer-motion'
import { useMood } from '../contexts/MoodContext'

const MoodIcon = ({ emotion, size = 'medium', animated = true }) => {
  const { getMoodEmoji, getMoodColor } = useMood()
  
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
  }

  const emoji = getMoodEmoji(emotion)
  const colorClass = getMoodColor(emotion)

  if (animated) {
    return (
      <motion.span
        className={`mood-icon ${sizeClasses[size]} ${colorClass}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.2, rotate: 10 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {emoji}
      </motion.span>
    )
  }

  return <span className={`${sizeClasses[size]} ${colorClass}`}>{emoji}</span>
}

export default MoodIcon

