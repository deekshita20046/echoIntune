import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const Wave = ({ className = '', variant = 'default' }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const waveVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0.3
    },
    visible: { 
      pathLength: 1,
      opacity: 0.6,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 1 }
      }
    }
  }

  const wavePath = variant === 'inverted' 
    ? "M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
    : "M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,128C960,128,1056,160,1152,186.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"

  return (
    <div ref={ref} className={`wave-separator ${className}`}>
      <svg
        viewBox="0 0 1440 320"
        className="w-full h-full"
        style={{ 
          fill: variant === 'inverted' ? 'var(--ocean-100)' : 'var(--ocean-50)',
          transform: variant === 'inverted' ? 'rotate(180deg)' : 'none'
        }}
      >
        <motion.path
          d={wavePath}
          variants={waveVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            fill: variant === 'inverted' ? 'var(--ocean-100)' : 'var(--ocean-50)'
          }}
        />
      </svg>
    </div>
  )
}

export default Wave
