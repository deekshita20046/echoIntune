import { Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import CustomIcon from './CustomIcon'

const Header = ({ setSidebarOpen }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const avatarOptions = [
    { icon: 'shell', bg: 'bg-blush-coral/40', border: 'border-blush-coral/60' },
    { icon: 'wave', bg: 'bg-turquoise-tide/40', border: 'border-turquoise-tide/60' },
    { icon: 'sun', bg: 'bg-peach-cream/50', border: 'border-peach-cream/70' },
    { icon: 'moon', bg: 'bg-lavender-shell/40', border: 'border-lavender-shell/60' },
    { icon: 'heart', bg: 'bg-blush-coral/50', border: 'border-blush-coral/70' },
    { icon: 'whale', bg: 'bg-aqua-splash/40', border: 'border-aqua-splash/60' },
    { icon: 'leaf', bg: 'bg-seafoam-mist/60', border: 'border-turquoise-tide/50' },
    { icon: 'cloud', bg: 'bg-shell-white/80', border: 'border-sand-beige/60' },
    { icon: 'anchor', bg: 'bg-ocean-deep/30', border: 'border-ocean-deep/50' },
    { icon: 'lighthouse', bg: 'bg-peach-cream/60', border: 'border-peach-cream/80' },
    { icon: 'sparkles', bg: 'bg-lavender-shell/50', border: 'border-lavender-shell/70' },
    { icon: 'compass', bg: 'bg-turquoise-tide/50', border: 'border-aqua-splash/60' },
  ]
  
  const currentAvatar = avatarOptions.find(a => a.icon === user?.avatar) || avatarOptions[0]

  return (
    <header className="glass border-b border-white/20 sticky top-0 z-50">
      <div className="flex items-center justify-between p-2 md:p-3">
        {/* Left section - Logo and Menu */}
        <div className="flex items-center gap-4">
          {/* Menu button - higher z-index to be on top */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 rounded-lg hover:bg-ocean-100 transition-colors group relative z-[60]"
            title="Toggle menu"
          >
            <Menu className="w-6 h-6 text-ocean-600 group-hover:text-ocean-800" />
          </button>

          {/* Logo - Link to landing page */}
          <Link 
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-10 ml-2"
          >
            <img 
              src="/logos/1.png" 
              alt="echo Intune" 
              className="h-16 w-auto object-contain scale-[2.5]"
            />
          </Link>
        </div>

        {/* Center section - Main Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex">
          <img 
            src="/logos/2.png" 
            alt="echo: Intune" 
            className="h-20 w-auto object-contain scale-[2.5]"
          />
        </div>

        {/* Right section - Profile */}
        <div className="flex items-center gap-3">
          {/* User name (desktop only) */}
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-ocean-800">{user?.name}</p>
          </div>

          {/* Profile icon - clickable */}
          <button
            onClick={() => navigate('/profile')}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 overflow-hidden relative ${currentAvatar.bg} ${currentAvatar.border}`}
            title="View Profile"
          >
            {user?.avatar?.startsWith('http') ? (
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <CustomIcon name={user?.avatar || 'shell'} className="w-3 h-3 scale-[11]" />
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

