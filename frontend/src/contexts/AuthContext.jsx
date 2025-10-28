/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * Handles login, register, logout, and user state management
 * Automatically loads user on app startup if token exists
 * 
 * Usage: const { user, login, logout } = useAuth()
 */

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

/**
 * Custom hook to use authentication context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * AuthProvider Component
 * Wrap your app with this to provide authentication context
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch current user data from backend
   */
  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data.user)
    } catch (error) {
      // Token invalid or expired - clear it
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  /**
   * Login function - Supports both email/password and OAuth token login
   * @param {string} emailOrToken - Email for regular login, or JWT token for OAuth
   * @param {string} password - Password (optional, not used for OAuth)
   */
  const login = async (emailOrToken, password) => {
    // If only one argument is provided, it's a token from OAuth
    if (!password) {
      const token = emailOrToken
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      await fetchUser()
      return user
    }
    
    // Traditional email/password login
    const response = await axios.post('/api/auth/login', { email: emailOrToken, password })
    const { token, user: userData } = response.data
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    return userData
  }

  /**
   * Register new user
   */
  const register = async (name, email, password) => {
    const response = await axios.post('/api/auth/register', { name, email, password })
    const { token, user } = response.data
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  /**
   * Logout - Clear token and user data
   */
  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }
  
  /**
   * Update user data in context (e.g., after profile update)
   */
  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

