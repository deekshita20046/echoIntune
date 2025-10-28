import { motion } from 'framer-motion'

const ShellBadge = ({ children, icon = '🐚', className = '', variant = 'default' }) => {
  const variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  }

  const shellIcon = {
    shell: '🐚',
    starfish: '⭐',
    wave: '🌊',
    clam: '🦪',
    seaglass: '💎'
  }

  return (
    <motion.div
      className={`shell-badge inline-flex items-center gap-2 ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <span className="text-sm">{shellIcon[icon] || icon}</span>
      <span>{children}</span>
    </motion.div>
  )
}

export default ShellBadge
