import React, { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Floating Decorative Elements
 * Adds whimsical floating icons around the page with click animations
 */

const FloatingDecor = ({ children }) => {
  const [clicked, setClicked] = useState({})

  const floatingIcons = [
    // Larger, more prominent elements
    { src: '/design-elements/5.png', top: '10%', left: '5%', delay: 0, duration: 6, size: 'w-48 h-48 md:w-64 md:h-64' },
    { src: '/design-elements/6.png', top: '20%', right: '8%', delay: 1, duration: 7, size: 'w-44 h-44 md:w-56 md:h-56' },
    { src: '/design-elements/8.png', bottom: '15%', left: '10%', delay: 2, duration: 5, size: 'w-52 h-52 md:w-64 md:h-64' },
    { src: '/design-elements/9.png', bottom: '25%', right: '6%', delay: 1.5, duration: 6.5, size: 'w-48 h-48 md:w-60 md:h-60' },
    { src: '/design-elements/13.png', top: '40%', left: '3%', delay: 0.5, duration: 8, size: 'w-40 h-40 md:w-52 md:h-52' },
    { src: '/design-elements/14.png', top: '60%', right: '4%', delay: 2.5, duration: 7.5, size: 'w-44 h-44 md:w-56 md:h-56' },
    // Additional floating elements for more coverage
    { src: '/design-elements/7.png', top: '75%', left: '15%', delay: 1, duration: 6, size: 'w-36 h-36 md:w-48 md:h-48' },
    { src: '/design-elements/10.png', top: '85%', right: '12%', delay: 3, duration: 7, size: 'w-40 h-40 md:w-52 md:h-52' },
    { src: '/design-elements/11.png', top: '30%', right: '15%', delay: 2, duration: 6.5, size: 'w-38 h-38 md:w-50 md:h-50' },
    { src: '/design-elements/16.png', bottom: '45%', left: '8%', delay: 1.5, duration: 7.5, size: 'w-42 h-42 md:w-54 md:h-54' },
  ]

  const floatAnimation = (duration, delay) => ({
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }
  })

  const handleClick = (index) => {
    setClicked(prev => ({ ...prev, [index]: true }))
    setTimeout(() => {
      setClicked(prev => ({ ...prev, [index]: false }))
    }, 1000)
  }

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Floating decorative icons - above content */}
      <div className="fixed inset-0 overflow-hidden z-20 pointer-events-none">
        {floatingIcons.map((icon, index) => (
          <img
            key={index}
            src={icon.src}
            alt=""
            className={`absolute ${icon.size} opacity-60 cursor-pointer hover:scale-110 hover:opacity-80 transition-all ${clicked[index] ? 'animate-spin-bounce' : 'animate-float'}`}
            style={{
              top: icon.top,
              bottom: icon.bottom,
              left: icon.left,
              right: icon.right,
              pointerEvents: 'auto',
              animationDelay: `${icon.delay}s`
            }}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default FloatingDecor

