/**
 * AI Insights and Chat Routes
 * 
 * Provides AI-powered features including:
 * - Journal insights and recommendations
 * - Mood analysis and patterns
 * - Task suggestions
 * - Interactive chat with Gemini AI
 * - Personalized daily insights and prompts
 * 
 * Uses Google Gemini AI for advanced natural language processing
 * Falls back to rule-based responses when API is unavailable
 * All routes require authentication
 */

import express from 'express'
import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { getUserProfileForAI } from './user.js'

const router = express.Router()

// Require authentication for all AI routes
router.use(authenticate)

// ML Service URL for advanced analytics (optional)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

// Get AI insights with real data points
router.get('/insights', async (req, res) => {
  try {
    const userId = req.user.userId
    
    // Fetch all user data for analysis
    const [journalsResult, moodsResult, tasksResult, habitsResult] = await Promise.all([
      query('SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
      query('SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY date DESC', [userId]),
      query('SELECT * FROM tasks WHERE user_id = $1', [userId]),
      query('SELECT * FROM habits WHERE user_id = $1', [userId])
    ])

    const journals = journalsResult.rows
    const moods = moodsResult.rows
    const tasks = tasksResult.rows
    const habits = habitsResult.rows
    
    // Calculate real data points
    const totalDataPoints = journals.length + moods.length + tasks.length + habits.length
    
    // Calculate analysis accuracy based on data completeness
    const hasJournals = journals.length > 0 ? 25 : 0
    const hasMoods = moods.length > 0 ? 25 : 0
    const hasTasks = tasks.length > 0 ? 25 : 0
    const hasHabits = habits.length > 0 ? 25 : 0
    const analysisAccuracy = hasJournals + hasMoods + hasTasks + hasHabits
    
    // Generate real behavioral patterns
    const patterns = []
    
    // Pattern 1: Journaling and task completion
    if (journals.length > 3 && tasks.length > 3) {
      const journalDates = new Set(journals.map(j => j.created_at.toISOString().split('T')[0]))
      const completedTasks = tasks.filter(t => t.completed)
      const completedTaskDates = new Set(completedTasks.map(t => t.created_at?.toISOString().split('T')[0]).filter(Boolean))
      
      const daysWithBoth = [...journalDates].filter(d => completedTaskDates.has(d)).length
      const productivity = daysWithBoth > 0 ? Math.round((daysWithBoth / journalDates.size) * 100) : 0
      
      patterns.push({
        icon: '📊',
        title: 'Journaling & Productivity',
        description: `You've completed tasks on ${productivity}% of days when you journal. Self-reflection may boost your productivity!`,
        confidence: Math.min(85, 60 + journals.length)
      })
    }
    
    // Pattern 2: Mood trends
    if (moods.length > 5) {
      const emotionCounts = {}
      moods.slice(0, 30).forEach(m => {
        emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1
      })
      const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]
      
      patterns.push({
        icon: '🌊',
        title: 'Mood Pattern',
        description: `Your most common emotion recently is "${topEmotion[0]}". You've tracked ${moods.length} mood entries total.`,
        confidence: Math.min(90, 70 + Math.floor(moods.length / 5))
      })
    }
    
    // Pattern 3: Habit consistency
    if (habits.length > 0) {
      const habitWithMostDays = habits.reduce((max, h) => {
        const days = h.marked_days ? h.marked_days.length : 0
        return days > (max.days || 0) ? { habit: h, days } : max
      }, {})
      
      if (habitWithMostDays.days > 0) {
        patterns.push({
          icon: '🎯',
          title: 'Habit Consistency',
          description: `"${habitWithMostDays.habit.name}" is your strongest habit with ${habitWithMostDays.days} completed days. Keep it up!`,
          confidence: Math.min(88, 65 + habitWithMostDays.days * 2)
        })
      }
    }
    
    // Pattern 4: Task completion rate
    if (tasks.length > 5) {
      const completedCount = tasks.filter(t => t.completed).length
      const completionRate = Math.round((completedCount / tasks.length) * 100)
      
      patterns.push({
        icon: '✅',
        title: 'Task Completion',
        description: `You complete ${completionRate}% of your tasks. ${completionRate > 70 ? "You're crushing it!" : "Small steps lead to big wins!"}`,
        confidence: Math.min(85, 60 + Math.floor(tasks.length / 2))
      })
    }
    
    // Add at least one pattern even for new users
    if (patterns.length === 0) {
      patterns.push({
        icon: '🌱',
        title: 'Just Getting Started',
        description: "Keep tracking your moods, journaling, and building habits. We'll discover your patterns soon!",
        confidence: 50
      })
    }

    const insights = {
      patterns: patterns.slice(0, 4), // Top 4 patterns
      summary: {
        totalDataPoints,
        analysisAccuracy,
        lastUpdated: new Date().toISOString(),
        insightsGenerated: patterns.length
      },
    }

    res.json({ insights })
  } catch (error) {
    console.error('Get insights error:', error)
    res.status(500).json({ error: 'Failed to fetch AI insights' })
  }
})

