import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CustomIcon from './CustomIcon'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { name: 'Home', path: '/home', iconName: 'home' },
    { name: 'Journal', path: '/journal', iconName: 'journal' },
    { name: 'Mood Tracker', path: '/mood', iconName: 'heart' },
    { name: 'Planner', path: '/planner', iconName: 'calendar' },
    { name: 'Habits', path: '/habits', iconName: 'checkSquare' },
    { name: 'Naia🐬', path: '/insights', iconName: 'compass' },
    { name: 'Profile', path: '/profile', iconName: 'user' },
  ]

  const sidebarClasses = `
    fixed top-0 left-0 z-[60] h-full w-64 glass shadow-xl
    transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `

  return (
    <aside className={sidebarClasses}>
      <div className="flex flex-col h-full p-6 relative">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img 
              src="/logos/1.png" 
              alt="echo Intune" 
              className="h-16 w-auto object-contain scale-[2.5]"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-ocean-500 hover:text-ocean-800 transition-colors"
            title="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-ocean-midnight to-ocean-deep text-white shadow-lg shadow-ocean-500/30'
                    : 'text-ocean-800 hover:bg-white/50 hover:text-ocean-midnight'
                }`
              }
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center overflow-hidden">
                <CustomIcon name={item.iconName} className="w-5 h-5 scale-[10]" />
              </div>
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-6 border-t border-ocean-200">
          <div className="flex flex-col items-center gap-2">
            <img 
              src="/logos/1.png" 
              alt="echo: Intune" 
              className="h-12 w-auto object-contain scale-[2.5]"
            />
            <p className="text-xs text-ocean-800 font-details">
              © 2025 All rights reserved
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

