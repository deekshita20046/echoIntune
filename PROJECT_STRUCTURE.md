# Echo: Intune - Project Structure

Complete overview of the project architecture and file organization.

## 📁 Directory Structure

```
echointunee/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js           # Service worker
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── MoodIcon.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── contexts/       # React Context providers
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── MoodContext.jsx      # Mood data and helpers
│   │   ├── pages/          # Page components
│   │   │   ├── Landing.jsx          # Landing page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── Journal.jsx          # Journal with AI
│   │   │   ├── MoodDashboard.jsx    # Mood analytics
│   │   │   ├── Planner.jsx          # Calendar + Tasks
│   │   │   ├── HabitTracker.jsx     # Habit tracking
│   │   │   ├── AIInsights.jsx       # AI recommendations
│   │   │   └── Profile.jsx          # User profile
│   │   ├── utils/          # Utility functions
│   │   │   ├── api.js              # API client
│   │   │   └── helpers.js          # Helper functions
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   ├── postcss.config.js   # PostCSS config
│   ├── package.json        # Dependencies
│   └── .eslintrc.cjs       # ESLint config
│
├── backend/                 # Node.js/Express API
│   ├── config/
│   │   ├── database.js     # PostgreSQL connection
│   │   └── init-db.sql     # Database schema
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── journal.js      # Journal CRUD
│   │   ├── mood.js         # Mood analytics
│   │   ├── tasks.js        # Task management
│   │   ├── habits.js       # Habit tracking
│   │   ├── ai.js           # AI features
│   │   └── user.js         # User profile
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   └── Dockerfile          # Docker config
│
├── ml-service/              # Python Flask ML service
│   ├── models/             # Trained ML models (gitignored)
│   ├── app.py              # Flask application
│   ├── emotion_detector.py # Emotion detection logic
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker config
│   └── README.md           # ML service docs
│
├── docs/                    # Additional documentation
├── .github/                 # GitHub specific files
│   └── workflows/          # CI/CD workflows
├── docker-compose.yml       # Docker Compose config
├── .gitignore              # Git ignore rules
├── README.md               # Main documentation
├── SETUP_GUIDE.md          # Setup instructions
├── DEPLOYMENT.md           # Deployment guide
├── CONTRIBUTING.md         # Contribution guidelines
└── PROJECT_STRUCTURE.md    # This file
```

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── Router
    ├── Public Routes
    │   ├── Landing
    │   ├── Login
    │   └── Register
    │
    └── Private Routes
        └── Layout
            ├── Sidebar
            ├── Header
            └── Content
                ├── Dashboard
                ├── Journal
                ├── MoodDashboard
                ├── Planner
                ├── HabitTracker
                ├── AIInsights
                └── Profile
```

### State Management

- **AuthContext**: User authentication, login/logout
- **MoodContext**: Mood data, emoji mappings, statistics
- **Local State**: Component-specific state with useState
- **API State**: Data fetching with useEffect

### Styling System

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Classes**: Defined in `index.css`
- **Theme**: Configured in `tailwind.config.js`
- **Responsive**: Mobile-first approach

### Key Features

1. **Authentication Flow**
   - JWT token stored in localStorage
   - Automatic token refresh
   - Protected routes with PrivateRoute

2. **PWA Support**
   - Service worker for offline capability
   - Manifest for app installation
   - Responsive design

3. **Animations**
   - Framer Motion for page transitions
   - CSS transitions for interactions
   - 3D elements with React Three Fiber

## 🔧 Backend Architecture

### API Structure

```
/api
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   └── GET    /me
├── /journal
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   ├── DELETE /:id
│   └── GET    /search
├── /moods
│   ├── GET    /stats
│   └── GET    /trends
├── /tasks
│   ├── GET    /
│   ├── POST   /
│   ├── PUT    /:id
│   ├── PATCH  /:id/toggle
│   └── DELETE /:id
├── /habits
│   ├── GET    /
│   ├── POST   /
│   ├── PUT    /:id
│   ├── DELETE /:id
│   ├── POST   /:id/mark
│   ├── DELETE /:id/mark
│   └── GET    /:id/stats
├── /ai
│   ├── GET    /insights
│   ├── GET    /recommendations
│   ├── POST   /followup
│   └── POST   /task-suggestions
└── /user
    ├── GET    /profile
    ├── PUT    /profile
    └── GET    /stats
