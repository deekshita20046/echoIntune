import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const OAuthLogin = () => {
  const [providers, setProviders] = useState({ google: { enabled: false } })

  useEffect(() => {
    // Fetch available OAuth providers
    fetch('http://localhost:5002/api/auth/providers')
      .then(res => res.json())
      .then(data => setProviders(data))
      .catch(err => console.error('Failed to fetch OAuth providers:', err))
  }, [])

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:5002/api/auth/${provider}`
  }

  return (
    <div className="space-y-6">
      {/* OAuth Buttons */}
      <div className="space-y-3">
        {providers.google?.enabled && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthLogin('google')}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-ocean-200 rounded-xl hover:border-ocean-400 hover:bg-ocean-50 transition-all duration-200 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-ocean-800 group-hover:text-ocean-900">
              Continue with Google
            </span>
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default OAuthLogin