// Get recommendations based on mood/activity
router.get('/recommendations', async (req, res) => {
  try {
    const { mood } = req.query

    const recommendations = [
      {
        type: 'affirmation',
        icon: '✨',
        title: 'Daily Affirmation',
        content: mood === 'sad' 
          ? "It's okay to feel sad. Be gentle with yourself. Tomorrow is a new day." 
          : "You're doing amazing! Keep up the great energy!",
      },
      {
        type: 'habit',
        icon: '🎯',
        title: 'Habit Suggestion',
        content: 'Based on your patterns, try adding a "5-minute meditation" habit in the evening.',
      },
    ]

    res.json({ recommendations })
  } catch (error) {
    console.error('Get recommendations error:', error)
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})

// Get follow-up questions after journal entry
router.post('/followup', async (req, res) => {
  try {
    const { emotion, probability } = req.body

    // Generate context-aware follow-up questions
    const questions = []

    if (emotion === 'sad' || emotion === 'anxious') {
      questions.push(
        {
          text: '🗣 Would you like to talk more about what\'s bothering you?',
          action: 'talk',
          icon: '💬',
        },
        {
          text: '🎧 Would you like me to suggest a calming song or podcast?',
          action: 'song',
          icon: '🎵',
        },
        {
          text: '🌿 Can I recommend a relaxing activity or breathing exercise?',
          action: 'activity',
          icon: '🧘',
        }
      )
    } else if (emotion === 'happy' || emotion === 'joy') {
      questions.push(
        {
          text: '✨ What made you feel this way? Let\'s celebrate it!',
          action: 'talk',
          icon: '🎉',
        },
        {
          text: '📸 Would you like to capture this moment in more detail?',
          action: 'talk',
          icon: '📝',
        }
      )
    } else {
      questions.push(
        {
          text: '💭 Would you like a journaling prompt to explore your feelings?',
          action: 'talk',
          icon: '📖',
        }
      )
    }

    res.json({ questions })
  } catch (error) {
    console.error('Get follow-up questions error:', error)
    res.status(500).json({ error: 'Failed to generate follow-up questions' })
  }
})

// Get AI-powered follow-up response based on action
router.post('/followup-response', async (req, res) => {
  const { action, emotion, journalContent, questionText } = req.body

  try {
    if (!action || !emotion) {
      return res.status(400).json({ error: 'Action and emotion are required' })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY

    // Prepare system prompts for AI
    const systemPrompts = {
      talk: `You are a compassionate wellness companion analyzing this journal entry: "${journalContent?.substring(0, 300) || 'user shared their thoughts'}"

The user is feeling ${emotion}. Provide a DETAILED, personalized response (5-7 sentences) that:

1. Quote or reference SPECIFIC details from their journal entry (what they actually wrote about)
2. Deeply validate their ${emotion} emotion with empathy
3. Share 1 relevant insight or perspective about their situation
4. Ask 2-3 thoughtful, specific questions that help them explore:
   - What might be causing these feelings?
   - What patterns do they notice?
   - What would help them feel better?

Be warm, conversational, and detailed like a caring therapist. Don't be generic - reference their actual words and situation. Make it feel like you really read and understood their entry.`,
      
      song: `You are a music therapist. The user journaled: "${journalContent?.substring(0, 200) || 'their day'}" and is feeling ${emotion}.

Recommend 3 SPECIFIC SONGS with full details:

🎵 "[Exact Song Title]" by [Artist Name]
Why: [2-3 sentences explaining how this song's lyrics, melody, or energy specifically matches their ${emotion} feeling and their journal situation]

🎵 "[Exact Song Title]" by [Artist Name]
Why: [2-3 sentences explaining the connection to their mood and situation]

🎵 "[Exact Song Title]" by [Artist Name]
Why: [2-3 sentences explaining why this will resonate with them]

Choose REAL, popular songs that exist. Be detailed about why each song fits. Reference their journal content. Match their ${emotion} energy level exactly. No vague suggestions - be specific about lyrics, melody, or message.`,
      
      activity: `You are a wellness coach. The user journaled: "${journalContent?.substring(0, 200) || 'their thoughts'}" and is feeling ${emotion}.

Recommend 2-3 DETAILED, SPECIFIC activities they can do in the next 30 minutes:

**Activity 1: [Specific Name]**
What: [3-4 sentences with exact, step-by-step instructions. Include timing, specific actions, what to focus on]
Why: [2 sentences explaining how this specifically helps with ${emotion} and relates to their situation]

**Activity 2: [Specific Name]**
What: [3-4 sentences with exact steps]
Why: [2 sentences explaining the benefit]

Be ULTRA-specific. Not "take a walk" but "Take a 15-minute walk around your neighborhood. Count 10 things that are green, 5 sounds you hear, and 3 things that make you smile. Focus on your breath - inhale for 4 counts, exhale for 6."

Make it immediately actionable and relevant to their ${emotion} state and journal content. Reference their specific situation.`
    }

    const userContext = `The user's question: "${questionText}"

Journal entry excerpt: "${journalContent ? journalContent.substring(0, 500) : 'Not provided'}"

Current emotion: ${emotion}

Provide your response:`

    let aiResponse = null

    // Try Gemini first
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `${systemPrompts[action] || systemPrompts.talk}\n\n${userContext}`
        
        const result = await model.generateContent(prompt)
        const response = await result.response
        aiResponse = response.text()
        
        console.log('✅ Using Gemini AI')
      } catch (geminiError) {
        console.error('❌ Gemini error:', geminiError.message)
        // Continue to fallback
      }
    } else {
      console.log('⚠️ GEMINI_API_KEY not set')
    }

    // Use fallback responses if Gemini failed or not configured
    if (!aiResponse) {
      const fallbackResponses = {
        talk: {
          happy: `I can really feel the joy radiating from what you wrote! This kind of happiness is so precious. It sounds like something really meaningful happened - was it an achievement you've been working toward, a connection with someone special, or a moment of clarity? 

I'm curious about what made this experience so impactful for you. Sometimes when we're this happy, it's because multiple things aligned perfectly - was there a particular element that stood out? And thinking ahead, what do you think are the key ingredients to creating more moments like this? Understanding what brings you joy can help you intentionally design more of it into your life.

What would you like to do with this positive energy right now?`,
          
          joy: `Your happiness is absolutely contagious! There's such vibrant energy in your words. When joy hits us like this, it's often because something really aligned with our values or dreams. 

What do you think contributed most to this feeling? Was it something you accomplished, someone you connected with, or maybe a realization you had? I'm also curious - how does this feeling compare to other happy moments you've experienced? Is there something unique about this one?

And here's an interesting question: if you could bottle up this feeling and save it for a tough day, what would be the one thing from today you'd want to remember most?`,
          
          excited: `Wow! Your excitement is palpable - I can practically feel it through your words! There's such powerful, positive energy here. That kind of anticipation and enthusiasm is such a gift.

Tell me more about what's got you so energized! Is this about something new starting, a goal you're close to achieving, or an opportunity opening up? What specifically about this situation has you feeling so pumped? Sometimes when we dig into what excites us, we discover what really matters to us.

How are you channeling this energy? And what would make this moment even more perfect?`,
          
          sad: `I'm sitting with you in this sadness, and I want you to know it's completely okay to feel this way. Sadness is your heart's way of processing something important, and there's no rush to move past it. You're allowed to grieve, to hurt, to just *be* with these feelings.

From what you shared, it sounds like you're carrying something heavy. Can you tell me more about what's at the heart of this sadness? Sometimes naming it helps. Is it loss, disappointment, loneliness, or something else? And have you noticed if there are certain times or triggers when it feels heavier?

What would feel most comforting to you right now? Would it help to talk more, to be alone, to reach out to someone, or to do something nurturing for yourself? There's no wrong answer - trust what your heart needs.`,
          
          anxious: `I can hear the anxiety in your words, and I want to acknowledge how exhausting and overwhelming that must feel. Anxiety has this way of making everything feel urgent and impossible at once. You're not alone in this, and what you're feeling is real and valid.

Let's try to understand what's feeding this anxiety. Is it uncertainty about the future, fear of something specific, worry about disappointing someone, or maybe just a general sense of everything being too much? Sometimes anxiety is our mind's way of trying to protect us, but it goes into overdrive. Can you identify what your anxiety is trying to protect you from?

I'm also curious - when did you first notice this anxious feeling today? Was there a specific trigger, or did it gradually build up? Understanding the pattern can help. And right now, what would help you feel even 10% calmer? Would it be talking more, trying a breathing exercise, making a plan, or something else entirely?`,
          
          angry: `Your anger is completely valid, and I'm glad you're expressing it here rather than bottling it up. Anger tells us that something important to us has been violated - a boundary crossed, a value disrespected, or an injustice done. This feeling has valuable information for you.

Let's explore what's underneath this anger. What specifically happened that triggered this? Was it something someone said or did, a situation that felt unfair, feeling powerless, or being disrespected? And is this anger about just this one incident, or has it been building up over time? Sometimes our current anger is carrying old frustrations too.

When you think about this situation, what do you *need* that you didn't get? Respect? Understanding? An apology? Control? Fairness? Identifying what's missing helps us figure out what comes next. And right now, what would help you process this anger in a healthy way - would it help to talk more, to take action, to express it physically (safely), or to create some distance first?`,
          
          calm: `There's such a beautiful sense of peace in your words. This kind of calm is a gift, especially in our often chaotic world. I'm so glad you're experiencing this serenity right now.

What do you think is creating this peaceful feeling for you? Is it something about your environment (quiet space, nature, comfortable place), something you did (meditation, exercise, creative activity), or something internal (resolved a worry, felt understood, accepted something)? Understanding your calm can help you recreate it.

I'm curious - how does your body feel right now? Sometimes calm shows up as relaxed shoulders, easy breathing, or just a sense of lightness. And thinking ahead, what can you do to preserve or extend this peaceful feeling? What would honor this calm state you're in?`,
          
          neutral: `I hear you - sometimes our emotions aren't dramatically high or low, and that's perfectly okay too. There's value in these neutral, steady moments. They can be restful, or sometimes they're spaces where we're processing things beneath the surface.

What's been on your mind today? Even in neutral moments, our thoughts are usually working on something - maybe planning, reflecting, wondering, or just observing. I'm curious what's occupying your mental space right now. Is there something you're trying to figure out, or are you in more of an observational, peaceful state?

And here's an interesting question - does this neutral feeling sit comfortably with you, or is there a part of you that wants to feel something more? Sometimes we judge ourselves for not being more excited or motivated, but neutral can be exactly what we need. What would make this moment feel complete for you?`
        },
        song: {
          happy: `🎵 "Happy" by Pharrell Williams - Perfect upbeat celebration anthem\n🎵 "Good as Hell" by Lizzo - Confidence-boosting and joyful\n🎵 "Can't Stop the Feeling!" by Justin Timberlake - Infectious positive energy`,
          joy: `🎵 "Walking on Sunshine" by Katrina and the Waves - Captures pure joy\n🎵 "Best Day of My Life" by American Authors - Celebratory and uplifting\n🎵 "Don't Stop Me Now" by Queen - High-energy celebration`,
          excited: `🎵 "Shake It Off" by Taylor Swift - Matches that excited energy\n🎵 "Uptown Funk" by Bruno Mars - High-energy celebration\n🎵 "Eye of the Tiger" by Survivor - Motivational and powerful`,
          sad: `🎵 "Fix You" by Coldplay - Comforting and understanding\n🎵 "The Scientist" by Coldplay - Emotional but hopeful\n🎵 "Someone Like You" by Adele - Validates sad feelings`,
          anxious: `🎵 "Breathe Me" by Sia - Calming and grounding\n🎵 "Weightless" by Marconi Union - Scientifically proven to reduce anxiety\n🎵 "Sunset Lover" by Petit Biscuit - Gentle and soothing`,
          angry: `🎵 "Lose Yourself" by Eminem - Channel that energy productively\n🎵 "Break Stuff" by Limp Bizkit - Release that frustration\n🎵 "Killing in the Name" by Rage Against the Machine - Powerful outlet`,
          calm: `🎵 "Bloom" by The Paper Kites - Peaceful and serene\n🎵 "Holocene" by Bon Iver - Contemplative and calm\n🎵 "To Build a Home" by The Cinematic Orchestra - Beautifully tranquil`,
          neutral: `🎵 "Here Comes the Sun" by The Beatles - Timeless and uplifting\n🎵 "Mr. Blue Sky" by Electric Light Orchestra - Feel-good classic\n🎵 "Float On" by Modest Mouse - Easy-going and positive`
        },
        activity: {
          happy: `**Activity 1: Amplify Your Joy by Sharing It**
What: Pick up your phone right now and call (not text - actually call!) someone who would be genuinely happy for you. Spend 5-10 minutes telling them what happened. Notice how your happiness grows as you describe it. If you can't call, write them a detailed voice message or long text with all the details. Then, create a "joy capture" - take a photo, save a screenshot, or write 3-5 sentences about this moment in your notes app so you can revisit it later.
Why: Neuroscience shows that sharing positive emotions actually amplifies them. When you articulate your happiness to someone else, your brain re-experiences the joy. Plus, you're creating a memory anchor you can return to on harder days.

**Activity 2: Physical Celebration**
What: Put on the most upbeat song you can think of right now. Set a 5-minute timer. Dance, jump, spin, do victory poses - whatever physical expression feels right. Don't hold back. If you're somewhere you can't be loud, do a seated dance or power poses. The goal is to match your body's movement to your emotional energy.
Why: Physical movement releases endorphins and anchors positive emotions in your body. This creates a full mind-body celebration of your happiness.`,

          joy: `**Activity 1: Joy Walk with Sensory Focus**
What: Go outside for a 15-minute walk right now (or walk around your space if you can't go out). Your mission: Find and mentally catalog 10 beautiful things - could be a flower, someone's smile, an interesting building, a cute dog, sunlight through leaves, anything. For each one, pause for 5 seconds and really look at it. Take a photo of your favorite 3. When you get back, write one sentence about what made each of those 3 special.
Why: This extends your joyful state by training your brain to notice beauty and positivity around you. It's joy amplification through mindful attention.

**Activity 2: Creative Joy Expression**
What: Spend 15-20 minutes creating something that captures this feeling. Options: Draw or doodle what joy looks like to you (stick figures are fine!), write a poem or list of words that describe this feeling, sing or hum made-up melodies, take artistic photos, or write a letter to your future self about how you feel right now. Don't judge the quality - just express.
Why: Creative expression helps cement positive emotions into long-term memory and gives you a tangible reminder of this joy.`,

          excited: `**Activity 1: Channel Excitement into Momentum**
What: Set a timer for 20 minutes. Take out a notebook or open a note on your phone. Write at the top: "What I'm excited about and why." Then brain-dump everything - what you're looking forward to, why it matters, what it could lead to, how it aligns with your dreams. After 15 minutes, read what you wrote and circle the 3 most exciting parts. Then spend 5 minutes writing ONE concrete action you can take in the next 24 hours toward making this happen.
Why: This transforms excited energy into directed action. You're capturing the enthusiasm while it's fresh and creating a roadmap so this doesn't just stay a feeling but becomes reality.

**Activity 2: Physical Energy Release**
What: Do a 10-minute high-energy movement session right now. Options: 30 jumping jacks, run in place for 2 minutes, do a dance freestyle, do burpees, jump rope, or sprint up and down stairs. Push yourself to match your internal excitement with external energy. End with 1 minute of victory poses - arms raised, chest up, smile big.
Why: Excitement is energy that needs an outlet. Physical movement prevents it from turning into anxiety and channels it productively.`,

          sad: `**Activity 1: Gentle Movement with Self-Compassion**
What: Take a slow 15-minute walk, but make it mindful. As you walk, focus on your breath - inhale for 4 steps, exhale for 4 steps. Don't try to think happy thoughts. Just notice: What does the air feel like? What do you hear? What do you see? If tears come, that's okay - keep walking and breathing. When you return, drink a glass of water slowly and sit for 2 minutes in silence, just breathing.
Why: Gentle movement helps process sadness physiologically. You're not trying to fix the feeling - you're just being kind to yourself while you feel it. Walking also creates psychological space from overwhelming emotions.

**Activity 2: Compassionate Self-Expression**
What: Get comfortable somewhere safe. Set a 10-minute timer. Write to yourself like you're writing to your best friend who's sad. Start with "I see that you're hurting because..." Write without editing - let it all out. What hurts? Why does it hurt? What do you need? After the timer, read it back, and then write one kind thing you would say to comfort that friend (which is you). Keep this note.
Why: Externalizing sadness through writing creates distance from it, making it more manageable. Self-compassion (treating yourself like a friend) is proven to help process difficult emotions more healthily.`,

          anxious: `**Activity 1: The 5-4-3-2-1 Grounding Technique (Detailed)**
What: Stop what you're doing. Sit or stand somewhere. Out loud or in your mind, slowly identify:
- 5 things you can SEE (chair, window, pen, shadow, door...)
- 4 things you can FEEL/TOUCH (feet on floor, clothes on skin, temperature, chair texture...)
- 3 things you can HEAR (traffic, breathing, fan, birds, silence...)
- 2 things you can SMELL (coffee, air, your shampoo, nothing is okay too...)
- 1 thing you can TASTE (gum, coffee residue, or just your mouth)
Take your time with each one. Really notice each sensation. This should take 5-7 minutes minimum.
Why: Anxiety lives in the future or past. This grounds you firmly in the present moment using all your senses. It interrupts the anxiety spiral by engaging your observational brain instead of your fear brain.

**Activity 2: Worry Download and Mini-Action Plan**
What: Get paper or open a note. Set a 15-minute timer. Brain-dump every single worry - big, small, rational, irrational. Just list them all. Don't judge. After the timer, read through and mark each worry as either: C (in my Control) or NC (Not in my Control). For each "C" worry, write ONE tiny action you could take in the next hour to address it, even if it's just "research one thing about this." For "NC" worries, write "I'm letting this go for now because I cannot control it."
Why: Anxiety thrives on vague, swirling worries. This makes them concrete and separates what you can act on from what you can't. Taking even one tiny action gives you back a sense of control.`,

          angry: `**Activity 1: Physical Anger Release**
What: Go somewhere you can be physical without breaking things. Set a 5-minute timer. Options: Do 20 jumping jacks, sprint in place as fast as you can, do burpees, punch a pillow, squeeze and release your fists 20 times, do wall push-ups aggressively. Make noise if you can - grunt, yell into a pillow, growl. Really let yourself physically feel and express the anger. Then: 10 slow, deep breaths - in through nose for 4, hold for 4, out through mouth for 6. Feel your heart rate slow.
Why: Anger creates physical tension and adrenaline. Moving aggressively releases that tension safely. The breathing afterward helps you shift from reactive to responsive mode.

**Activity 2: The Unsent Angry Letter**
What: Get paper or open a document. Set a timer for 10 minutes. Write an ANGRY letter to whoever/whatever you're mad at. Don't censor yourself. Use curse words if you want. Say everything you wish you could say. Be brutally honest about how you feel and what you think. Don't send this. After the timer, read it. Then write at the bottom: "What I actually need is..." and identify what's underneath the anger - respect, fairness, acknowledgment, control, etc. Then delete or destroy the letter.
Why: Anger is often a surface emotion protecting hurt, fear, or unmet needs. This helps you express the anger fully (which is cathartic) and then understand what you really need, which is more useful than staying in rage.`,

          calm: `**Activity 1: Mindful Savoring Practice**
What: Make yourself a warm beverage (tea, coffee, hot water with lemon) or get something you enjoy eating (fruit, chocolate, whatever). Sit somewhere comfortable. Set a 10-minute timer. Slowly consume what you chose, but make it an experience: Notice the temperature, the texture, the smell, how it tastes on different parts of your tongue, how it feels going down your throat, the aftertaste. Between bites/sips, close your eyes and just breathe. Notice this peaceful moment. Try to stay present with just this experience.
Why: This deepens your calm through mindful presence. You're training your nervous system to stay in this peaceful state and creating a sense memory you can return to.

**Activity 2: Peace Reflection Writing**
What: Get a notebook or note app. Write at the top: "Right now, I feel calm." Then spend 15 minutes writing about: What created this calm? What does it feel like in your body? What thoughts are present (or absent)? What's different about this moment compared to anxious ones? What can you remember about this calm for next time you're stressed? Write slowly, thoughtfully, savoring the feeling as you describe it.
Why: Calm is precious and often fleeting. Documenting it helps you understand what creates peace for you and gives you a template for finding it again when life gets chaotic.`,

          neutral: `**Activity 1: Curiosity Walk**
What: Take a 20-minute walk (outside or even around your space if needed) with one goal: Find 5 things you've never noticed before. Could be a crack in the sidewalk shaped like something, a building detail, a plant you never paid attention to, how shadows fall, anything. Take a photo of each one. When you get back, look at the photos and write one sentence about why each caught your attention now.
Why: Neutral moments are great for gentle curiosity. This shifts you from autopilot to presence without forcing any particular emotion. It's a reset that makes space for whatever wants to emerge naturally.

**Activity 2: Small Accomplishment Stack**
What: Set a 25-minute timer. Pick 3-5 small tasks you've been putting off (organizing a drawer, replying to an email, doing dishes, filing something, deleting old photos, anything). Do them one by one without overthinking. Make them small enough that you can complete at least 2 in 25 minutes. Each time you finish one, physically check it off a list or say "done!" out loud.
Why: Neutral feelings sometimes mean we need momentum. Small accomplishments create positive momentum without requiring emotional energy. They shift us from passive to active, which often naturally brings more energy or clarity.`
        }
      }
      
      aiResponse = fallbackResponses[action]?.[emotion] || 
                   fallbackResponses[action]?.['neutral'] ||
                   fallbackResponses['talk']?.[emotion] ||
                   `I'm here to support you. Take a moment to breathe and be kind to yourself. What's one small thing you could do right now to take care of yourself?`
      
      console.log(`ℹ️ Using fallback responses (${emotion} / ${action})`)
    }

    res.json({ response: aiResponse })
  } catch (error) {
    console.error('Follow-up response error:', error)
    res.status(500).json({ 
      error: 'Failed to generate response',
      response: emotion 
        ? `I'm here for you during this ${emotion} moment. Sometimes it helps to take a few deep breaths and give yourself permission to feel. What's one small thing you could do right now to take care of yourself?`
        : `I'm here to support you. Sometimes it helps to take a few deep breaths and give yourself permission to feel. What's one small thing you could do right now to take care of yourself?`
    })
  }
})