```

### Database Schema

```sql
users
├── id (SERIAL PRIMARY KEY)
├── name (VARCHAR)
├── email (VARCHAR UNIQUE)
├── password (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

journal_entries
├── id (SERIAL PRIMARY KEY)
├── user_id (FOREIGN KEY → users.id)
├── content (TEXT)
├── emotion (VARCHAR)
├── probability (DECIMAL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

tasks
├── id (SERIAL PRIMARY KEY)
├── user_id (FOREIGN KEY → users.id)
├── title (VARCHAR)
├── description (TEXT)
├── priority (VARCHAR)
├── completed (BOOLEAN)
├── due_date (DATE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

habits
├── id (SERIAL PRIMARY KEY)
├── user_id (FOREIGN KEY → users.id)
├── name (VARCHAR)
├── icon (VARCHAR)
├── frequency (VARCHAR)
└── created_at (TIMESTAMP)

habit_tracking
├── id (SERIAL PRIMARY KEY)
├── habit_id (FOREIGN KEY → habits.id)
├── date (DATE)
├── completed (BOOLEAN)
└── created_at (TIMESTAMP)
```

### Middleware Stack

1. **helmet**: Security headers
2. **cors**: Cross-origin resource sharing
3. **morgan**: HTTP request logger
4. **express.json()**: JSON body parser
5. **authenticate**: JWT verification (custom)

## 🤖 ML Service Architecture

### Emotion Detection Flow

```
User Input
    ↓
Text Preprocessing
    ↓
Keyword Extraction
    ↓
Rule-Based Analysis
    ↓
Emotion Classification
    ↓
Confidence Scoring
    ↓
JSON Response
```

### Supported Emotions

| Emotion | Score | Keywords | Emoji |
|---------|-------|----------|-------|
| joy | 10 | joyful, ecstatic, delighted | 😊 |
| happy | 9 | happy, glad, pleased | 😃 |
| excited | 8 | excited, thrilled, eager | 🤩 |
| calm | 7 | calm, peaceful, relaxed | 😌 |
| neutral | 5 | okay, fine, alright | 😐 |
| anxious | 4 | anxious, worried, nervous | 😰 |
| sad | 3 | sad, unhappy, down | 😢 |
| angry | 2 | angry, mad, furious | 😠 |
| fear | 1 | fear, scared, terrified | 😨 |
| love | 9 | love, adore, cherish | 🥰 |

### API Endpoints

```
/health              # Health check
/api/detect-emotion  # Single emotion detection
/api/batch-detect    # Batch processing
```

## 🔄 Data Flow

### Journal Entry Creation

```
1. User writes in Journal.jsx
   ↓
2. POST to /api/journal (backend)
   ↓
3. Backend forwards text to ML service
   ↓
4. ML service returns emotion
   ↓
5. Backend saves journal + emotion to DB
   ↓
6. Backend returns saved entry
   ↓
7. Frontend updates UI
   ↓
8. AI follow-up questions shown
```

### Mood Dashboard

```
1. User visits MoodDashboard.jsx
   ↓
2. GET /api/moods/stats
   ↓
3. Backend queries journal_entries
   ↓
4. Calculates statistics
   ↓
5. Returns aggregated data
   ↓
6. Frontend renders charts
```

## 🚀 Performance Considerations

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Memoization with useMemo/useCallback
- Virtual scrolling for large lists
- PWA caching strategy

### Backend
- Database connection pooling
- Query optimization with indexes
- API response caching (future)
- Rate limiting (to be added)

### ML Service
- Rule-based for speed
- Can be enhanced with trained models
- Batch processing support
- Stateless design for scaling

## 🔒 Security Features

### Frontend
- XSS prevention (React escaping)
- CSRF protection
- Secure token storage
- HTTPS only (production)

### Backend
- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- Helmet.js security headers
- CORS configuration
- Input validation

### Database
- User isolation
- Prepared statements
- Regular backups
- Access control

## 📊 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** |
| Framework | React 18 | UI library |
| Build Tool | Vite | Fast dev server & bundler |
| Styling | Tailwind CSS | Utility-first CSS |
| Animation | Framer Motion | Smooth animations |
| 3D | React Three Fiber | 3D graphics |
| Charts | Chart.js | Data visualization |
| Routing | React Router | Client-side routing |
| State | Context API | Global state |
| HTTP | Axios | API requests |
| **Backend** |
| Runtime | Node.js 18 | JavaScript runtime |
| Framework | Express | Web framework |
| Database | PostgreSQL 14 | Relational database |
| Auth | JWT + bcrypt | Authentication |
| Validation | express-validator | Input validation |
| **ML Service** |
| Language | Python 3.11 | Programming language |
| Framework | Flask | Web framework |
| NLP | NLTK | Text processing |
| ML | scikit-learn | Machine learning |
| **DevOps** |
| Containerization | Docker | Deployment |
| Orchestration | Docker Compose | Local development |
| CI/CD | GitHub Actions | Automation |
| **Deployment** |
| Frontend | Vercel | Static hosting |
| Backend | Render | Container hosting |
| ML Service | Render Docker | Container hosting |
| Database | Railway | Managed PostgreSQL |

## 🎯 Design Patterns

### Frontend
- **Component Composition**: Small, reusable components
- **Container/Presentational**: Separation of logic and UI
- **Custom Hooks**: Reusable stateful logic
- **Context Providers**: Global state management
- **Higher-Order Components**: PrivateRoute wrapper

### Backend
- **MVC Pattern**: Routes → Controllers → Models
- **Middleware Chain**: Request processing pipeline
- **Repository Pattern**: Database abstraction (future)
- **Dependency Injection**: Service injection (future)

### ML Service
- **Strategy Pattern**: Pluggable emotion detection
- **Factory Pattern**: Model loading
- **Singleton**: Detector instance

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time collaboration
- [ ] Social features (share insights)
- [ ] Mobile apps (React Native)
- [ ] Advanced ML models (BERT)
- [ ] Voice journaling
- [ ] Mood-based music recommendations
- [ ] Calendar integrations
- [ ] Export data (PDF, CSV)
- [ ] Dark mode
- [ ] Multi-language support

### Technical Debt
- [ ] Add comprehensive tests
- [ ] Implement caching layer
- [ ] Add rate limiting
- [ ] Database migrations tool
- [ ] API documentation (Swagger)
- [ ] Error tracking (Sentry)
- [ ] Analytics integration
- [ ] Performance monitoring

---

**Last Updated**: October 2025
**Version**: 1.0.0

