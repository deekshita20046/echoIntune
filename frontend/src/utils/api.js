/**
 * API Utility - Centralized API communication
 * 
 * Provides organized API methods for all backend endpoints
 * Automatically handles authentication via JWT tokens
 * 
 * Usage: import { journalAPI, moodAPI, etc } from './utils/api'
 */

import axios from 'axios'

// API URLs from environment variables (see .env.example)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5001/api'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
})

// Request interceptor - Automatically adds JWT token to all requests
api.interceptors.request.use(
  config => {
    // Get JWT token from localStorage and add to Authorization header
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ============================================
// ML SERVICE APIs (Optional - for advanced analytics)
// ============================================

/**
 * Detect emotion from text using ML service
 * Falls back to neutral emotion if service is unavailable
 */
export const detectEmotion = async text => {
  try {
    const response = await axios.post(`${ML_API_URL}/detect-emotion`, { text })
    return response.data
  } catch (error) {
    // ML service unavailable - return neutral emotion
    return { emotion: 'neutral', probability: 0.5 }
  }
}

// ============================================
// BACKEND APIs
// ============================================

// Journal API - CRUD operations for journal entries
export const journalAPI = {
  getAll: () => api.get('/journal'),
  getById: id => api.get(`/journal/${id}`),
  create: data => api.post('/journal', data),
  update: (id, data) => api.put(`/journal/${id}`, data),
  delete: id => api.delete(`/journal/${id}`),
  search: params => api.get('/journal/search', { params }),
}

// Mood API - Mood tracking and analytics
export const moodAPI = {
  getStats: params => api.get('/moods/stats', { params }),
  getTrends: params => api.get('/moods/trends', { params }),
  getInsights: params => api.get('/moods/insights', { params }),
}

// Task/Planner API - Task management (todos, goals, reminders)
export const plannerAPI = {
  getTasks: async (params) => {
    const response = await api.get('/tasks', { params })
    return response.data
  },
  createTask: async (data) => {
    const response = await api.post('/tasks', data)
    return response.data
  },
  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data
  },
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },
  toggleTask: async (id) => {
    const response = await api.patch(`/tasks/${id}/toggle`)
    return response.data
  },
}

// Habit API - Habit tracking and statistics
export const habitAPI = {
  getAll: () => api.get('/habits'),
  create: data => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: id => api.delete(`/habits/${id}`),
  markDay: (id, date) => api.post(`/habits/${id}/mark`, { date }),
  unmarkDay: (id, date) => api.delete(`/habits/${id}/mark`, { data: { date } }),
  getStats: id => api.get(`/habits/${id}/stats`),
}

// AI API - AI-powered insights, recommendations, and chat
export const aiAPI = {
  getInsights: () => api.get('/ai/insights'),
  getRecommendations: params => api.get('/ai/recommendations', { params }),
  getFollowUpQuestions: moodData => api.post('/ai/followup', moodData),
  getTaskSuggestions: (taskData) => api.post('/ai/task-suggestions', taskData),
  getDailyPrompts: () => api.get('/ai/daily-prompts'),
  chat: (data) => api.post('/ai/chat', data),
}

// User API - Profile management and statistics
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: data => api.put('/user/profile', data),
  getStats: () => api.get('/user/stats'),
}

export default api