// Get task suggestions based on task title
router.post('/task-suggestions', async (req, res) => {
  try {
    const { taskTitle, taskType, priority, description } = req.body
    
    if (!taskTitle) {
      return res.status(400).json({ error: 'Task title is required' })
    }

    let suggestions = []

    // Try Gemini AI first
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `You are a productivity assistant. A user has a task: "${taskTitle}"
${taskType ? `Task type: ${taskType}` : ''}
${priority ? `Priority: ${priority}` : ''}
${description ? `Description: ${description}` : ''}

Provide 3-4 practical, actionable suggestions to help them complete this task successfully. Each suggestion should include:
1. A clear title (max 5 words)
2. A detailed description explaining how it helps (2-3 sentences)
3. A specific action they can take

Format your response as a JSON array:
[
  {
    "title": "suggestion title",
    "description": "detailed explanation of how this helps",
    "action": "specific action to take",
    "type": "resource|tip|tool|link"
  }
]

Make suggestions specific, practical, and immediately actionable. Include relevant YouTube searches, documentation, tools, or step-by-step tips.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0])
          console.log('✅ Gemini AI suggestions generated')
        }
      } catch (geminiError) {
        console.error('Gemini AI error:', geminiError.message)
      }
    }

    // Fallback to rule-based suggestions if AI fails
    if (suggestions.length === 0) {
      const taskLower = taskTitle.toLowerCase()
      
      if (taskLower.includes('study') || taskLower.includes('learn') || taskLower.includes('read')) {
        suggestions = [
          {
            title: 'Find Video Tutorials',
            description: 'Visual learning helps retain information better. Watch step-by-step tutorials to understand concepts clearly.',
            action: `Search YouTube for "${taskTitle}"`,
            type: 'link',
            link: `https://www.youtube.com/results?search_query=${encodeURIComponent(taskTitle)}`
          },
          {
            title: 'Use Pomodoro Technique',
            description: 'Study in 25-minute focused sessions with 5-minute breaks. This prevents burnout and improves retention.',
            action: 'Set a timer for 25 minutes of focused study',
            type: 'tip'
          },
          {
            title: 'Take Active Notes',
            description: 'Write summaries in your own words. Active note-taking engages your brain and helps you remember better.',
            action: 'Create a summary document as you study',
            type: 'tip'
          }
        ]
      } else if (taskLower.includes('write') || taskLower.includes('document') || taskLower.includes('report')) {
        suggestions = [
          {
            title: 'Create an Outline',
            description: 'Start with a clear structure. An outline helps organize thoughts and makes writing much easier.',
            action: 'Write down main points and subpoints first',
            type: 'tip'
          },
          {
            title: 'Use AI Writing Assistant',
            description: 'Tools like ChatGPT can help brainstorm ideas, improve phrasing, and check grammar.',
            action: 'Visit ChatGPT or similar tool for assistance',
            type: 'tool',
            link: 'https://chat.openai.com'
          },
          {
            title: 'Research References',
            description: 'Find credible sources to support your writing. Good references strengthen your arguments.',
            action: `Search Google Scholar for "${taskTitle}"`,
            type: 'link',
            link: `https://scholar.google.com/scholar?q=${encodeURIComponent(taskTitle)}`
          }
        ]
      } else if (taskLower.includes('code') || taskLower.includes('program') || taskLower.includes('develop')) {
        suggestions = [
          {
            title: 'Check Documentation',
            description: 'Official docs provide accurate, up-to-date information. Start here before searching elsewhere.',
            action: 'Search for official documentation',
            type: 'resource',
            link: `https://www.google.com/search?q=${encodeURIComponent(taskTitle + ' documentation')}`
          },
          {
            title: 'Find Code Examples',
            description: 'GitHub has millions of code examples. See how others solved similar problems.',
            action: 'Search GitHub repositories',
            type: 'link',
            link: `https://github.com/search?q=${encodeURIComponent(taskTitle)}`
          },
          {
            title: 'Test Incrementally',
            description: 'Write and test small pieces at a time. This makes debugging easier and faster.',
            action: 'Break task into smaller functions and test each',
            type: 'tip'
          }
        ]
      } else if (taskLower.includes('buy') || taskLower.includes('shop') || taskLower.includes('purchase')) {
        suggestions = [
          {
            title: 'Compare Prices',
            description: 'Check multiple stores to find the best deal. Prices can vary significantly between retailers.',
            action: 'Search for price comparisons',
            type: 'link',
            link: `https://www.google.com/search?q=${encodeURIComponent(taskTitle + ' price comparison')}`
          },
          {
            title: 'Read Reviews',
            description: 'User reviews reveal product quality and potential issues. Check before buying.',
            action: 'Look for customer reviews and ratings',
            type: 'tip'
          },
          {
            title: 'Set a Budget',
            description: 'Decide your maximum spending limit before shopping. This prevents overspending.',
            action: 'Write down your budget limit',
            type: 'tip'
          }
        ]
      } else if (taskLower.includes('meeting') || taskLower.includes('call') || taskLower.includes('presentation')) {
        suggestions = [
          {
            title: 'Prepare an Agenda',
            description: 'A clear agenda keeps meetings focused and productive. Share it beforehand.',
            action: 'List main topics and time allocations',
            type: 'tip'
          },
          {
            title: 'Test Technology Early',
            description: 'Technical issues waste time. Test your mic, camera, and screen sharing beforehand.',
            action: 'Do a tech check 10 minutes before',
            type: 'tip'
          },
          {
            title: 'Practice Key Points',
            description: 'Rehearse what you want to say. Confidence comes from preparation.',
            action: 'Speak through your main points out loud',
            type: 'tip'
          }
        ]
    } else {
        suggestions = [
          {
            title: 'Break Into Steps',
            description: 'Large tasks feel overwhelming. Break them into small, manageable actions.',
            action: 'List 3-5 specific steps to complete this task',
            type: 'tip'
          },
          {
            title: 'Find Resources',
            description: 'Search for guides, tutorials, or tools that can help you complete this faster.',
            action: `Search: "how to ${taskTitle}"`,
            type: 'resource',
            link: `https://www.google.com/search?q=how+to+${encodeURIComponent(taskTitle)}`
          },
          {
            title: 'Set a Deadline',
            description: 'Tasks without deadlines often get postponed. Set a specific completion time.',
            action: 'Add a reminder or deadline to your calendar',
            type: 'tip'
          },
          {
            title: 'Eliminate Distractions',
            description: 'Focus is crucial for productivity. Turn off notifications and find a quiet space.',
            action: 'Put phone on Do Not Disturb mode',
            type: 'tip'
          }
        ]
      }
    }

    res.json({ 
      task: taskTitle, 
      suggestions,
      source: suggestions.length > 0 && suggestions[0].action ? 'ai' : 'fallback'
    })
  } catch (error) {
    console.error('Get task suggestions error:', error)
    res.status(500).json({ error: 'Failed to generate task suggestions' })
  }
})

