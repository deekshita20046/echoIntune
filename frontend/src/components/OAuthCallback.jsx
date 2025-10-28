import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

const OAuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage('OAuth authentication failed. Please try again.')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (token) {
          // Store token and update auth context
          localStorage.setItem('token', token)
          await login(token)
          
          setStatus('success')
          setMessage('Successfully authenticated! Redirecting to your dashboard...')
          
          setTimeout(() => {
            navigate('/home')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('No authentication token received. Please try again.')
          setTimeout(() => navigate('/login'), 3000)
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, login])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-16 h-16 text-ocean-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />
      default:
        return <Loader className="w-16 h-16 text-ocean-500 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-ocean-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-sand-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card-sand max-w-md w-full text-center p-8"
      >
        <div className="flex flex-col items-center space-y-6">
          {getStatusIcon()}
          
          <div>
            <h2 className={`text-2xl font-bold ${getStatusColor()}`}>
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Welcome to Echo: Intune!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            
            <p className="text-muted-500 mt-2">
              {message}
            </p>
          </div>

          {status === 'loading' && (
            <div className="flex items-center space-x-2 text-ocean-600">
              <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default OAuthCallback
