import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Search, Calendar, Trash2, MessageCircle, Music, Lightbulb, Heart, Sparkles, BookOpen, Feather, Star, Edit2, ChevronLeft, ChevronRight, X, Send } from 'lucide-react'
import MoodIcon from '../components/MoodIcon'
import LoadingSpinner from '../components/LoadingSpinner'
import ShellBadge from '../components/ShellBadge'
import { detectEmotion, journalAPI, aiAPI } from '../utils/api'
import { formatDate, formatRelativeTime } from '../utils/helpers'
import axios from 'axios'

const Journal = () => {
  const [content, setContent] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [entries, setEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEmotion, setFilterEmotion] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [searchResults, setSearchResults] = useState(null) // null = not searching, [] = search results
  
  // Pagination
  const [showAllEntries, setShowAllEntries] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 10
  
  // Editing
  const [editingEntry, setEditingEntry] = useState(null)
  const [editContent, setEditContent] = useState('')
  
  // Naia Follow-up
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpQuestions, setFollowUpQuestions] = useState([])
  const [lastMood, setLastMood] = useState(null)
  const [lastJournalContent, setLastJournalContent] = useState('')
  
  // Naia Response Modal
  const [showAiResponse, setShowAiResponse] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  
  // Naia Chat Sidebar
  const [showChatSidebar, setShowChatSidebar] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatTyping, setIsChatTyping] = useState(false)
  
  // Daily Prompts
  const [dailyPrompts, setDailyPrompts] = useState([])

  useEffect(() => {
    fetchEntries()
    fetchDailyPrompts()
  }, [])


  const fetchEntries = async () => {
    try {
      setLoading(true)
      const response = await journalAPI.getAll()
      setEntries(response.data.journals)
    } catch (error) {
      console.error('Failed to fetch journal entries:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchDailyPrompts = async () => {
    try {
      const response = await aiAPI.getDailyPrompts()
      setDailyPrompts(response.data.prompts || [])
    } catch (error) {
      console.error('Failed to fetch daily prompts:', error)
      // Fallback to default prompts
      setDailyPrompts([
        "What brought you joy today? 🌻",
        "Describe a moment you felt proud of yourself ✨",
        "What's one thing you're grateful for right now? 🙏"
      ])
    }
  }
  
  const openChatSidebar = () => {
    // Initialize chat with context-aware welcome message
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      message: `Thanks for sharing your thoughts today! I sense you're feeling ${lastMood?.emotion || 'reflective'}. Would you like to talk more about how you're feeling? I'm here to listen and support you. 💙`,
      timestamp: new Date()
    }
    setChatMessages([welcomeMessage])
    setShowChatSidebar(true)
    setShowChatPrompt(false)
  }
  
  const closeChatSidebar = () => {
    setShowChatSidebar(false)
  }
  
  const sendChatMessage = async () => {
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
    setIsChatTyping(true)

    try {
      // Call Gemini AI through backend
      const response = await aiAPI.chat({
        message: messageToSend,
        context: {
          journalContent: lastJournalContent,
          emotion: lastMood?.emotion || 'neutral',
          probability: lastMood?.probability || 0,
        }
      })

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: response.data.response,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: "I'm here to listen. Sometimes it helps just to write things down. How are you feeling about what you shared?",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsChatTyping(false)
    }
  }

  const handleSaveEntry = async () => {
    if (!content.trim()) return

    setSaving(true)
    try {
      // Step 1: Detect emotion using ML service
      const emotionData = await detectEmotion(content)
      
      // Step 2: Save journal entry with emotion
      const response = await journalAPI.create({
        content,
        emotion: emotionData.emotion,
        probability: emotionData.probability,
      })

      // Step 3: Add to entries list
      setEntries([response.data.journal, ...entries])
      
      // Step 4: Store mood and journal content for AI follow-up
      setLastMood(emotionData)
      setLastJournalContent(content)
      
      // Step 5: Generate follow-up questions
      const followUpQuestions = generateFollowUpQuestions(emotionData.emotion, emotionData.probability)
      setFollowUpQuestions(followUpQuestions)
      setShowFollowUp(true)

      // Clear content
      setContent('')
    } catch (error) {
      console.error('Failed to save journal entry:', error)
      alert('Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSearch = async () => {
    console.log('🔍 Search triggered with:', { searchQuery, filterEmotion, filterDate })
    
    // Require at least one filter
    if (!searchQuery.trim() && !filterEmotion && !filterDate) {
      console.log('❌ Search cancelled: No filters provided')
      alert('Please enter keywords, select an emotion, or choose a date to search.')
      return
    }

    try {
      setLoading(true)
      console.log('⏳ Starting search...')
      
      const params = {}
      
      if (searchQuery.trim()) {
        params.q = searchQuery.trim()
      }
      
      if (filterEmotion) {
        params.emotion = filterEmotion
      }
      
      if (filterDate) {
        params.date = filterDate
      }
      
      console.log('📤 Search params:', params)
      
      const response = await journalAPI.search(params)
      setSearchResults(response.data.journals)
      
      console.log(`✅ Search completed: ${response.data.journals.length} entries found`)
      console.log('📊 Results:', response.data.journals)
    } catch (error) {
      console.error('❌ Search failed:', error)
      console.error('Error details:', error.response?.data || error.message)
      setSearchResults([]) // Show empty results on error
    } finally {
      setLoading(false)
      console.log('🏁 Search finished')
    }
  }

  const handleClearSearch = async () => {
    setSearchQuery('')
    setFilterEmotion('')
    setFilterDate('')
    setSearchResults(null) // Clear search results
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return

    try {
      await journalAPI.delete(id)
      
      // Remove from entries list
      setEntries(entries.filter((e) => e.id !== id))
      
      // Also remove from search results if searching
      if (searchResults !== null) {
        setSearchResults(searchResults.filter((e) => e.id !== id))
      }
      
      // Close modal if this entry was open
      if (selectedEntry?.id === id) setSelectedEntry(null)
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setEditContent(entry.content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('Content cannot be empty')
      return
    }

    try {
      setSaving(true)
      const response = await journalAPI.update(editingEntry.id, {
        content: editContent,
        emotion: editingEntry.emotion,
        probability: editingEntry.probability
      })

      // Update entries list
      setEntries(entries.map(e => 
        e.id === editingEntry.id ? response.data.journal : e
      ))

      // Update search results if searching
      if (searchResults !== null) {
        setSearchResults(searchResults.map(e =>
          e.id === editingEntry.id ? response.data.journal : e
        ))
      }

      setEditingEntry(null)
      setEditContent('')
    } catch (error) {
      console.error('Failed to update entry:', error)
      alert('Failed to update entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
    setEditContent('')
  }

  const handleFollowUpAction = async (action, questionText) => {
    try {
      setLoadingResponse(true)
      setCurrentQuestion(questionText)
      setShowAiResponse(true)
      setShowFollowUp(false) // Close the follow-up questions modal

      // Call the AI API for personalized response
      const response = await axios.post('http://localhost:5002/api/ai/followup-response', {
        action,
        emotion: lastMood?.emotion,
        journalContent: lastJournalContent,
        questionText
      }, {
        withCredentials: true
      })

      setAiResponse(response.data.response)
    } catch (error) {
      console.error('Follow-up action failed:', error)
      
      // More specific error messages
      if (error.response) {
        if (error.response.status === 401) {
          setAiResponse('Please log in again to use AI features. Your session may have expired. 🔐')
        } else if (error.response.status === 500) {
          setAiResponse('The AI service encountered an error. Please check that your OpenAI API key is valid and has credits available. 💭')
        } else {
          setAiResponse(`Error: ${error.response.data?.error || 'Something went wrong'}. Please try again. 💙`)
        }
      } else if (error.request) {
        setAiResponse('Unable to reach the server. Please make sure the backend is running on port 5002. 🔌')
      } else {
        setAiResponse('I\'m here to support you, but I\'m having trouble generating a response right now. Please try again in a moment. 💙')
      }
    } finally {
      setLoadingResponse(false)
    }
  }

  const emotions = ['joy', 'happy', 'neutral', 'sad', 'angry', 'anxious', 'excited', 'calm']

  // Helper function to get emoji for emotion
  const getMoodEmoji = (emotion) => {
    const emojiMap = {
      joy: '😊',
      happy: '😄',
      excited: '🤩',
      calm: '😌',
      neutral: '😐',
      anxious: '😰',
      sad: '😢',
      angry: '😠',
      fear: '😨'
    }
    return emojiMap[emotion] || '😐'
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return date.toLocaleDateString('en-US', options)
  }

  const generateFollowUpQuestions = (emotion, probability) => {
    const questions = []
    
    if (emotion === 'sad' || emotion === 'angry' || emotion === 'anxious') {
      questions.push({
        text: "Would you like to talk more about what's on your mind?",
        action: 'talk',
        icon: '🗣️'
      })
      questions.push({
        text: "Want a calming song recommendation?",
        action: 'song',
        icon: '🎵'
      })
      questions.push({
        text: "Try a 5-minute breathing exercise?",
        action: 'activity',
        icon: '🧘‍♀️'
      })
    } else if (emotion === 'joy' || emotion === 'excited' || emotion === 'happy') {
      questions.push({
        text: "Want to capture this positive energy?",
        action: 'talk',
        icon: '✨'
      })
      questions.push({
        text: "Need an upbeat song to celebrate?",
        action: 'song',
        icon: '🎉'
      })
      questions.push({
        text: "Share this moment with someone?",
        action: 'activity',
        icon: '💌'
      })
    } else {
      questions.push({
        text: "Want to explore your thoughts deeper?",
        action: 'talk',
        icon: '🤔'
      })
      questions.push({
        text: "Need some gentle background music?",
        action: 'song',
        icon: '🌊'
      })
      questions.push({
        text: "Try a mindful activity?",
        action: 'activity',
        icon: '🌱'
      })
    }
    
    return questions
  }

  return (
    <div className="space-y-6 relative">
      {/* Decorative corner elements */}
      <img src="/design-elements/16.png" alt="" className="absolute top-0 right-0 w-44 h-44 opacity-100 animate-float z-20 pointer-events-none" />
      <img src="/design-elements/6.png" alt="" className="absolute bottom-10 left-0 w-40 h-40 opacity-100 animate-pulse-slow z-20 pointer-events-none" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/icons/20.png" alt="" className="w-8 h-8 scale-[10]" />
          <h1 className="text-4xl font-bold">
            <span className="font-cursive text-5xl">Journal</span>
          </h1>
        </div>
        <p className="text-lg text-muted-500 max-w-2xl mx-auto">
          Pour your heart out and let Naia 🐬 understand your emotions with warmth and wisdom
        </p>
      </motion.div>

      {/* New Entry Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-sand"
      >
        <div className="flex items-center gap-3 mb-6">
          <ShellBadge icon="shell" className="mb-0">New Entry</ShellBadge>
          {/* Cute Date Selector */}
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-500 pointer-events-none z-10" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="pl-10 pr-3 py-2 bg-gradient-to-r from-ocean-50 to-sand-50 border-2 border-ocean-200 rounded-full focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all text-sm font-medium text-ocean-700 cursor-pointer hover:border-ocean-300 hover:shadow-md"
            />
          </div>
        </div>
        
        <div className="relative">
          {/* Date Title Overlay - at the very top */}
          <div className="absolute left-6 pointer-events-none font-['Caveat'] text-[1.375rem] text-ocean-600 font-semibold z-10" style={{ top: '0.75rem', lineHeight: '2rem' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            }).replace(/(\d+)/, (match) => {
              const day = parseInt(match);
              const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                           day === 2 || day === 22 ? 'nd' :
                           day === 3 || day === 23 ? 'rd' : 'th';
              return `${day}${suffix}`;
            })}
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
            placeholder="Dear diary... How are you feeling today? What's on your mind? 🌊"
            className="w-full min-h-[300px] border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 resize-none transition-all duration-200 journal-entry"
            style={{ paddingTop: '3.25rem', paddingBottom: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
        />
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4 text-sm text-muted-500">
            <span>{content.length} characters</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Naia 🐬 will analyze your mood
            </span>
          </div>
          <button
            onClick={handleSaveEntry}
            disabled={saving || !content.trim()}
            className="btn-gradient flex items-center space-x-2 disabled:opacity-50 breathing"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Save Entry</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Naia Follow-up Modal */}
      <AnimatePresence>
        {showFollowUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowFollowUp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-sand max-w-lg w-full"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{lastMood?.emotion === 'joy' ? '😊' : lastMood?.emotion === 'sad' ? '😢' : lastMood?.emotion === 'angry' ? '😠' : '😌'}</div>
                <h3 className="text-2xl font-bold text-ocean-800 mb-2">
                  <span className="font-handwriting text-3xl">Entry Saved!</span> ✨
                </h3>
                <p className="text-muted-500">
                  Naia 🐬 noticed you're feeling <span className="font-semibold text-ocean-800 capitalize">{lastMood?.emotion}</span>
                </p>
              </div>

              {followUpQuestions.length > 0 && (
                <div className="space-y-3">
                  <p className="font-medium text-ocean-800 text-center">Would you like to:</p>
                  {followUpQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleFollowUpAction(question.action, question.text)}
                      className="w-full p-4 text-left bg-white/70 hover:bg-white border border-ocean-200 rounded-xl transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-center gap-3">
                        {question.icon && <span className="text-2xl group-hover:scale-110 transition-transform">{question.icon}</span>}
                        <span className="text-ocean-800 font-medium">{question.text}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => {
                    setShowFollowUp(false)
                    openChatSidebar()
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-ocean-400 to-ocean-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with Naia 🐬 about today
                </button>

              <button
                onClick={() => setShowFollowUp(false)}
                  className="w-full px-4 py-2 text-muted-500 hover:text-ocean-800 transition-colors"
              >
                Close
              </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Naia Response Modal */}
      <AnimatePresence>
        {showAiResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !loadingResponse && setShowAiResponse(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-sand max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-ocean-600" />
                <h3 className="text-xl font-bold text-ocean-800">
                  <span className="font-handwriting text-2xl">Naia's Guidance 🐬</span>
                </h3>
              </div>

              {/* Question that was asked */}
              <div className="mb-4 p-3 bg-white/50 rounded-lg border border-ocean-200">
                <p className="text-sm font-medium text-ocean-600 mb-1">You asked:</p>
                <p className="text-ocean-800">{currentQuestion}</p>
              </div>

              {/* AI Response */}
              {loadingResponse ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-ocean-200 border-t-ocean-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-500">Generating personalized response...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-white/70 to-ocean-50/50 rounded-lg border border-ocean-200">
                    <p className="text-ocean-800 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-500">
                    <Sparkles className="w-3 h-3" />
                    <span>Guided by Naia 🐬 • Based on your journal and emotions</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                {!loadingResponse && (
                  <>
                    <button
                      onClick={() => {
                        setShowAiResponse(false)
                        setShowFollowUp(true)
                      }}
                      className="flex-1 px-4 py-2 border border-ocean-300 text-ocean-700 hover:bg-ocean-50 rounded-lg transition-colors"
                    >
                      ← Back to Questions
                    </button>
                    <button
                      onClick={() => setShowAiResponse(false)}
                      className="flex-1 btn-gradient"
                    >
                      Done
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Journaling Prompts */}
      {dailyPrompts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-blush-50 to-sand-50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-ocean-800">Today's Prompts</h3>
          </div>
          <p className="text-sm text-muted-500 mb-3">Need inspiration? Try one of these:</p>
          <div className="grid gap-2">
            {dailyPrompts.slice(0, 3).map((prompt, index) => (
              <motion.button
                key={index}
                onClick={() => setContent(content + (content ? '\n\n' : '') + prompt)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-left p-3 bg-white/60 hover:bg-white rounded-lg border border-ocean-200 hover:border-ocean-400 transition-all group"
              >
                <p className="text-sm text-ocean-700 group-hover:text-ocean-900">{prompt}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <ShellBadge icon="starfish" className="mb-0">Search & Filter</ShellBadge>
          {(searchQuery || filterEmotion || filterDate) && (
            <button
              onClick={handleClearSearch}
              className="text-sm text-ocean-600 hover:text-ocean-800 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        
        {/* Search Fields */}
        <div className="flex flex-col gap-4">
          {/* Keywords Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by keywords (e.g., happy, work, family)..."
              className="w-full pl-10 pr-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
            />
          </div>

          {/* Emotion and Date Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
              className="flex-1 px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
          >
            <option value="">All Emotions</option>
            {emotions.map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </option>
            ))}
          </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              placeholder="Filter by date"
              className="flex-1 px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200"
            />
            
            <button 
              onClick={handleSearch}
              className="btn-gradient whitespace-nowrap flex items-center gap-2 px-8"
            >
            <Search className="w-4 h-4" />
            Search
          </button>
          </div>
        </div>
        
        {/* Search Tips */}
        <div className="mt-3 text-xs text-muted-500">
          💡 Tip: Search by keywords, emotions, or dates. Results appear below. Press Enter to search quickly!
        </div>
      </motion.div>

      {/* Search Results - Separate Card */}
      {searchResults !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-ocean-50 to-white"
          id="search-results-section"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShellBadge icon="shell" className="mb-0">Search Results</ShellBadge>
            </div>
            <span className="text-sm font-medium text-ocean-700">
              {searchResults.length} {searchResults.length === 1 ? 'entry' : 'entries'} found
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-ocean-200 border-t-ocean-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-500">Searching your memories...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-muted-500 text-lg mb-2">No entries found</p>
              <p className="text-sm text-muted-500">Try different keywords or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white rounded-xl border border-ocean-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getMoodEmoji(entry.emotion)}</span>
                      <div>
                        <p className="font-bold text-ocean-800 capitalize text-lg">
                          {entry.emotion || 'Neutral'}
                        </p>
                        <p className="text-sm text-muted-500">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(entry.id)
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-muted-700 line-clamp-3 mt-3">
                    {entry.content}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Entries List - Only show when not searching */}
      {searchResults === null && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
          <ShellBadge icon="clam" className="mb-0">Past Entries</ShellBadge>
            </div>
            <div className="text-sm text-muted-500">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-ocean-200 border-t-ocean-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-500">Loading your memories...</p>
          </div>
        ) : entries.length > 0 ? (
          <>
          <div className="space-y-4">
              {(() => {
                // Determine which entries to show
                let entriesToShow = entries
                if (!showAllEntries) {
                  // Show only 3 most recent
                  entriesToShow = entries.slice(0, 3)
                } else {
                  // Show paginated entries (10 per page)
                  const startIndex = (currentPage - 1) * entriesPerPage
                  const endIndex = startIndex + entriesPerPage
                  entriesToShow = entries.slice(startIndex, endIndex)
                }

                return entriesToShow.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-white rounded-xl border border-ocean-200 hover:shadow-lg transition-all duration-200 group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                        <span className="text-3xl">{getMoodEmoji(entry.emotion)}</span>
                        <div>
                          <p className="font-bold text-ocean-800 capitalize text-lg">
                            {entry.emotion || 'Neutral'}
                          </p>
                          <p className="text-sm text-muted-500">
                            {formatDate(entry.created_at)}
                    </p>
                  </div>
                    </div>
                      
                      {/* Action buttons - show on hover */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(entry)
                          }}
                          className="p-2 text-ocean-500 hover:text-ocean-700 hover:bg-ocean-50 rounded-lg transition-colors"
                          title="Edit entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(entry.id)
                      }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                    
                    <p className="text-muted-700 line-clamp-2 mt-2 cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                      {entry.content}
                    </p>
              </motion.div>
                ))
              })()}
          </div>

            {/* See More / Pagination */}
            {!showAllEntries && entries.length > 3 ? (
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    setShowAllEntries(true)
                    setCurrentPage(1)
                  }}
                  className="btn-gradient px-6 py-2"
                >
                  See More ({entries.length - 3} more {entries.length - 3 === 1 ? 'entry' : 'entries'})
                </button>
              </div>
            ) : showAllEntries && entries.length > entriesPerPage ? (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-ocean-600 hover:bg-ocean-50'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {(() => {
                  const totalPages = Math.ceil(entries.length / entriesPerPage)
                  const pages = []
                  
                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 ||
                      i === totalPages ||
                      (i >= currentPage - 1 && i <= currentPage + 1)
                    ) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === i
                              ? 'bg-ocean-500 text-white'
                              : 'text-ocean-600 hover:bg-ocean-50'
                          }`}
                        >
                          {i}
                        </button>
                      )
                    } else if (
                      i === currentPage - 2 ||
                      i === currentPage + 2
                    ) {
                      pages.push(
                        <span key={i} className="px-2 text-muted-500">
                          ...
                        </span>
                      )
                    }
                  }
                  
                  return pages
                })()}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(entries.length / entriesPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(entries.length / entriesPerPage)}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === Math.ceil(entries.length / entriesPerPage)
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-ocean-600 hover:bg-ocean-50'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : null}

            {/* Show Less button */}
            {showAllEntries && (
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setShowAllEntries(false)
                    setCurrentPage(1)
                  }}
                  className="text-sm text-ocean-600 hover:text-ocean-800 font-medium"
                >
                  Show Less
                </button>
          </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-muted-500 text-lg">No entries found yet</p>
            <p className="text-muted-500 text-sm mt-2">Start your journaling journey today!</p>
          </div>
        )}
      </motion.div>
      )}

      {/* Edit Entry Modal */}
      <AnimatePresence>
        {editingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCancelEdit}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-sand max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Edit2 className="w-6 h-6 text-ocean-600" />
                  <h3 className="font-bold text-xl text-ocean-800">Edit Entry</h3>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-muted-500 hover:text-ocean-800 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{getMoodEmoji(editingEntry.emotion)}</span>
                  <div>
                    <p className="font-semibold text-ocean-800 capitalize">{editingEntry.emotion || 'Neutral'}</p>
                    <p className="text-sm text-muted-500">{formatDate(editingEntry.created_at)}</p>
                  </div>
                </div>

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[300px] p-4 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 resize-none"
                  placeholder="Edit your thoughts..."
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 text-muted-600 hover:text-ocean-800 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="btn-gradient px-6 py-2 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-sand max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">
                    {getMoodEmoji(selectedEntry.emotion)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-ocean-800 capitalize">{selectedEntry.emotion || 'Neutral'}</h3>
                    <p className="text-sm text-muted-500">
                      {formatDate(selectedEntry.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-muted-500 hover:text-ocean-800 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="prose max-w-none">
                <p className="text-ocean-800 whitespace-pre-wrap">
                  {selectedEntry.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Naia Chat Sidebar */}
      <AnimatePresence>
        {showChatSidebar && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ocean-800/20 backdrop-blur-sm z-40"
              onClick={closeChatSidebar}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 bottom-0 h-screen w-full md:w-96 bg-gradient-to-br from-white via-ocean-50/30 to-blush-50/30 backdrop-blur-xl shadow-2xl z-50 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex-shrink-0 p-4 border-b border-ocean-200 bg-white/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-ocean-600" />
                    <h3 className="font-bold text-lg text-ocean-800">Naia 🐬</h3>
                  </div>
                  <button
                    onClick={closeChatSidebar}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-500" />
                  </button>
                </div>
                <p className="text-xs text-muted-500 mt-1">Let's explore your thoughts together</p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-ocean-400 to-ocean-600 text-white' 
                        : 'bg-white/70 text-ocean-800 border border-ocean-200'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message.split('\n').map((line, i) => {
                          // Format markdown: **bold** and *italic* - fix for multiple occurrences
                          let formattedLine = line
                          // First handle bold (** **) to avoid conflict with italic
                          while (formattedLine.includes('**')) {
                            formattedLine = formattedLine.replace(/\*\*([^*]+?)\*\*/,  '<strong>$1</strong>')
                          }
                          // Then handle italic (* *)
                          while (formattedLine.includes('*') && !formattedLine.includes('**')) {
                            formattedLine = formattedLine.replace(/\*([^*]+?)\*/, '<em>$1</em>')
                          }
                          
                          return (
                            <p 
                              key={i} 
                              className={i > 0 ? 'mt-2' : ''}
                              dangerouslySetInnerHTML={{ __html: formattedLine }}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs opacity-70 mt-2">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
              </div>
            </motion.div>
                ))}
                
                {isChatTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/70 text-ocean-800 border border-ocean-200 px-4 py-3 rounded-2xl">
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
              <div className="flex-shrink-0 px-4 pt-4 pb-4 border-t border-ocean-200 bg-white/80 backdrop-blur-sm">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                    placeholder="Share your thoughts..."
                    className="flex-1 px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-ocean-400 transition-all duration-200 bg-white"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isChatTyping}
                    className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Journal