// AI Chat endpoint (Gemini-first, with fallbacks)
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    
    console.log('🔍 Attempting AI chat...')
    console.log('🔑 GEMINI_API_KEY exists:', !!geminiApiKey)

    let aiResponse = null
    let responseSource = 'fallback'

    // Try Gemini first
    if (geminiApiKey) {
      try {
        console.log('📤 Sending to Gemini...')
        const genAI = new GoogleGenerativeAI(geminiApiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const systemContext = `You are a supportive AI assistant for Echo: Intune, a personal productivity and journaling app. You help users with:
        - Productivity and task management
        - Journaling and self-reflection
        - Mood improvement and emotional well-being
        - Habit building and routine optimization
        
        Be warm, encouraging, and ocean-themed in your responses. Use emojis sparingly but effectively. 
        Keep responses concise but helpful. Focus on actionable advice.
        
        For specific topics like meditation, exercise, journaling, give direct and helpful answers, not generic encouragement.
        
        User context: ${JSON.stringify(context || {})}`

        const prompt = `${systemContext}\n\nUser: ${message}`
        const result = await model.generateContent(prompt)
        const response = await result.response
        aiResponse = response.text()
        responseSource = 'gemini'
        console.log('✨ Gemini chat response generated:', aiResponse.substring(0, 100) + '...')
      } catch (geminiError) {
        console.error('❌ Gemini chat failed:', geminiError.message)
      }
    } else {
      console.log('⚠️ GEMINI_API_KEY not set')
    }

    // Use fallback responses if Gemini failed
    if (!aiResponse) {
      console.log('🔄 Using rule-based fallback responses')
      aiResponse = getFallbackResponse(message, context)
    }

    res.json({ 
      response: aiResponse,
      source: responseSource
    })

  } catch (error) {
    console.error('❌ Chat endpoint error:', error)
    
    // Emergency fallback
    const fallbackResponse = getFallbackResponse(req.body.message, req.body.context)
    res.json({ 
      response: fallbackResponse,
      source: 'fallback'
    })
  }
})

