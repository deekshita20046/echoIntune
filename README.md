# 🌊 echo:Intune

> *A smart, emotionally-aware journaling and productivity platform with a beautiful ocean theme*

![echo:Intune](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen)

---

## 📖 Overview

**echo:Intune** is a comprehensive personal productivity and wellness application that combines **AI-powered emotion detection**, **smart task management**, **habit tracking**, and **mood analytics** into one cohesive, beautifully designed platform.

Built with modern web technologies and featuring a serene "Cozy Coastal Home" ocean theme, echo:Intune helps users:
- 📝 **Journal** their thoughts with AI emotion analysis
- 🎯 **Track habits** with mood correlation insights
- ✅ **Manage tasks** with intelligent scheduling
- 📊 **Visualize moods** through elegant charts
- 🤖 **Get AI insights** personalized to their patterns

---

## ✨ Key Features

### 🏠 **Personalized Dashboard**
- Time-based greetings (morning/afternoon/evening)
- Ocean-themed daily quotes and tips
- Quick action buttons to all features
- Today's mood analysis at a glance
- Recent journal reflections

### 📖 **Intelligent Journaling**
- **AI Emotion Detection**: Automatically detect emotions (joy, sad, angry, anxious, etc.)
- **Handwriting Font**: Diary-like experience with Caveat font
- **AI Follow-Up Questions**: Context-aware prompts after each entry
- **Search & Filter**: Find entries by date or emotion
- **Mood Tracking**: All entries linked to emotional state

### 📅 **Advanced Planner**
- **Three-Tab Layout**:
  - **Today**: Focus on today's tasks
  - **This Week**: Weekly overview
  - **Full Calendar**: Monthly calendar with task management
- Priority levels (high, medium, low)
- Due date tracking
- Task completion with smooth animations

### 🎯 **Habit Tracker**
- Create and track daily/weekly habits
- **Cute Mood Meters**: Visual indicators showing how habits affect mood
- Streak tracking and statistics
- Monthly progress calendar
- Personalized mood-linked feedback

### 📊 **Mood Dashboard**
- Interactive charts (line, pie, bar)
- Mood trends over time
- Day-of-week patterns
- Mood heatmap calendar
- Detailed breakdown and insights

### 🤖 **AI Insights ("Your Smart Friend")**
- **GPT-Powered Chat**: Natural conversations about productivity and mood
- Personalized recommendations based on user data
- Habit suggestions tailored to mood patterns
- Productivity analysis and tips
- Affirmations and journaling prompts

### 👤 **User Profile**
- Avatar selection (12 ocean-themed options)
- Personal statistics dashboard
- Account management
- Progress tracking

### 🔐 **Secure Authentication**
- Traditional email/password login
- **OAuth Integration**: Google and GitHub sign-in
- Forgot password with email reset
- JWT-based authentication
- Secure session management

---

## 🛠 Tech Stack

### Frontend
- **React** 18 + **Vite** - Fast, modern development
- **Tailwind CSS** - Utility-first styling with custom ocean theme
- **Framer Motion** - Smooth animations and transitions
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing
- **Date-fns** - Date manipulation
- **Recharts/Chart.js** - Data visualization
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** + **Express** - RESTful API server
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Passport.js** - OAuth strategies
- **Express Session** - Session management

### ML Service
- **Python** + **Flask** - Machine learning API
- **scikit-learn** - Emotion detection models
- **NumPy** & **Pandas** - Data processing
- **Custom Insights Engine** - Personalized analytics

### AI Integration
- **Google Gemini AI** - Intelligent conversations and personalized insights
- **Custom NLP Model** - Emotion classification
- **Pattern Recognition** - User behavior analysis

---

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
cd echointunee
chmod +x fresh-setup.sh
./fresh-setup.sh
```

The script will:
- ✅ Verify all prerequisites
- ✅ Create PostgreSQL database `ECHO-intune`
- ✅ Initialize complete schema (7 tables)
- ✅ Set up all permissions for user `deekshita`
- ✅ Update environment files automatically
- ✅ Install all dependencies

### Manual Setup

See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for detailed step-by-step instructions.

### Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - ML Service:**
```bash
cd ml-service
source venv/bin/activate
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

