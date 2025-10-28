# Contributing to Echo: Intune

Thank you for your interest in contributing to Echo: Intune! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/echointunee.git
cd echointunee
```

3. Set up the development environment following [SETUP_GUIDE.md](./SETUP_GUIDE.md)

4. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

## 📝 Development Workflow

### Code Style

#### Frontend (JavaScript/React)
- Use ESLint and Prettier (already configured)
- Run: `npm run lint` before committing
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused

#### Backend (Node.js)
- Follow JavaScript Standard Style
- Use async/await for asynchronous operations
- Always handle errors properly
- Add JSDoc comments for complex functions

#### ML Service (Python)
- Follow PEP 8 style guide
- Use type hints where appropriate
- Add docstrings to functions and classes
- Keep functions pure when possible

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(journal): add emotion intensity detection
fix(planner): resolve calendar date selection bug
docs(readme): update installation instructions
```

### Testing

#### Frontend Tests
```bash
cd frontend
npm run test
```

#### Backend Tests
```bash
cd backend
npm run test
```

#### ML Service Tests
```bash
cd ml-service
python -m pytest
```

### Pull Request Process

1. **Update your branch**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Test your changes**
- Run all tests
- Test manually in browser
- Check for console errors
- Verify responsive design

3. **Create Pull Request**
- Use a clear, descriptive title
- Reference any related issues
- Describe what you changed and why
- Include screenshots for UI changes
- List any breaking changes

4. **Code Review**
- Address reviewer feedback
- Keep discussions professional and constructive
- Update PR based on feedback

## 🐛 Bug Reports

### Before Submitting
- Check existing issues
- Verify it's reproducible
- Test on latest version

### Include in Report
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Environment details (OS, browser, versions)
- Error messages/stack traces

**Template:**
```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 120]
- Node version: [e.g. 18.17.0]

**Screenshots:**
If applicable
```

## ✨ Feature Requests

### Before Submitting
- Check if feature already exists
- Search existing feature requests
- Consider if it fits project scope

### Include in Request
- Clear use case
- Expected behavior
- Why it's valuable
- Mockups/wireframes if applicable

**Template:**
```markdown
**Feature Description:**
Clear description of the feature

**Use Case:**
Why is this needed?

**Proposed Solution:**
How might this work?

**Alternatives:**
Other ways to solve this

**Additional Context:**
Screenshots, mockups, etc.
```

## 🎨 Design Contributions

We welcome design contributions!

- UI/UX improvements
- Visual design updates
- Accessibility enhancements
- Icon designs
- Illustrations

**Process:**
1. Create an issue describing the design
2. Share mockups/prototypes (Figma, Sketch, etc.)
3. Get feedback from maintainers
4. Implement approved designs

## 📚 Documentation

Documentation improvements are always welcome!

**Areas:**
- README improvements
- Setup guides
- API documentation
- Code comments
- Tutorial videos
- Blog posts

## 🌟 Feature Development Guidelines

### Adding a New Emotion

1. **Update ML Service**
```python
# ml-service/emotion_detector.py
self.emotions.append('your_emotion')
self.emotion_keywords['your_emotion'] = ['keyword1', 'keyword2']
```

2. **Update Frontend**
```javascript
// frontend/src/utils/helpers.js
const getMoodScore = emotion => {
  const scoreMap = {
    // ... existing
    your_emotion: 8,
  }
}

// frontend/src/contexts/MoodContext.jsx
const getMoodEmoji = emotion => {
  const emojiMap = {
    // ... existing
    your_emotion: '😊',
  }
}
```

3. **Update Styles**
```javascript
// frontend/tailwind.config.js
mood: {
  // ... existing
  your_emotion: '#hexcolor',
}
```

### Adding a New Page

1. **Create Page Component**
```javascript
// frontend/src/pages/YourPage.jsx
export default function YourPage() {
  return <div>Your Page</div>
}
```

2. **Add Route**
```javascript
// frontend/src/App.jsx
import YourPage from './pages/YourPage'

<Route path="/your-page" element={<YourPage />} />
```

3. **Add Navigation**
```javascript
// frontend/src/components/Sidebar.jsx
const navItems = [
  // ... existing
  { name: 'Your Page', path: '/your-page', icon: YourIcon },
]
```

### Adding a Backend Endpoint

1. **Create Route Handler**
```javascript
// backend/routes/yourroute.js
import express from 'express'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  // Implementation
})

export default router
```

2. **Register Route**
```javascript
// backend/server.js
import yourRoutes from './routes/yourroute.js'

app.use('/api/your-endpoint', yourRoutes)
```

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email: security@echointune.example (or project maintainer)
2. Include details but not exploits
3. Give us time to address before disclosure

### Security Best Practices

- Never commit secrets or credentials
- Use environment variables
- Validate all user input
- Sanitize database queries
- Keep dependencies updated
- Follow OWASP guidelines

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

### Enforcement

Report violations to project maintainers. All reports will be reviewed and investigated.

## 🎓 Learning Resources

### Frontend Development
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Three.js](https://threejs.org)

### Backend Development
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

### ML/AI
- [scikit-learn Documentation](https://scikit-learn.org)
- [NLTK Book](https://www.nltk.org/book/)
- [NLP with Python](https://www.oreilly.com/library/view/natural-language-processing/9780596803346/)

## 💬 Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code review and discussions

## 🙏 Thank You!

Every contribution, no matter how small, is valuable. Thank you for helping make Echo: Intune better!

---

**Questions?** Open an issue or start a discussion!