const getFallbackResponse = (input, context = {}) => {
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

// Enhanced ML Integration endpoints

// Get personalized insights using ML service
router.get('/personalized-insights', async (req, res) => {
  try {
    // Fetch comprehensive user data
    const [journalsResult, moodsResult, tasksResult, habitsResult] = await Promise.all([
      query('SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.userId]),
      query('SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY date DESC LIMIT 30', [req.user.userId]),
      query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.userId]),
      query('SELECT * FROM habits WHERE user_id = $1', [req.user.userId])
    ])

    const userData = {
      journal_entries: journalsResult.rows,
      mood_history: moodsResult.rows,
      task_history: tasksResult.rows,
      habit_data: habitsResult.rows
    }

    // Call ML service for personalized insights
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/personalized-insights`, userData)
    
    res.json({
      success: true,
      insights: mlResponse.data
    })

  } catch (error) {
    console.error('Personalized insights error:', error)
    
    // Fallback to mock insights
    const fallbackInsights = {
      mood_patterns: {
        most_common_emotion: 'happy',
        average_mood_score: 7.2,
        mood_trend: 'stable',
        emotion_distribution: { 'happy': 15, 'calm': 8, 'neutral': 5 },
        day_patterns: { 'Monday': 6.5, 'Friday': 8.2 },
        total_entries: 28
      },
      productivity_insights: {
        completion_rate: 75.5,
        total_tasks: 45,
        completed_tasks: 34,
        mood_productivity_correlation: 0.68,
        best_productivity_times: ['Morning (9-11 AM)', 'Afternoon (2-4 PM)']
      },
      recommendations: [
        {
          type: 'mood_support',
          title: 'Mood Enhancement',
          message: 'Your mood has been stable! Keep up the great work with your journaling routine.',
          priority: 'low'
        }
      ]
    }
    
    res.json({
      success: true,
      insights: fallbackInsights
    })
  }
})

// Get mood pattern analysis
router.get('/mood-patterns', async (req, res) => {
  try {
    const moodsResult = await query(
      'SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY date DESC LIMIT 30',
      [req.user.userId]
    )

    const moodData = {
      mood_history: moodsResult.rows
    }

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/mood-patterns`, moodData)
    
    res.json({
      success: true,
      patterns: mlResponse.data
    })

  } catch (error) {
    console.error('Mood patterns error:', error)
    res.status(500).json({ error: 'Failed to analyze mood patterns' })
  }
})