**Open Browser:**
```
http://localhost:3000
```

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[FRESH_START_GUIDE.md](FRESH_START_GUIDE.md)** - Fresh database setup guide
- **[DATABASE_SETUP_SUMMARY.md](DATABASE_SETUP_SUMMARY.md)** - Database structure overview
- **[GEMINI_SETUP_GUIDE.md](GEMINI_SETUP_GUIDE.md)** - AI configuration guide
- **[TEST_GUIDE.md](TEST_GUIDE.md)** - Comprehensive testing guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[DOCUMENTATION_SUMMARY.md](DOCUMENTATION_SUMMARY.md)** - All docs overview

---

## 🎨 Design Philosophy

### Ocean Theme - "Cozy Coastal Home"
Echo: Intune features a carefully crafted design system inspired by the ocean:

**Color Palette:**
- 🌊 **Ocean Blues** (50-800): Primary colors for UI elements
- 🏖️ **Sand Tones** (100-300): Warm, neutral backgrounds
- 🐚 **Shell Accents** (500): Highlights and badges
- 💗 **Blush Touches** (300): Gentle emotional cues

**Typography:**
- **Satoshi** - Headings and UI elements
- **DM Sans** - Body text and content
- **Caveat** - Handwriting effect for journal entries

**Animations:**
- Slow, organic transitions (520-1100ms)
- Natural easing curves
- "Breathing" idle animations
- Wave-based transitions
- Respects `prefers-reduced-motion`

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt with 12 salt rounds
- ✅ **SQL Injection Protection** - Parameterized queries
- ✅ **CORS Configuration** - Controlled cross-origin access
- ✅ **Input Validation** - Express-validator middleware
- ✅ **Session Security** - Secure, HTTP-only cookies
- ✅ **OAuth 2.0** - Industry-standard authentication

---

## 📊 Database Schema

**Database:** `ECHO-intune`  
**User:** `deekshita`  
**Tables:** 7 complete tables

```sql
users (with profile fields)
├── id (PK)
├── username, name, email (unique)
├── password (hashed), avatar
├── google_id (OAuth)
├── reset_token, reset_token_expires
├── Profile: gender, birthday, bio, pronouns
├── Profile: timezone, occupation, location, interests
└── timestamps

journal_entries
├── id (PK), user_id (FK)
├── content, emotion, probability
├── all_emotions (JSONB)
└── timestamps

mood_entries (manual tracking)
├── id (PK), user_id (FK)
├── emotion, score (1-10), note
├── date (UNIQUE per user), probability
└── timestamps

tasks (enhanced planner)
├── id (PK), user_id (FK)
├── title, description, priority
├── completed, due_date
├── task_type (todo/goal/reminder)
├── reminder_time, is_important, notes
└── timestamps

habits
├── id (PK), user_id (FK)
├── name, icon, frequency, color
└── timestamps

habit_tracking
├── id (PK), habit_id (FK)
├── date (UNIQUE per habit), completed
└── created_at

contact_messages
├── id (PK)
├── name, email, message
├── status, email_sent
└── timestamps
```

**Setup:** Use `backend/config/fresh-init.sql` for complete initialization

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Journal
- `GET /api/journal` - Get all entries
- `POST /api/journal` - Create entry (with AI emotion detection)
- `GET /api/journal/:id` - Get specific entry
- `DELETE /api/journal/:id` - Delete entry

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle completion

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `POST /api/habits/:id/track` - Mark habit for date
- `DELETE /api/habits/:id` - Delete habit

### Moods
- `GET /api/moods` - Get mood entries
- `POST /api/moods` - Create mood entry
- `GET /api/moods/stats` - Get mood statistics

### AI
- `GET /api/ai/insights` - Get AI insights
- `POST /api/ai/chat` - Chat with AI
- `GET /api/ai/personalized-insights` - Advanced ML insights
- `GET /api/ai/mood-patterns` - Mood pattern analysis
- `GET /api/ai/productivity-insights` - Productivity analysis
- `GET /api/ai/habit-recommendations` - Habit suggestions

### ML Service
- `POST /api/detect-emotion` - Detect emotion from text
- `POST /api/batch-detect` - Batch emotion detection
- `POST /api/personalized-insights` - Generate insights
- `POST /api/mood-patterns` - Analyze mood patterns
- `POST /api/productivity-insights` - Productivity analysis
- `POST /api/habit-recommendations` - Habit recommendations

