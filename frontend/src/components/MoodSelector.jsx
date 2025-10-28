import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useMood } from '../contexts/MoodContext'

const MoodSelector = ({ isOpen, onClose, onMoodSelected }) => {
  const { getMoodEmoji } = useMood()
  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const moods = [
    { emotion: 'joy', label: 'Joyful', color: 'from-yellow-400 to-yellow-600' },
    { emotion: 'happy', label: 'Happy', color: 'from-green-400 to-green-600' },
    { emotion: 'excited', label: 'Excited', color: 'from-pink-400 to-pink-600' },
    { emotion: 'calm', label: 'Calm', color: 'from-blue-400 to-blue-600' },
    { emotion: 'neutral', label: 'Neutral', color: 'from-gray-400 to-gray-600' },
    { emotion: 'anxious', label: 'Anxious', color: 'from-purple-400 to-purple-600' },
    { emotion: 'sad', label: 'Sad', color: 'from-indigo-400 to-indigo-600' },
    { emotion: 'angry', label: 'Angry', color: 'from-red-400 to-red-600' },
    { emotion: 'fear', label: 'Fearful', color: 'from-orange-400 to-orange-600' },
  ]

  const handleSubmit = async () => {
    if (!selectedMood) return

    setSubmitting(true)
    try {
      await onMoodSelected(selectedMood, note)
      setSelectedMood(null)
      setNote('')
      onClose()
    } catch (error) {
      console.error('Failed to save mood:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedMood(null)
    setNote('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-ocean-400 to-ocean-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">How are you feeling today?</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Mood Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.emotion}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMood(mood.emotion)}
                      className={`
                        p-4 rounded-xl transition-all duration-200
                        ${
                          selectedMood === mood.emotion
                            ? `bg-gradient-to-br ${mood.color} shadow-lg ring-4 ring-ocean-200`
                            : 'bg-ocean-50 hover:bg-ocean-100'
                        }
                      `}
                    >
                      <div className="text-4xl mb-2">{getMoodEmoji(mood.emotion)}</div>
                      <p
                        className={`text-sm font-medium ${
                          selectedMood === mood.emotion ? 'text-white' : 'text-ocean-800'
                        }`}
                      >
                        {mood.label}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-2">
                    Add a note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="How are you feeling? What's on your mind?"
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 resize-none"
                    rows="3"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedMood || submitting}
                    className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Save Mood
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MoodSelector