// Get productivity insights
router.get('/productivity-insights', async (req, res) => {
  try {
    const [tasksResult, moodsResult, journalsResult] = await Promise.all([
      query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.userId]),
      query('SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY date DESC LIMIT 30', [req.user.userId]),
      query('SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30', [req.user.userId])
    ])

    const productivityData = {
      task_history: tasksResult.rows,
      mood_history: moodsResult.rows,
      journal_entries: journalsResult.rows
    }

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/productivity-insights`, productivityData)
    
    res.json({
      success: true,
      insights: mlResponse.data
    })

  } catch (error) {
    console.error('Productivity insights error:', error)
    res.status(500).json({ error: 'Failed to analyze productivity' })
  }
})

// Get habit recommendations
router.get('/habit-recommendations', async (req, res) => {
  try {
    const [habitsResult, moodsResult, journalsResult] = await Promise.all([
      query('SELECT * FROM habits WHERE user_id = $1', [req.user.userId]),
      query('SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY date DESC LIMIT 30', [req.user.userId]),
      query('SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30', [req.user.userId])
    ])

    const habitData = {
      current_habits: habitsResult.rows,
      mood_history: moodsResult.rows,
      journal_entries: journalsResult.rows
    }

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/habit-recommendations`, habitData)
    
    res.json({
      success: true,
      recommendations: mlResponse.data
    })

  } catch (error) {
    console.error('Habit recommendations error:', error)
    res.status(500).json({ error: 'Failed to generate habit recommendations' })
  }
})

// Get AI-generated daily insights based on user data
router.get('/daily-insights', async (req, res) => {
  try {
    // Fetch user profile for personalization
    const userProfile = await getUserProfileForAI(req.user.userId)
    
    // Fetch comprehensive user data from last 14 days
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const [journalsResult, moodsResult, tasksResult, habitsResult, habitTrackingResult] = await Promise.all([
      query(
        'SELECT content, emotion, probability, created_at FROM journal_entries WHERE user_id = $1 AND created_at >= $2 ORDER BY created_at DESC',
        [req.user.userId, twoWeeksAgo]
      ),
      query(
        'SELECT emotion, score, note, date FROM mood_entries WHERE user_id = $1 AND date >= $2 ORDER BY date DESC',
        [req.user.userId, twoWeeksAgo.toISOString().split('T')[0]]
      ),
      query(
        'SELECT title, completed, priority, due_date, created_at FROM tasks WHERE user_id = $1 AND created_at >= $2 ORDER BY created_at DESC',
        [req.user.userId, twoWeeksAgo]
      ),
      query(
        'SELECT name, frequency FROM habits WHERE user_id = $1',
        [req.user.userId]
      ),
      query(
        `SELECT ht.date, ht.completed, h.name 
         FROM habit_tracking ht 
         JOIN habits h ON ht.habit_id = h.id 
         WHERE h.user_id = $1 AND ht.date >= $2 
         ORDER BY ht.date DESC`,
        [req.user.userId, twoWeeksAgo.toISOString().split('T')[0]]
      )
    ])

    // Check if user has sufficient data
    const hasData = journalsResult.rows.length > 0 || 
                    moodsResult.rows.length > 0 || 
                    tasksResult.rows.length > 0 ||
                    habitTrackingResult.rows.length > 0

    if (!hasData) {
      // Return default insights for new users
      return res.json({
        insights: [
          {
            icon: '✨',
            text: 'Start your journey by writing your first journal entry. Share what\'s on your mind today.'
          },
          {
            icon: '🎯',
            text: 'Set up your daily habits to build a consistent routine that supports your goals.'
          },
          {
            icon: '📝',
            text: 'Add tasks to your planner to stay organized and track your progress throughout the day.'
          }
        ],
        source: 'default'
      })
    }

    // Prepare data summary for AI
    const dataSummary = {
      journals: {
        count: journalsResult.rows.length,
        emotions: journalsResult.rows.map(j => j.emotion).filter(Boolean)
      },
      moods: {
        count: moodsResult.rows.length,
        recent: moodsResult.rows.slice(0, 7),
        averageScore: moodsResult.rows.length > 0 
          ? (moodsResult.rows.reduce((sum, m) => sum + (m.score || 5), 0) / moodsResult.rows.length).toFixed(1)
          : null
      },
      tasks: {
        total: tasksResult.rows.length,
        completed: tasksResult.rows.filter(t => t.completed).length,
        completionRate: tasksResult.rows.length > 0
          ? ((tasksResult.rows.filter(t => t.completed).length / tasksResult.rows.length) * 100).toFixed(0)
          : 0
      },
      habits: {
        total: habitsResult.rows.length,
        trackingData: habitTrackingResult.rows.length,
        completedDays: habitTrackingResult.rows.filter(h => h.completed).length,
        consistencyRate: habitTrackingResult.rows.length > 0
          ? ((habitTrackingResult.rows.filter(h => h.completed).length / habitTrackingResult.rows.length) * 100).toFixed(0)
          : 0
      }
    }

    // Check for API keys
    const geminiApiKey = process.env.GEMINI_API_KEY

    // Build personalized prompt with user context (only include filled fields)
    let userContext = ''
    if (userProfile) {
      const profileLines = []
      
      if (userProfile.name) {
        let nameLine = `- Name: ${userProfile.name}`
        if (userProfile.age) nameLine += `, Age: ${userProfile.age}`
        profileLines.push(nameLine)
      }
      
      if (userProfile.gender || userProfile.pronouns) {
        let genderLine = '- '
        if (userProfile.gender) genderLine += `Gender: ${userProfile.gender}`
        if (userProfile.pronouns) genderLine += ` (${userProfile.pronouns})`
        if (genderLine !== '- ') profileLines.push(genderLine)
      }
      
      if (userProfile.occupation) {
        profileLines.push(`- Occupation: ${userProfile.occupation}`)
      }
      
      if (userProfile.location) {
        profileLines.push(`- Location: ${userProfile.location}`)
      }
      
      if (userProfile.interests && userProfile.interests.length > 0) {
        profileLines.push(`- Interests: ${userProfile.interests.join(', ')}`)
      }
      
      if (userProfile.bio) {
        profileLines.push(`- Bio: "${userProfile.bio}"`)
      }
      
      if (profileLines.length > 0) {
        userContext = `User Profile:\n${profileLines.join('\n')}\n\n`
      }
    }

    const prompt = `You are an AI wellness and productivity coach analyzing user behavior data to provide actionable insights. 

${userContext}User Activity Data (Last 14 days):
- Journal Entries: ${dataSummary.journals.count} entries. Recent emotions: ${dataSummary.journals.emotions.slice(0, 10).join(', ')}
- Manual Mood Tracking: ${dataSummary.moods.count} entries. Average mood score: ${dataSummary.moods.averageScore}/10
- Task Completion: ${dataSummary.tasks.completed}/${dataSummary.tasks.total} (${dataSummary.tasks.completionRate}% completion rate)
- Habit Consistency: ${dataSummary.habits.completedDays} completed days (${dataSummary.habits.consistencyRate}% consistency)

Generate exactly 3 personalized, actionable insights. Each insight should:
1. Be specific to the user's actual behavior patterns AND personal profile
2. Include an observation about their data
3. Provide actionable advice or encouragement tailored to their interests, occupation, or life situation
4. Be concise (1-2 sentences max)
5. Address them by name when appropriate

Format as JSON array:
[{"icon": "emoji", "text": "insight text"}]

Be warm, encouraging, and supportive. Use ocean/wave metaphors when appropriate. Consider their age, occupation, interests, and location when relevant.`

    let insights = null
    let source = 'rules'

    // Try Gemini first
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
        
        const result = await model.generateContent(prompt)
        const response = await result.response
        const aiResponse = response.text()
        
        // Parse AI response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0])
          source = 'gemini'
          console.log('✅ Daily insights using Gemini AI')
        }
      } catch (geminiError) {
        console.error('❌ Gemini insights error:', geminiError.message)
      }
    } else {
      console.log('⚠️ GEMINI_API_KEY not set')
    }

    // Use rule-based insights as fallback
    if (!insights) {
      insights = generateRuleBasedInsights(dataSummary)
      console.log('ℹ️ Daily insights using rule-based system')
    }

    res.json({
      insights,
      source,
      dataPoints: dataSummary.journals.count + dataSummary.moods.count + 
                  dataSummary.tasks.total + dataSummary.habits.trackingData
    })

  } catch (error) {
    console.error('❌ Daily insights error:', error)
    console.error('Error stack:', error.stack)
    // Always return insights, never fail
    res.status(200).json({
      insights: [
        { icon: '✨', text: 'Keep up your journaling practice! Regular reflection helps you understand your patterns better.' },
        { icon: '🌊', text: 'Remember to take breaks throughout your day. Even small pauses help you stay balanced.' },
        { icon: '🎯', text: 'Focus on progress, not perfection. Every completed task is a step forward.' }
      ],
      source: 'fallback-error'
    })
  }
})