---

## 🧪 Testing

### Run Automated Tests
```bash
# Backend API tests
cd backend
node test-api.js

# Frontend tests (coming soon)
cd frontend
npm test

# ML Service tests
cd ml-service
pytest
```

### Manual Testing
See **[TEST_GUIDE.md](TEST_GUIDE.md)** for comprehensive testing checklist.

---

## 📦 Project Structure

```
echointunee/
│
├── backend/                 # Node.js API
│   ├── config/             # Database & OAuth config
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API endpoints
│   └── server.js           # Express server
│
├── ml-service/             # Python ML API
│   ├── app.py              # Flask server
│   ├── emotion_detector.py # NLP model
│   └── personalized_insights.py # Analytics engine
│
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/          # Page components
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
│
├── quick-setup.sh          # Automated setup script
├── SETUP_GUIDE.md          # Setup instructions
├── TEST_GUIDE.md           # Testing guide
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

---

## 🎯 Roadmap

### Phase 1 ✅ (Completed)
- Core features (Journal, Planner, Habits, Moods)
- AI emotion detection
- Ocean theme implementation
- Authentication system
- OAuth integration
- GPT chat integration
- Advanced ML insights

### Phase 2 🚧 (Planned)
- [ ] Mobile app (React Native / Expo)
- [ ] Real-time notifications
- [ ] Social features (share achievements)
- [ ] Advanced data export
- [ ] Voice journaling
- [ ] AI voice assistant

### Phase 3 💭 (Future)
- [ ] Collaborative features
- [ ] Professional therapist integration
- [ ] Advanced ML models
- [ ] Predictive mood analysis
- [ ] Integration with fitness trackers

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google** - Gemini AI for intelligent conversations and personalized insights
- **scikit-learn** - Machine learning library for emotion detection
- **Framer Motion** - Beautiful animations
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library
- **PostgreSQL** - Reliable database

---

## 📧 Contact

**Deekshita**
- Project: Echo: Intune
- Institution: B-Uni, Final Year
- Purpose: AI/ML Skills Showcase

---

## 🌟 Features Showcase

### For Recruiters & Professors

This project demonstrates:

**AI/ML Skills:**
- ✅ Natural Language Processing (emotion detection)
- ✅ Pattern recognition (mood trends)
- ✅ Predictive analytics (habit recommendations)
- ✅ GPT integration
- ✅ Custom ML pipeline

**Full-Stack Development:**
- ✅ RESTful API design
- ✅ Database design & optimization
- ✅ Authentication & authorization
- ✅ Microservices architecture
- ✅ Real-time data processing

**Modern Web Technologies:**
- ✅ React + Vite
- ✅ Tailwind CSS + custom design system
- ✅ Framer Motion animations
- ✅ Progressive Web App (PWA)
- ✅ Responsive design

**Software Engineering:**
- ✅ Clean code architecture
- ✅ Documentation
- ✅ Testing strategy
- ✅ DevOps practices
- ✅ Security best practices

---

## 🎓 Academic Context

**Course:** Final Year Project
**Focus:** AI/ML in Personal Productivity
**Technologies:** React, Node.js, Python, PostgreSQL, scikit-learn, GPT
**Highlights:**
- Real-world application of ML concepts
- End-to-end full-stack development
- Modern UI/UX design principles
- Production-ready codebase

---

## 📊 Statistics

- **Lines of Code:** ~15,000+
- **Components:** 30+
- **API Endpoints:** 40+
- **ML/AI Models:** Google Gemini + custom emotion detection
- **Database Tables:** 7 (consolidated schema)
- **Test Coverage:** Comprehensive manual & automated tests
- **Documentation:** 15+ comprehensive guides

---

## 🌊 Why "Echo: Intune"?

The name reflects the core philosophy:
- **Echo** - Your thoughts and emotions reflected back to you
- **Intune** - Being in harmony with your inner self, like the ocean's rhythm

The ocean theme represents:
- 🌊 **Calm** - Finding peace in daily chaos
- 🐚 **Natural** - Organic, comfortable user experience
- 🏖️ **Warm** - Friendly, approachable interface
- ✨ **Fluid** - Smooth, flowing interactions

---

**Built with ❤️ and 🌊 by Deekshita**

*Happy Journaling! 📝✨*