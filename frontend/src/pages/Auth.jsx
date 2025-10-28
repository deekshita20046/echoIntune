import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User as UserIcon, UserPlus, LogIn, Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import OAuthLogin from '../components/OAuthLogin'
import ForgotPassword from '../components/ForgotPassword'
import ShellBadge from '../components/ShellBadge'
import GlitterLayer from '../components/GlitterLayer'

const Auth = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.pathname === '/register' ? 'register' : 'login')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  
  // Register state
  const [name, setName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const { register, login } = useAuth()
  const navigate = useNavigate()

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegisterError('')

    // Validation
    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match')
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters')
      return
    }

    setRegisterLoading(true)

    try {
      await register(name, registerEmail, registerPassword)
      navigate('/home')
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to register'
      // Check if it's a "user already exists" error
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('user already')) {
        setRegisterError('Account already exists with this email. Please login instead.')
      } else {
        setRegisterError(errorMessage)
      }
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      await login(loginEmail, loginPassword)
      navigate('/home')
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Failed to login. Please check your credentials.')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-animated-gradient relative overflow-hidden">
      <GlitterLayer />
      
      {/* Decorative background elements */}
      <img src="/design-elements/17.png" alt="" className="absolute top-10 right-10 w-56 h-56 opacity-100 animate-float z-20 pointer-events-none" />
      <img src="/design-elements/18.png" alt="" className="absolute bottom-10 left-10 w-48 h-48 opacity-100 animate-pulse-slow z-20 pointer-events-none" />
      
      {/* Back Arrow - Top Left Corner */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 w-10 h-10 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg z-50"
      >
        <ArrowLeft className="w-5 h-5 text-ocean-800" />
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-30 -mt-19"
      >
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <Link to="/" className="inline-block group max-w-[140px] leading-none">
            <img 
              src="/logos/2.png" 
              alt="echo: Intune" 
              className="w-full h-auto object-contain group-hover:scale-105 transition-transform block scale-150"
            />
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {showForgotPassword ? (
            <ForgotPassword 
              key="forgot-password"
              onBack={() => setShowForgotPassword(false)}
            />
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-sand p-4"
            >
              {/* Tabs */}
              <div className="flex mb-4 bg-ocean-50 rounded-xl p-1">
                <button
                  onClick={() => {
                    setActiveTab('login')
                    setRegisterError('')
                    setLoginError('')
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'login'
                      ? 'bg-white text-ocean-800 shadow-sm'
                      : 'text-muted-500 hover:text-ocean-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab('register')
                    setRegisterError('')
                    setLoginError('')
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'register'
                      ? 'bg-white text-ocean-800 shadow-sm'
                      : 'text-muted-500 hover:text-ocean-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'register' ? (
                  /* Register Form */
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-lg font-heading mb-3 text-ocean-deep text-center">
                      Join <span className="brand-echo">echo</span><span className="brand-intune">: Intune</span>
                    </h2>

                    {registerError && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                        {registerError}
                      </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-2">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-medium text-ocean-800 mb-1">Full Name</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-500" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 transition-all bg-white/70 text-ocean-800"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-ocean-800 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-500" />
                          <input
                            type="email"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 transition-all bg-white/70 text-ocean-800"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-medium text-ocean-800 mb-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-500" />
                          <input
                            type={showRegisterPassword ? 'text' : 'password'}
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 text-sm border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 transition-all bg-white/70 text-ocean-800"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-500 hover:text-ocean-800"
                          >
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-medium text-ocean-800 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-500" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 text-sm border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 transition-all bg-white/70 text-ocean-800"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-500 hover:text-ocean-800"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={registerLoading}
                        className="w-full btn-gradient flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {registerLoading ? (
                          <div className="spinner w-5 h-5 border-2"></div>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            <span>Create Account</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* OAuth Options */}
                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-ocean-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-sand-100 text-muted-500">Or</span>
                      </div>
                    </div>

                    <OAuthLogin />
                  </motion.div>
                ) : (
                  /* Login Form */
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-4">
                      <ShellBadge icon="starfish" className="mb-2">Welcome Back</ShellBadge>
                      <h2 className="text-lg font-heading text-ocean-deep">Sign In</h2>
                      <p className="text-sea-pebble mt-1 text-sm font-cursive">Continue your journey with <span className="brand-echo">echo</span><span className="brand-intune">: Intune</span></p>
                    </div>

                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs"
                      >
                        {loginError}
                      </motion.div>
                    )}

                    {/* OAuth Login */}
                    <OAuthLogin />

                    {/* Divider */}
                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-ocean-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-sand-100 text-muted-500">Or</span>
                      </div>
                    </div>

                    {/* Traditional Login Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-2">
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-ocean-800 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-500" />
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-medium text-ocean-800 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-500" />
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 text-sm border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-500 hover:text-ocean-600 transition-colors"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Forgot Password Link */}
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-ocean-600 hover:text-ocean-800 text-xs font-medium transition-colors duration-200"
                        >
                          Forgot your password?
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full btn-gradient flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loginLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Signing in...
                          </div>
                        ) : (
                          <>
                            <LogIn className="w-5 h-5" />
                            <span>Sign In</span>
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Auth