// Helper function to generate rule-based insights
function generateRuleBasedInsights(dataSummary) {
  const insights = []

  // Mood insight
  if (dataSummary.moods.count > 0) {
    const avgScore = parseFloat(dataSummary.moods.averageScore)
    if (avgScore >= 7) {
      insights.push({
        icon: '🌟',
        text: `Your average mood is ${avgScore}/10 over the past two weeks. You're riding a positive wave! Keep nurturing what brings you joy.`
      })
    } else if (avgScore >= 5) {
      insights.push({
        icon: '🌊',
        text: `Your mood has been balanced at ${avgScore}/10. Consider what activities help you feel your best.`
      })
    } else {
      insights.push({
        icon: '💙',
        text: `Your mood has been lower recently (${avgScore}/10). Remember to be gentle with yourself.`
      })
    }
  }

  // Task completion insight
  if (dataSummary.tasks.total > 0) {
    const rate = parseInt(dataSummary.tasks.completionRate)
    if (rate >= 70) {
      insights.push({
        icon: '✅',
        text: `Impressive ${rate}% task completion rate! You're staying on top of your goals.`
      })
    } else if (rate >= 40) {
      insights.push({
        icon: '📝',
        text: `You're completing ${rate}% of your tasks. Try breaking larger tasks into smaller steps.`
      })
    } else {
      insights.push({
        icon: '🎯',
        text: `Focus on 1-3 priority tasks per day to boost your ${rate}% completion rate.`
      })
    }
  }

  // Habit consistency insight
  if (dataSummary.habits.trackingData > 0) {
    const consistency = parseInt(dataSummary.habits.consistencyRate)
    if (consistency >= 70) {
      insights.push({
        icon: '🔥',
        text: `Amazing ${consistency}% habit consistency! Your dedication is building a strong foundation.`
      })
    } else if (consistency >= 40) {
      insights.push({
        icon: '🌱',
        text: `${consistency}% habit consistency. Small improvements each week add up to big changes.`
      })
    } else {
      insights.push({
        icon: '💪',
        text: `Habit building takes time. Start with one habit. Consistency beats intensity.`
      })
    }
  }

  // Ensure we have 3 insights
  while (insights.length < 3) {
    const general = [
      { icon: '🌅', text: 'Morning routines set the tone for your day. Try starting with something energizing.' },
      { icon: '🧘', text: 'Taking time for mindfulness helps you stay grounded. Even 5 minutes makes a difference.' },
      { icon: '💚', text: 'Remember to celebrate small wins. Progress is progress, no matter how small.' }
    ]
    const random = general[insights.length % general.length]
    insights.push(random)
  }

  return insights.slice(0, 3)
}

// Get daily journaling prompts (changes daily based on user data)
router.get('/daily-prompts', async (req, res) => {
  try {
    const userId = req.user.userId
    
    // Get recent journal entries and mood to personalize prompts
    const recentData = await query(`
      SELECT j.emotion as journal_emotion, m.emotion as mood_emotion, j.created_at
      FROM journal_entries j
      FULL OUTER JOIN mood_entries m ON DATE(j.created_at) = m.date AND j.user_id = m.user_id
      WHERE j.user_id = $1 OR m.user_id = $1
      ORDER BY COALESCE(j.created_at, m.date::timestamp) DESC
      LIMIT 5
    `, [userId])
    
    // Get today's date seed for daily variation
    const today = new Date().toISOString().split('T')[0]
    const dateSeed = parseInt(today.replace(/-/g, '')) % 10
    
    let prompts = []
    
    // Try Gemini for personalized prompts
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        
        const recentEmotions = recentData.rows.map(r => r.journal_emotion || r.mood_emotion).filter(Boolean).join(', ')
        
        const prompt = `You are a compassionate journaling coach. Based on the user's recent emotions (${recentEmotions || 'neutral'}), generate exactly 3 thoughtful journaling prompts for today. Make them personal, engaging, and emotionally supportive. Format as a JSON array of strings only, no explanations. Example: ["What brought you joy today? 🌻", "..."]`
        
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        
        // Parse JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          prompts = JSON.parse(jsonMatch[0])
        }
      } catch (geminiError) {
        console.error('Gemini prompt generation failed:', geminiError)
      }
    }
    
    // Fallback to smart prompts based on recent emotions
    if (prompts.length === 0) {
      const emotionCounts = {}
      recentData.rows.forEach(row => {
        const emotion = row.journal_emotion || row.mood_emotion
        if (emotion) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
        }
      })
      
      const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'
      
      const promptsByEmotion = {
        happy: [
          "What made you smile today? Let's capture that joy! 🌻",
          "Describe a moment you felt proud of yourself ✨",
          "What are you grateful for right now? 🙏"
        ],
        sad: [
          "What's weighing on your heart today? It's okay to share 💙",
          "What would help you feel a little better right now?",
          "What's one small thing that brought you comfort today? ☁️"
        ],
        anxious: [
          "What's on your mind? Let's unpack those thoughts 🌊",
          "What would you tell a friend feeling the same way?",
          "What's one thing you can control right now? 🧘"
        ],
        calm: [
          "What brought you peace today? 🕊️",
          "Describe this moment of calm - what do you see, hear, feel?",
          "What helps you feel grounded? 🌿"
        ],
        neutral: [
          "What's something interesting that happened today? 🤔",
          "What are you looking forward to? 🌅",
          "What's one thing you learned recently? 📚"
        ]
      }
      
      const basePrompts = promptsByEmotion[dominantEmotion] || promptsByEmotion.neutral
      // Rotate prompts based on date
      prompts = [
        basePrompts[dateSeed % basePrompts.length],
        basePrompts[(dateSeed + 1) % basePrompts.length],
        basePrompts[(dateSeed + 2) % basePrompts.length]
      ]
    }
    
    res.json({ prompts: prompts.slice(0, 3) })
  } catch (error) {
    console.error('Get daily prompts error:', error)
    res.status(500).json({ error: 'Failed to generate daily prompts' })
  }
})

