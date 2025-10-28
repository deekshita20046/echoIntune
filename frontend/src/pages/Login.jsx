import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react'
import OAuthLogin from '../components/OAuthLogin'
import ForgotPassword from '../components/ForgotPassword'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-sand-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8 overflow-visible">
          <Link to="/" className="inline-flex flex-col items-center space-y-3 mb-4 group">
            <img 
              src="/logos/2.png" 
              alt="echo: Intune" 
              className="h-64 w-auto object-contain scale-[90] group-hover:scale-[95] transition-transform breathing"
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
              key="login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-sand p-8"
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img src="/icons/21.png" alt="" className="w-6 h-6 scale-[8]" />
                  <h2 className="text-2xl font-bold text-ocean-800">
                    <span className="font-cursive text-3xl">Welcome Back</span>
                  </h2>
                </div>
                <p className="text-muted-500 mt-2">
                  Continue your journey with <span className="brand-echo">echo</span><span className="brand-intune">: Intune</span>
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* OAuth Login */}
              <OAuthLogin onForgotPassword={() => setShowForgotPassword(true)} />

              {/* Traditional Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-500 hover:text-ocean-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gradient flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
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

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-muted-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-ocean-600 hover:text-ocean-800 font-medium transition-colors">
                    Sign up here
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-muted-500 hover:text-ocean-600 text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login