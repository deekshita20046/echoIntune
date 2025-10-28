import React from 'react'

/**
 * Custom Icon Component
 * Uses custom PNG icons from /public/icons folder
 * 
 * Available icons: 19.png through 36.png (18 unique icons)
 * 
 * Current Usage:
 * - Sidebar Navigation: home, journal, heart (mood), calendar (planner), checkSquare (habits), compass (insights), user (profile)
 * - Page Headers: Journal, Mood, Planner, Habits, AI Insights
 * - Dashboard Stats: Various inline icons
 * - Welcome Messages: Greeting icons
 */

const iconMap = {
  // Navigation Icons (used in Sidebar)
  home: '19',         // Home/dashboard icon
  journal: '20',      // Book/journal icon
  heart: '21',        // Heart/mood icon  
  calendar: '23',     // Calendar/planner icon
  checkSquare: '25',  // Checkbox/habits icon
  compass: '26',      // Compass/insights icon
  user: '24',         // User/profile icon
  
  // Additional Icons (available for use)
  greet: '22',        // Greeting/wave icon
  star: '27',         // Star/sun icon
  sun: '27',          // Sun icon
  moon: '28',         // Moon icon
  cloud: '29',        // Cloud icon
  flower: '30',       // Flower icon
  leaf: '31',         // Leaf icon
  wave: '32',         // Wave icon
  shell: '33',        // Shell icon
  sparkles: '34',     // Sparkles icon
  anchor: '35',       // Anchor icon
  lighthouse: '36',   // Lighthouse icon
  whale: '19',        // Whale icon (using home icon as marine themed)
  fish: '20',         // Fish icon (using journal as placeholder)
}

const CustomIcon = ({ name, className = "w-6 h-6 scale-[10]", alt }) => {
  const iconNumber = iconMap[name] || '19'
  
  return (
    <img 
      src={`/icons/${iconNumber}.png`}
      alt={alt || name}
      className={className}
      onError={(e) => {
        console.error(`Failed to load icon: ${name} (${iconNumber}.png)`)
        e.target.style.display = 'none'
      }}
    />
  )
}

export default CustomIcon

