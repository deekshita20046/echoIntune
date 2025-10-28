import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowDown, Heart, Brain, Target, Calendar, BookOpen, TrendingUp, Sparkles, Menu, X } from 'lucide-react'
import Wave from '../components/Wave'
import ShellBadge from '../components/ShellBadge'
import CustomIcon from '../components/CustomIcon'

const Landing = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' })
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const features = [
    {
      iconName: 'heart',
      title: 'Mood Tracking',
      description: 'Understand your emotions with intelligent analysis and beautiful visualizations.',
      color: 'from-blush-coral/80 to-blush-coral'
    },
    {
      iconName: 'journal',
      title: 'Smart Journaling',
      description: 'Write with handwriting-style fonts and get insights from Naia, your friendly dolphin guide.',
      color: 'from-ocean-midnight to-ocean-deep'
    },
    {
      iconName: 'calendar',
      title: 'Emotion-Aware Planning',
      description: 'Plan your day based on your mood with intelligent task suggestions.',
      color: 'from-aqua-soft to-turquoise-tide'
    },
    {
      iconName: 'compass',
      title: 'Meet Naia 🐬',
      description: 'Your friendly dolphin companion offering personalized insights and magical guidance for your mental wellness journey.',
      color: 'from-lavender-shell/80 to-lavender-shell'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus({ type: 'loading', message: '' })
    
    try {
      const response = await fetch('http://localhost:5002/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      })

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.' })
        setContactForm({ name: '', email: '', message: '' })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again later.' })
    }
  }

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-animated-gradient relative overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img 
              src="/logos/1.png" 
              alt="echo Intune" 
              className="h-16 w-auto object-contain scale-[2.5]"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Menu Dropdown */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 right-6 bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30"
          >
            <div className="space-y-4">
              <a href="#about" className="block text-ocean-800 hover:text-ocean-600 transition-colors">About</a>
              <a href="#features" className="block text-ocean-800 hover:text-ocean-600 transition-colors">Features</a>
              <a href="#faq" className="block text-ocean-800 hover:text-ocean-600 transition-colors">FAQ</a>
              <a href="#contact" className="block text-ocean-800 hover:text-ocean-600 transition-colors">Contact</a>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Section 1: Hero */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ y }}
      >
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <motion.img 
              src="/logos/3.png" 
              alt="echo: Intune" 
              className="h-64 md:h-80 w-auto object-contain mb-8 scale-[3] md:scale-[3.5]"
              style={{ transformOrigin: 'center' }}
              animate={{
                scale: [3, 3.1, 3],
                opacity: [1, 0.95, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/register"
              className="relative overflow-hidden px-10 py-5 rounded-full text-lg font-bold text-white transition-all duration-300 group shadow-lg hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #73C8D3 0%, #2B5E7B 100%)',
              }}
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping"></div>
              </div>
              
              {/* Content */}
              <span className="relative flex items-center gap-3">
                <span className="text-xl">🌊</span>
                <span>Dive In</span>
                <Sparkles className="w-5 h-5 group-hover:rotate-[360deg] transition-transform duration-500" />
              </span>
            </Link>
            <button
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-ocean-800 hover:bg-white/30 hover:border-white/50 font-medium transition-all duration-200"
            >
              Explore
            </button>
          </motion.div>
        </div>
      </motion.section>

      <Wave />

      {/* Section 2: About */}
      <section id="about" className="py-20 px-6 bg-sand-100 relative overflow-hidden">
        {/* Shell and Pearl Design Elements */}
        <motion.img 
          src="/design-elements/16.png" 
          alt=""
          className="absolute top-10 right-10 w-48 h-48 md:w-64 md:h-64 opacity-30 pointer-events-none"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.img 
          src="/design-elements/8.png" 
          alt=""
          className="absolute bottom-10 left-10 w-40 h-40 md:w-56 md:h-56 opacity-25 pointer-events-none"
          animate={{
            y: [0, -12, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <img src="/icons/26.png" alt="" className="w-8 h-8 scale-[8]" />
              <h2 className="text-4xl md:text-5xl font-cursive text-ocean-deep">
                All about
              </h2>
              <img 
                src="/logos/2.png" 
                alt="echo: Intune" 
                className="h-24 w-auto object-contain scale-[2]"
              />
            </div>
            <p className="text-xl text-muted-500 max-w-3xl mx-auto leading-relaxed">
              Welcome to your digital home where creativity feels calm and productivity feels personal. 
              Echo: Intune is more than just an app—it's your companion in understanding yourself better.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="card-sand">
                <ShellBadge icon="shell" className="mb-4">Your Personal Space</ShellBadge>
                <h3 className="text-2xl font-bold mb-4 text-ocean-800">A Cozy Digital Home</h3>
                <p className="text-muted-500 leading-relaxed">
                  Every feature is designed to feel warm and inviting. From the handwriting-style journal 
                  to the gentle mood tracking, everything is crafted to make you feel at home.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="card">
                <ShellBadge icon="starfish" className="mb-4">AI That Cares</ShellBadge>
                <h3 className="text-2xl font-bold mb-4 text-ocean-800">Emotion-Aware Intelligence</h3>
                <p className="text-muted-500 leading-relaxed">
                  Our AI doesn't just track your mood—it understands your patterns, suggests personalized 
                  activities, and helps you build better habits based on your emotional state.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Wave variant="inverted" />

      {/* Section 3: Features */}
      <section id="features" className="py-20 px-6 relative overflow-hidden">
        {/* Starfish and Coral Design Elements */}
        <motion.img 
          src="/design-elements/14.png" 
          alt=""
          className="absolute top-20 left-10 w-52 h-52 md:w-72 md:h-72 opacity-35 pointer-events-none"
          animate={{
            y: [0, -18, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.img 
          src="/design-elements/7.png" 
          alt=""
          className="absolute bottom-20 right-10 w-44 h-44 md:w-60 md:h-60 opacity-30 pointer-events-none"
          animate={{
            y: [0, -10, 0],
            rotate: [0, -12, 0],
          }}
          transition={{
            duration: 7.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/icons/25.png" alt="" className="w-8 h-8 scale-[8]" />
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="font-cursive text-5xl md:text-6xl">What you can do </span>
                <span className="text-ocean-midnight">here</span>
              </h2>
            </div>
            <p className="text-xl text-muted-500 max-w-3xl mx-auto">
              Simple illustrated guide for key features that make your daily life more mindful and productive.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center group cursor-pointer"
                onMouseEnter={() => setCurrentFeature(index)}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <CustomIcon name={feature.iconName} className="w-8 h-8 scale-[10]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-ocean-800">{feature.title}</h3>
                <p className="text-muted-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Wave />

      {/* Section 4: FAQ */}
      <section id="faq" className="py-20 px-6 relative overflow-hidden">
        {/* Seaweed and Coral Design Elements */}
        <motion.img 
          src="/design-elements/13.png" 
          alt=""
          className="absolute top-10 left-10 w-48 h-48 md:w-64 md:h-64 opacity-28 pointer-events-none"
          animate={{
            y: [0, -14, 0],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 8.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.img 
          src="/design-elements/5.png" 
          alt=""
          className="absolute bottom-10 right-10 w-44 h-44 md:w-60 md:h-60 opacity-32 pointer-events-none"
          animate={{
            y: [0, -16, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/icons/24.png" alt="" className="w-8 h-8 scale-[8]" />
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="font-cursive text-5xl md:text-6xl">Frequently Asked </span>
                <span className="text-ocean-midnight">Questions</span>
              </h2>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card"
            >
              <h3 className="text-xl font-bold mb-3 text-ocean-800">
                What is <span className="brand-echo">echo</span><span className="brand-intune">: Intune</span>?
              </h3>
              <p className="text-muted-500">
                <span className="brand-echo">echo</span><span className="brand-intune">: Intune</span> is an emotion-aware productivity platform that combines mood tracking, 
                journaling, habit tracking, and task planning with AI-powered insights to help you 
                understand yourself better and achieve your goals.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card"
            >
              <h3 className="text-xl font-bold mb-3 text-ocean-800">Is my data secure?</h3>
              <p className="text-muted-500">
                Yes! We take your privacy seriously. All your data is encrypted and stored securely. 
                Your journal entries and mood data are private and only visible to you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card"
            >
              <h3 className="text-xl font-bold mb-3 text-ocean-800">How does the AI work?</h3>
              <p className="text-muted-500">
                Our AI analyzes your mood patterns, journal entries, and activities to provide 
                personalized insights and suggestions. It learns from your data to help you make 
                better decisions about your daily routine and habits.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="card"
            >
              <h3 className="text-xl font-bold mb-3 text-ocean-800">Can I use it on mobile?</h3>
              <p className="text-muted-500">
                <span className="brand-echo">echo</span><span className="brand-intune">: Intune</span> is a progressive web app (PWA), which means it works great on any device 
                including mobile phones, tablets, and desktop computers. You can even install it on 
                your home screen for a native app experience.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Wave />

      {/* Section 5: Contact */}
      <section id="contact" className="py-20 px-6 bg-sand-100 relative overflow-hidden">
        {/* Wave and Shell Design Elements */}
        <motion.img 
          src="/design-elements/11.png" 
          alt=""
          className="absolute top-10 right-10 w-56 h-56 md:w-72 md:h-72 opacity-30 pointer-events-none"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 6, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.img 
          src="/design-elements/9.png" 
          alt=""
          className="absolute bottom-10 left-10 w-48 h-48 md:w-64 md:h-64 opacity-28 pointer-events-none"
          animate={{
            y: [0, -10, 0],
            rotate: [0, -7, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/icons/22.png" alt="" className="w-8 h-8 scale-[8]" />
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="font-cursive text-5xl md:text-6xl">Get in </span>
                <span className="text-ocean-midnight">Touch</span>
              </h2>
            </div>
            <p className="text-xl text-muted-500 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card max-w-2xl mx-auto"
          >
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ocean-800 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-800 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-800 mb-2">Message</label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  placeholder="How can we help you?"
                />
              </div>
              
              {submitStatus.message && submitStatus.type !== 'loading' && (
                <div className={`p-4 rounded-lg ${
                  submitStatus.type === 'success' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitStatus.type === 'loading'}
                className="w-full btn-gradient text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitStatus.type === 'loading' ? 'Sending...' : 'Send Message'}
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-sand-100 border-t border-ocean-200">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center gap-2">
            <img 
              src="/logos/1.png" 
              alt="echo: Intune" 
              className="h-12 w-auto object-contain scale-[2.5]"
            />
            <p className="text-muted-500">
              © 2025 Made with <Heart className="w-4 h-4 inline text-blush-coral" /> for your wellbeing
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing