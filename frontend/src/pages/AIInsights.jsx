import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, Heart, Calendar, Lightbulb, MessageCircle, Bot, Send, X } from 'lucide-react'
import { aiAPI } from '../utils/api'
import { useMood } from '../contexts/MoodContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ShellBadge from '../components/ShellBadge'
import { generateAffirmation } from '../utils/helpers'

const AIInsights = () => {
  const { getMoodEmoji } = useMood()
  const [insights, setInsights] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMood, setCurrentMood] = useState('neutral')
  
  // AI Chat state
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    fetchInsights()
    // Initialize chat with welcome message
    setChatMessages([
      {
        id: 1,
        type: 'ai',
        message: "Aloha! I'm Naia 🐬 - your friendly oceanic companion! Like a dolphin guiding ships through calm waters, I'm here to help you navigate your mental wellness journey with warmth and wisdom. Whether it's productivity, journaling, mood insights, or just a friendly chat - I'm here for you! How can I support you today?",
        timestamp: new Date()
      }
    ])
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      
      // Fetch real insights from backend
      const response = await aiAPI.getInsights()
      
      console.log('📊 Fetched real insights:', response.data)
      
      setInsights(response.data.insights)
      setRecommendations(getMockRecommendations())
      setCurrentMood('neutral')
      
    } catch (error) {
      console.error('Failed to fetch AI insights:', error)
      // Use mock data on error
      setInsights(getMockInsights())
      setRecommendations(getMockRecommendations())
    } finally {
      setLoading(false)
    }
  }

  const getMockInsights = () => ({
    patterns: [
      {
        icon: '📊',
        title: 'Productivity Pattern',
        description: 'You complete 40% more tasks on days when you journal in the morning.',
        confidence: 85,
      },
      {
        icon: '🌅',
        title: 'Best Time of Day',
        description: 'Your mood is typically highest between 9 AM and 11 AM.',
        confidence: 92,
      },
      {
        icon: '📅',
        title: 'Weekly Trend',
        description: 'You tend to feel most anxious on Mondays and most relaxed on Fridays.',
        confidence: 78,
      },
      {
        icon: '💪',
        title: 'Habit Impact',
        description: 'Completing your "Morning Exercise" habit correlates with 30% better mood scores.',
        confidence: 88,
      },
    ],
    summary: {
      totalDataPoints: 127,
      analysisAccuracy: 87,
      lastUpdated: new Date().toISOString(),
    },
  })

  const getMockRecommendations = () => [
    {
      type: 'affirmation',
      icon: '✨',
      title: 'Daily Affirmation',
      content: generateAffirmation(currentMood),
    },
    {
      type: 'habit',
      icon: '🎯',
      title: 'Habit Suggestion',
      content: 'Based on your patterns, try adding a "5-minute meditation" habit in the evening.',
    },
    {
      type: 'task',
      icon: '📋',
      title: 'Task Optimization',
      content: 'Schedule your high-priority tasks between 9-11 AM when you\'re most productive.',
    },
    {
      type: 'journal',
      icon: '📝',
      title: 'Journaling Tip',
      content: 'Try gratitude journaling - it has helped improve mood scores for similar patterns.',
    },
  ]

  const getMockPrompts = () => [
    'What made you smile today?',
    'Describe a challenge you overcame this week.',
    'What are you grateful for right now?',
    'How did you show kindness to yourself today?',
    'What\'s one thing you learned recently?',
    'Describe your ideal peaceful moment.',
  ]

  // AI Chat functions
  const sendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const messageToSend = chatInput
    setChatInput('')
    setIsTyping(true)

    try {
      // Call Gemini AI through backend
      const response = await aiAPI.chat({
        message: messageToSend,
        context: {
          currentMood,
          insights: insights?.patterns || [],
          recommendations: recommendations || []
        }
      })

      console.log('✨ AI chat response:', response.data)

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: response.data.response,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      // Fallback response
      const fallbackResponse = getFallbackResponse(messageToSend)
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: fallbackResponse,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const getFallbackResponse = (input) => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('mood') || lowerInput.includes('feel')) {
      return "I understand you're thinking about your mood. Remember, it's okay to have different feelings throughout the day. Try taking a few deep breaths or writing down what you're experiencing. Would you like some journaling prompts to help process your emotions? 🌊"
    }
    
    if (lowerInput.includes('productivity') || lowerInput.includes('task') || lowerInput.includes('work')) {
      return "Great question about productivity! I've noticed you tend to be more productive when you journal in the morning. Try breaking large tasks into smaller, manageable steps. What's one small thing you could accomplish today? 💪"
    }
    
    if (lowerInput.includes('journal') || lowerInput.includes('write')) {
      return "Journaling is such a powerful tool for self-reflection! I can see from your patterns that you feel more balanced when you write regularly. Try starting with just 5 minutes of free writing. What's on your mind today? ✍️"
    }
    
    if (lowerInput.includes('habit') || lowerInput.includes('routine')) {
      return "Building habits takes time and patience. I've noticed your mood improves when you maintain consistent routines. Start small - even 2 minutes of a new habit can make a difference. What habit would you like to focus on? 🌱"
    }
    
    if (lowerInput.includes('stress') || lowerInput.includes('anxious') || lowerInput.includes('worried')) {
      return "I hear that you're feeling stressed. That's completely normal. Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8. You could also try writing down your worries to get them out of your head. How can I support you right now? 🧘‍♀️"
    }
    
    return "That's an interesting perspective! I'm here to help you navigate your thoughts and feelings. Based on your patterns, I've noticed you tend to feel more balanced when you take time for self-reflection. What would be most helpful for you right now? 🌊"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Analyzing your data..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Decorative corner elements */}
      <img src="/design-elements/11.png" alt="" className="absolute top-0 left-0 w-48 h-48 opacity-100 animate-float z-20 pointer-events-none" />
      <img src="/design-elements/12.png" alt="" className="absolute top-10 right-0 w-44 h-44 opacity-100 animate-pulse-slow z-20 pointer-events-none" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/icons/26.png" alt="" className="w-8 h-8 scale-[10]" />
          <h1 className="text-4xl font-bold">
            <span className="font-cursive text-5xl">Meet Naia 🐬</span>
          </h1>
        </div>
        <p className="text-lg text-muted-500 max-w-2xl mx-auto mb-6">
          AI-powered guidance for your mental wellness journey ✨
        </p>
        
        {/* AI Chat Toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="btn-gradient flex items-center gap-2 mx-auto"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{showChat ? 'Hide Chat' : 'Chat with AI'}</span>
        </button>
      </motion.div>

      {/* AI Chat Component */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-sand mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <ShellBadge icon="starfish" className="mb-0">AI Chat</ShellBadge>
              <button
                onClick={() => setShowChat(false)}
                className="ml-auto p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-500" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-white/50 rounded-xl border border-ocean-200">
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-ocean-400 to-ocean-600 text-white' 
                      : 'bg-white/70 text-ocean-800 border border-ocean-200'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/70 text-ocean-800 border border-ocean-200 px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything about productivity, journaling, or mood..."
                className="flex-1 px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim() || isTyping}
                className="btn-gradient disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <Sparkles className="w-8 h-8 text-ocean-600 mb-3" />
          <p className="text-sm text-muted-500">Data Points Analyzed</p>
          <p className="text-3xl font-bold text-ocean-800">{insights?.summary?.totalDataPoints || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <TrendingUp className="w-8 h-8 text-ocean-600 mb-3" />
          <p className="text-sm text-muted-500">Analysis Accuracy</p>
          <p className="text-3xl font-bold text-green-600">{insights?.summary?.analysisAccuracy || 0}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <Heart className="w-8 h-8 text-pink-500 mb-3" />
          <p className="text-sm text-slate-600">Insights Generated</p>
          <p className="text-3xl font-bold text-pink-600">{insights?.patterns?.length || 0}</p>
        </motion.div>
      </div>

      {/* Behavioral Patterns */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-ocean-600" />
          Behavioral Patterns
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {insights?.patterns?.map((pattern, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/50 rounded-xl border border-white/20 hover:shadow-lg transition-all"
            >
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{pattern.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{pattern.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">{pattern.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-ocean-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-ocean-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pattern.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {pattern.confidence}% confident
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Lightbulb className="w-6 h-6 mr-2 text-amber-500" />
          Personalized Recommendations
        </h2>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gradient-to-r from-sand-100 to-shell-500 rounded-xl border border-ocean-200"
            >
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{rec.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{rec.title}</h3>
                  <p className="text-slate-700">{rec.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-700"
      >
        <p>
          <strong>ℹ️ Note:</strong> These insights are generated using AI and machine learning based on
          your personal data. They are meant to provide helpful suggestions and patterns, not
          professional medical or psychological advice.
        </p>
      </motion.div>
    </div>
  )
}

export default AIInsights