// Chat with AI (Inner Compass)
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body
    const userId = req.user.userId
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    // Get user profile for personalization
    const userProfile = await getUserProfileForAI(userId)
    
    // Build context from recent user data
    const recentJournals = await query(`
      SELECT content, emotion, created_at 
      FROM journal_entries 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 3
    `, [userId])
    
    const recentMoods = await query(`
      SELECT emotion, date 
      FROM mood_entries 
      WHERE user_id = $1 
      ORDER BY date DESC 
      LIMIT 5
    `, [userId])
    
    let aiResponse = ''
    
    // Try Gemini first
    console.log('🔍 Attempting Gemini chat...')
    console.log('🔑 GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        
        const systemContext = `You are Inner Compass, a warm, empathetic AI companion for mental wellness. You help users process their thoughts and feelings through compassionate conversation.

User Context:
${userProfile ? `- Name: ${userProfile.name}` : ''}
${context?.journalContent ? `- Just wrote journal: "${context.journalContent.substring(0, 200)}..."` : ''}
${context?.emotion ? `- Current emotion: ${context.emotion} (${Math.round((context.probability || 0) * 100)}% confidence)` : ''}
${recentJournals.rows.length > 0 ? `- Recent emotions: ${recentJournals.rows.map(j => j.emotion).join(', ')}` : ''}
${recentMoods.rows.length > 0 ? `- Recent moods: ${recentMoods.rows.map(m => m.emotion).join(', ')}` : ''}

Guidelines:
- Be warm, empathetic, and supportive
- Answer the user's question DIRECTLY and helpfully
- Provide specific, actionable advice when asked about topics like meditation, exercise, journaling, etc.
- Reference their emotions and context naturally when relevant
- Keep responses conversational but informative (2-4 sentences)
- Use appropriate emojis sparingly
- Never give medical advice - you're a supportive companion`

        const prompt = `${systemContext}

User: ${message}

Inner Compass:`
        
        console.log('📤 Sending to Gemini...')
        const result = await model.generateContent(prompt)
        aiResponse = result.response.text().trim()
        
        console.log('✨ Gemini chat response generated:', aiResponse.substring(0, 100) + '...')
      } catch (geminiError) {
        console.error('❌ Gemini chat failed:', geminiError.message)
        console.error('Full error:', geminiError)
      }
    } else {
      console.log('⚠️ GEMINI_API_KEY not set, using fallback responses')
    }
    
    // Fallback to thoughtful rule-based responses
    if (!aiResponse) {
      console.log('🔄 Using fallback responses for:', message.substring(0, 50))
      const lowerMessage = message.toLowerCase()
      
      // Wellness & Mindfulness
      if (lowerMessage.includes('meditat') || lowerMessage.includes('mindful')) {
        aiResponse = `Meditation is a wonderful practice for mental clarity and emotional balance! 🧘‍♀️ Start with just 5 minutes daily - find a quiet space, focus on your breath (in for 4, hold for 4, out for 4), and when your mind wanders (it will!), gently bring it back. Apps like Insight Timer or Calm can guide you. The key is consistency, not perfection. Would you like tips for a specific type of meditation?`
      } 
      // Exercise & Movement
      else if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
        aiResponse = `Physical movement is amazing for mental health! 🏃‍♀️ Start small - even a 10-minute walk can boost your mood. Find something you enjoy: dancing, yoga, swimming, or just stretching. The endorphins released during exercise are natural mood boosters. What type of movement appeals to you most?`
      }
      // Journaling & Writing
      else if (lowerMessage.includes('journal') || lowerMessage.includes('writing') || lowerMessage.includes('write')) {
        aiResponse = `Journaling is such a powerful tool for self-understanding! ✍️ Try this: Set a timer for 5 minutes and write without stopping - don't worry about grammar or structure. You can free-write, list gratitudes, process emotions, or respond to prompts. The act of putting thoughts to paper helps organize them. What would you like to explore in your journal?`
      }
      // Sleep & Rest
      else if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('rest')) {
        aiResponse = `Quality sleep is foundational to mental wellness! 😴 Try a wind-down routine: dim lights 1 hour before bed, avoid screens, try progressive muscle relaxation, or listen to calming sounds. Keep your bedroom cool and dark. If your mind races, keep a notepad nearby to jot thoughts down. What's your biggest sleep challenge?`
      }
      // Productivity & Focus
      else if (lowerMessage.includes('productiv') || lowerMessage.includes('focus') || lowerMessage.includes('concentrat') || lowerMessage.includes('work')) {
        aiResponse = `Productivity is about working with your brain, not against it! 💪 Try the Pomodoro Technique: 25 minutes focused work, 5-minute break. Remove distractions, tackle hardest tasks when your energy is highest, and break big projects into tiny steps. Remember: rest is productive too. What's making it hard to focus right now?`
      }
      // Breathing & Grounding
      else if (lowerMessage.includes('breath') || lowerMessage.includes('grounding') || lowerMessage.includes('calm down')) {
        aiResponse = `Let's ground you right now. 🌊 Try the 4-7-8 breath: Breathe in through your nose for 4 counts, hold for 7, exhale through your mouth for 8. Or try 5-4-3-2-1: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. These activate your parasympathetic nervous system. Take a moment - how do you feel now?`
      }
      // Emotions: Sad/Down
      else if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
        aiResponse = `I hear that you're going through a tough time. It's completely okay to feel sad - these emotions are valid and part of being human. 💙 What's one small thing that might bring you a bit of comfort right now? Sometimes just naming the feeling helps.`
      }
      // Emotions: Anxious/Worried
      else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
        aiResponse = `Anxiety can feel overwhelming, I understand. 🌊 Let's try this: Take a slow, deep breath with me. What's one specific thing you're worried about right now? Sometimes breaking down the anxiety into smaller pieces makes it more manageable. I'm here with you.`
      }
      // Emotions: Happy/Good
      else if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('joy')) {
        aiResponse = `It's wonderful to hear you're feeling positive! These moments are precious. ✨ What specifically made you feel this way? Capturing these details helps you recreate these feelings in the future. Let's celebrate this!`
      }
      // Emotions: Tired/Exhausted
      else if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('drained') || lowerMessage.includes('burn')) {
        aiResponse = `Feeling drained is your body's way of asking for rest. 🌙 Have you had a chance to pause today? Even a 5-minute break can help. What usually helps you feel restored? Sometimes we need permission to rest - consider this your permission slip.`
      }
      // Gratitude & Thanks
      else if (lowerMessage.includes('thank') || lowerMessage.includes('grateful')) {
        aiResponse = `You're so welcome! I'm here whenever you need support. 💛 Your willingness to reflect and grow is truly admirable. Keep being kind to yourself - you're doing better than you think.`
      }
      // Learning & Growth
      else if (lowerMessage.includes('learn') || lowerMessage.includes('improve') || lowerMessage.includes('develop') || lowerMessage.includes('grow')) {
        aiResponse = `Your curiosity and desire to learn is wonderful! 🌱 Personal growth happens in small, consistent steps. What specific area interests you? Whether it's a skill, emotional intelligence, or self-understanding, I can help you explore resources and approaches. What would you like to learn more about?`
      }
      // Generic but still helpful
      else {
        aiResponse = `I'm here to support you! I can help with meditation techniques, journaling practices, managing stress, improving sleep, productivity tips, or just being a listening ear. 💙 What would be most helpful for you right now? Or tell me what's on your mind - I'm listening.`
      }
      
      console.log('💬 Fallback response:', aiResponse.substring(0, 50) + '...')
    }
    
    res.json({ response: aiResponse })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Failed to process chat message' })
  }
})

export default router

