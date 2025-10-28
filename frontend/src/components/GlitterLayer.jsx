import { useEffect, useState } from 'react'

/**
 * GlitterLayer - Magical floating shimmer dots
 * Adds tiny white dots that fade in/out across the screen
 */

const GlitterLayer = () => {
  const [glitterDots, setGlitterDots] = useState([])

  useEffect(() => {
    // Generate random glitter dots
    const dots = []
    const dotCount = 50 // More glitter dots for better visibility

    for (let i = 0; i < dotCount; i++) {
      dots.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${2 + Math.random() * 3}s` // 2-5 seconds
      })
    }

    setGlitterDots(dots)
  }, [])

  return (
    <div className="glitter-layer">
      {glitterDots.map((dot) => (
        <div
          key={dot.id}
          className="glitter-dot"
          style={{
            left: dot.left,
            top: dot.top,
            animationDelay: dot.delay,
            animationDuration: dot.duration
          }}
        />
      ))}
    </div>
  )
}

export default GlitterLayer

