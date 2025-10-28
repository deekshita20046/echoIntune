import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { MoodProvider } from './contexts/MoodContext'

// Layout
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import GlitterLayer from './components/GlitterLayer'

// Pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Journal from './pages/Journal'
import MoodDashboard from './pages/MoodDashboard'
import Planner from './pages/Planner'
import HabitTracker from './pages/HabitTracker'
import AIInsights from './pages/AIInsights'
import Profile from './pages/Profile'
import OAuthCallback from './components/OAuthCallback'

function App() {
  return (
    <Router>
      <AuthProvider>
        <MoodProvider>
          <GlitterLayer />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/mood" element={<MoodDashboard />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/habits" element={<HabitTracker />} />
                <Route path="/insights" element={<AIInsights />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MoodProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

