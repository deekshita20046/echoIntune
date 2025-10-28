# 🧪 Echo: Intune - Testing Guide

This guide provides comprehensive testing instructions for all features of Echo: Intune.

---

## Table of Contents
- [Automated Testing](#automated-testing)
- [Manual Testing Checklist](#manual-testing-checklist)
- [API Endpoint Testing](#api-endpoint-testing)
- [Frontend Component Testing](#frontend-component-testing)
- [Integration Testing](#integration-testing)
- [Performance Testing](#performance-testing)

---

## Automated Testing

### Backend API Tests

Save this as `backend/test-api.js`:

```javascript
import axios from 'axios';

const BASE_URL = 'http://localhost:5002/api';
let authToken = '';
let userId = '';

const tests = [];
const results = { passed: 0, failed: 0 };

const test = (name, fn) => tests.push({ name, fn });
const log = (message, type = 'info') => {
  const colors = { success: '\x1b[32m', error: '\x1b[31m', info: '\x1b[36m' };
  console.log(`${colors[type]}${message}\x1b[0m`);
};

// Test: Health Check
test('Health Check', async () => {
  const response = await axios.get('http://localhost:5002/health');
  if (response.data.status !== 'OK') throw new Error('Health check failed');
});

// Test: User Registration
test('User Registration', async () => {
  const timestamp = Date.now();
  const response = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Test User',
    email: `test${timestamp}@echointune.com`,
    password: 'password123'
  });
  
  if (!response.data.token) throw new Error('No token received');
  authToken = response.data.token;
  userId = response.data.user.id;
  axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
});

// Test: User Login
test('User Login', async () => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email: `test${userId}@echointune.com`,
    password: 'password123'
  });
  
  if (!response.data.token) throw new Error('Login failed');
});

// Test: Get Current User
test('Get Current User', async () => {
  const response = await axios.get(`${BASE_URL}/auth/me`);
  if (!response.data.user.email) throw new Error('Failed to get user');
});

// Test: Create Journal Entry
test('Create Journal Entry', async () => {
  const response = await axios.post(`${BASE_URL}/journal`, {
    content: 'Today was an amazing day! I felt so happy and accomplished.',
    date: new Date().toISOString().split('T')[0]
  });
  
  if (!response.data.entry.emotion) throw new Error('No emotion detected');
});

// Test: Get Journal Entries
test('Get Journal Entries', async () => {
  const response = await axios.get(`${BASE_URL}/journal`);
  if (!Array.isArray(response.data.journals)) throw new Error('Invalid response');
});

// Test: Create Task
test('Create Task', async () => {
  const response = await axios.post(`${BASE_URL}/tasks`, {
    title: 'Test Task',
    description: 'This is a test task',
    priority: 'high',
    due_date: new Date().toISOString().split('T')[0]
  });
  
  if (!response.data.task.id) throw new Error('Task creation failed');
});

// Test: Get Tasks
test('Get Tasks', async () => {
  const response = await axios.get(`${BASE_URL}/tasks`);
  if (!Array.isArray(response.data.tasks)) throw new Error('Invalid response');
});

// Test: Create Habit
test('Create Habit', async () => {
  const response = await axios.post(`${BASE_URL}/habits`, {
    name: 'Morning Exercise',
    icon: '🏃',
    frequency: 'daily'
  });
  
  if (!response.data.habit.id) throw new Error('Habit creation failed');
});

// Test: Get Habits
test('Get Habits', async () => {
  const response = await axios.get(`${BASE_URL}/habits`);
  if (!Array.isArray(response.data.habits)) throw new Error('Invalid response');
});

// Test: Record Mood
test('Record Mood Entry', async () => {
  const response = await axios.post(`${BASE_URL}/moods`, {
    emotion: 'happy',
    score: 8,
    note: 'Feeling great today!',
    date: new Date().toISOString().split('T')[0]
  });
  
  if (!response.data.mood.id) throw new Error('Mood recording failed');
});

// Test: Get Mood Stats
test('Get Mood Statistics', async () => {
  const response = await axios.get(`${BASE_URL}/moods/stats`);
  if (typeof response.data.averageMood !== 'number') throw new Error('Invalid stats');
});

// Test: Get AI Insights
test('Get AI Insights', async () => {
  const response = await axios.get(`${BASE_URL}/ai/insights`);
  if (!response.data.insights) throw new Error('No insights returned');
});

// Run all tests
(async () => {
  log('🧪 Starting Echo: Intune API Tests...\n', 'info');
  
  for (const { name, fn } of tests) {
    try {
      await fn();
      results.passed++;
      log(`✅ ${name}`, 'success');
    } catch (error) {
      results.failed++;
      log(`❌ ${name}: ${error.message}`, 'error');
    }
  }
  
  log(`\n📊 Test Results: ${results.passed} passed, ${results.failed} failed`, 
    results.failed === 0 ? 'success' : 'error');
  
  process.exit(results.failed === 0 ? 0 : 1);
})();
```

Run the tests:
```bash
cd backend
node test-api.js
```

---

## Manual Testing Checklist

### 🔐 Authentication & User Management

#### Registration
- [ ] Open `http://localhost:3000/register`
- [ ] Fill in name, email, password
- [ ] Click "Sign Up"
- [ ] Verify: Redirected to home page
- [ ] Verify: User avatar appears in sidebar
- [ ] Verify: Default avatar is 🐚

#### Login
- [ ] Open `http://localhost:3000/login`
- [ ] Enter registered email and password
- [ ] Click "Sign In"
- [ ] Verify: Redirected to home page
- [ ] Verify: Token saved in localStorage

#### OAuth Login (if configured)
- [ ] Click "Continue with Google"
- [ ] Complete Google authentication
- [ ] Verify: Redirected back to app
- [ ] Verify: User logged in successfully

#### Forgot Password
- [ ] Click "Forgot your password?"
- [ ] Enter email address
- [ ] Click "Send Reset Link"
- [ ] Verify: Success message appears

#### Logout
- [ ] Click user menu in sidebar
- [ ] Click "Logout"
- [ ] Verify: Redirected to landing page
- [ ] Verify: Token removed from localStorage

---

### 🏠 Home Dashboard

#### Page Load
- [ ] Navigate to `/home`
- [ ] Verify: Time-based greeting (Good morning/afternoon/evening)
- [ ] Verify: Random quote displayed
- [ ] Verify: Daily tip displayed
- [ ] Verify: Quick action buttons visible

#### Today's Mood
- [ ] Verify: Current mood displayed (if journaled today)
- [ ] Verify: Mood emoji shown
- [ ] Verify: Confidence percentage shown
- [ ] Verify: "Add journal entry" link if no mood

#### Today's Tasks
- [ ] Verify: Tasks for today displayed
- [ ] Click task checkbox
- [ ] Verify: Task marked as complete with strikethrough
- [ ] Click checkbox again
- [ ] Verify: Task unmarked
- [ ] Click delete icon
- [ ] Verify: Task removed

#### Recent Reflections
- [ ] Verify: Last 2 journal entries shown
- [ ] Verify: Entry date and mood emoji visible
- [ ] Click on entry
- [ ] Verify: Redirected to journal page

---

### 📖 Journal Page

#### Create Entry
- [ ] Navigate to `/journal`
- [ ] Verify: Date auto-filled with today
- [ ] Verify: Handwriting font (Caveat) in textarea
- [ ] Type: "Today was an amazing day! I felt so happy and productive."
- [ ] Click "Save Entry"
- [ ] Verify: Loading spinner appears
- [ ] Verify: AI follow-up modal appears
- [ ] Verify: Detected emotion shown (likely "joy")
- [ ] Verify: Emoji displayed correctly

#### AI Follow-Up Questions
- [ ] After saving entry, modal should appear
- [ ] Verify: Contextual questions shown
- [ ] Click "🗣 Talk more"
- [ ] Verify: Appropriate response appears
- [ ] Click "🎧 Suggest a song"
- [ ] Verify: Song recommendation appears
- [ ] Click "✨ Recommend something"
- [ ] Verify: Activity recommendation appears
- [ ] Click "Close" or outside modal
- [ ] Verify: Modal closes

#### View Entries
- [ ] Scroll down to entries list
- [ ] Verify: All entries displayed with:
  - Date
  - Mood emoji
  - Entry preview
- [ ] Click on an entry
- [ ] Verify: Full entry modal opens
- [ ] Verify: Complete text visible
- [ ] Verify: AI confidence shown

#### Search & Filter
- [ ] Select an emotion from dropdown
- [ ] Verify: Only entries with that emotion shown
- [ ] Select a date
- [ ] Click "Search"
- [ ] Verify: Only entries from that date shown
- [ ] Clear filters
- [ ] Verify: All entries shown again

#### Delete Entry
- [ ] Hover over entry
- [ ] Click delete icon
- [ ] Confirm deletion
- [ ] Verify: Entry removed from list

---

### 📅 Planner Page

#### Today Tab
- [ ] Navigate to `/planner`
- [ ] Click "Today" tab
- [ ] Verify: Tasks for today displayed
- [ ] Click "Add Task" button
- [ ] Fill in task details
- [ ] Click "Add Task"
- [ ] Verify: New task appears
- [ ] Check task checkbox
- [ ] Verify: Strikethrough animation
- [ ] Verify: Task marked complete

#### This Week Tab
- [ ] Click "This Week" tab
- [ ] Verify: Current week displayed (Sun-Sat)
- [ ] Verify: Tasks grouped by day
- [ ] Verify: Today's date highlighted
- [ ] Click on a day
- [ ] Verify: Tasks for that day shown

#### Full Calendar Tab
- [ ] Click "Full Calendar" tab
- [ ] Verify: Monthly calendar displayed
- [ ] Verify: Current month shown
- [ ] Verify: Today's date highlighted
- [ ] Verify: Days with tasks have indicator
- [ ] Click previous/next month buttons
- [ ] Verify: Calendar navigates correctly
- [ ] Click on a date
- [ ] Verify: Tasks for that date shown on right panel

#### Task Management
- [ ] Create task with high priority
- [ ] Verify: Red priority indicator
- [ ] Create task with medium priority
- [ ] Verify: Yellow priority indicator
- [ ] Create task with low priority
- [ ] Verify: Green priority indicator
- [ ] Edit task
- [ ] Verify: Changes saved
- [ ] Delete task
- [ ] Verify: Task removed

---

### 🎯 Habit Tracker Page

#### Create Habit
- [ ] Navigate to `/habits`
- [ ] Click "Add Habit" button
- [ ] Enter habit name: "Morning Meditation"
- [ ] Select icon: 🧘
- [ ] Select frequency: "daily"
- [ ] Click "Add Habit"
- [ ] Verify: New habit card appears

#### Mark Habit Complete
- [ ] Click on today's date in habit calendar
- [ ] Verify: Date marked as completed
- [ ] Verify: Streak counter increments
- [ ] Click again to unmark
- [ ] Verify: Date unmarked
- [ ] Verify: Streak decrements if applicable

#### Cute Mood Meter
- [ ] Mark habit complete for several days
- [ ] Verify: Mood meter emoji appears
- [ ] Verify: Impact message shown (e.g., "Very Positive")
- [ ] Hover over mood meter
- [ ] Verify: Tooltip or explanation shown

#### View Statistics
- [ ] Verify: Current streak displayed
- [ ] Verify: This month completion count
- [ ] Verify: Mood impact percentage
- [ ] Verify: Monthly progress calendar
- [ ] Verify: Days marked in calendar
- [ ] Verify: Mood insight message at bottom

#### Delete Habit
- [ ] Click delete icon on habit card
- [ ] Confirm deletion
- [ ] Verify: Habit removed

---

### 📊 Mood Tracker Page

#### Time Range Selection
- [ ] Navigate to `/mood`
- [ ] Click "Daily" button
- [ ] Verify: Daily data shown
- [ ] Click "Weekly" button
- [ ] Verify: Weekly data shown
- [ ] Click "Monthly" button
- [ ] Verify: Monthly data shown

#### Statistics Cards
- [ ] Verify: Total Entries count
- [ ] Verify: Average Mood score
- [ ] Verify: Most Common emotion
- [ ] Verify: Current Period count

#### Charts
- [ ] Verify: Line chart displays mood over time
- [ ] Verify: Pie chart shows mood distribution
- [ ] Verify: Bar chart shows mood frequency
- [ ] Hover over chart elements
- [ ] Verify: Tooltips appear with details

#### Mood Breakdown
- [ ] Verify: List of moods with counts
- [ ] Verify: Each mood has emoji
- [ ] Verify: Percentages shown
- [ ] Click on a mood
- [ ] Verify: Related entries highlighted

#### Mood Calendar
- [ ] Verify: Calendar heatmap displayed
- [ ] Verify: Different colors for different moods
- [ ] Hover over day
- [ ] Verify: Tooltip shows mood details
- [ ] Click on a day
- [ ] Verify: Related entries shown

#### Insights Panel
- [ ] Verify: Personalized insights displayed
- [ ] Verify: At least 2-3 insights shown
- [ ] Verify: Insights based on actual data
- [ ] Verify: Actionable recommendations

---

### 🤖 AI Insights ("Your Smart Friend")

#### View Insights
- [ ] Navigate to `/insights`
- [ ] Verify: Page title "Your Smart Friend"
- [ ] Verify: Current mood affirmation shown
- [ ] Verify: Analysis summary displayed
- [ ] Verify: Patterns section visible
- [ ] Verify: Recommendations shown
- [ ] Verify: Journal prompts displayed

#### AI Chat Feature
- [ ] Click "Chat with AI" button
- [ ] Verify: Chat modal opens
- [ ] Verify: Welcome message from AI
- [ ] Type: "How can I improve my mood?"
- [ ] Click send
- [ ] Verify: Typing indicator appears
- [ ] Verify: AI response received
- [ ] Try different queries:
  - "I'm feeling stressed"
  - "Give me productivity tips"
  - "How am I doing this week?"
- [ ] Verify: Contextual responses
- [ ] Close chat
- [ ] Reopen chat
- [ ] Verify: Chat history preserved

#### Personalized Recommendations
- [ ] Verify: Habit recommendations based on mood
- [ ] Verify: Task suggestions shown
- [ ] Verify: Affirmations displayed
- [ ] Click on a recommendation
- [ ] Verify: Detailed explanation shown

---

### 👤 Profile Page

#### View Profile
- [ ] Navigate to `/profile`
- [ ] Verify: User avatar displayed
- [ ] Verify: Username shown
- [ ] Verify: Email shown
- [ ] Verify: Member since date
- [ ] Verify: Personal statistics shown:
  - Journal entries count
  - Tasks completed ratio
  - Longest streak
  - Average mood

#### Avatar Selection
- [ ] Click camera icon on avatar
- [ ] Verify: Avatar selector modal opens
- [ ] Verify: 12 ocean-themed avatars shown
- [ ] Click on a different avatar
- [ ] Verify: Avatar changes immediately
- [ ] Verify: Modal closes
- [ ] Refresh page
- [ ] Verify: New avatar persists

#### Edit Profile
- [ ] Click "Edit Profile" button
- [ ] Update name
- [ ] Update email
- [ ] Click "Save"
- [ ] Verify: Changes saved
- [ ] Verify: Success message shown
- [ ] Refresh page
- [ ] Verify: Changes persist

---

## API Endpoint Testing

### Using cURL

#### Test Health
```bash
curl http://localhost:5002/health
```

#### Test Registration
```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

#### Test Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Test Create Journal (replace TOKEN)
```bash
curl -X POST http://localhost:5002/api/journal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"Today was great!","date":"2025-10-25"}'
```

#### Test ML Service
```bash
curl -X POST http://localhost:5001/api/detect-emotion \
  -H "Content-Type: application/json" \
  -d '{"text":"I am so happy and excited today!"}'
```

---

## Frontend Component Testing

### Wave Component
- [ ] View landing page
- [ ] Scroll through sections
- [ ] Verify: Wave animations smooth
- [ ] Verify: No performance issues
- [ ] Check on mobile viewport
- [ ] Verify: Responsive

### Shell Badge Component
- [ ] Navigate to any feature page
- [ ] Verify: Shell badges render correctly
- [ ] Verify: Icons visible
- [ ] Verify: Text readable
- [ ] Check animations

### OAuth Components
- [ ] Test OAuth login buttons
- [ ] Test OAuth callback page
- [ ] Test forgot password flow
- [ ] Verify all animations smooth

---

## Integration Testing

### End-to-End User Journey

#### New User Flow
1. [ ] Open app at `/`
2. [ ] Click "Get Started"
3. [ ] Fill registration form
4. [ ] Submit
5. [ ] Verify: Redirected to `/home`
6. [ ] Navigate to Journal
7. [ ] Create first entry
8. [ ] Verify: Emotion detected
9. [ ] Navigate to Planner
10. [ ] Create first task
11. [ ] Navigate to Habits
12. [ ] Create first habit
13. [ ] Navigate to Mood Tracker
14. [ ] Verify: Mood from journal shown
15. [ ] Navigate to AI Insights
16. [ ] Verify: Insights generated
17. [ ] Navigate to Profile
18. [ ] Verify: Stats updated

#### Data Persistence
1. [ ] Create journal entry
2. [ ] Create task
3. [ ] Create habit
4. [ ] Log out
5. [ ] Log back in
6. [ ] Verify: All data persists
7. [ ] Close browser
8. [ ] Reopen app
9. [ ] Log in
10. [ ] Verify: All data still there

---

## Performance Testing

### Page Load Times
- [ ] Measure landing page load: Should be < 2 seconds
- [ ] Measure home page load: Should be < 1 second  
- [ ] Measure journal page load: Should be < 1 second

### API Response Times
- [ ] Test journal creation: Should be < 500ms
- [ ] Test emotion detection: Should be < 2 seconds
- [ ] Test task operations: Should be < 200ms

### Animation Performance
- [ ] Open DevTools Performance tab
- [ ] Record while navigating pages
- [ ] Verify: 60fps maintained
- [ ] Check for memory leaks

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Android Firefox

### Responsive Design
- [ ] Test at 320px width (mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1024px width (small laptop)
- [ ] Test at 1920px width (desktop)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Verify: Focus indicators visible
- [ ] Press Enter/Space on buttons
- [ ] Verify: Actions triggered

### Screen Reader
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify: All content readable
- [ ] Verify: Form labels announced
- [ ] Verify: Button purposes clear

### Color Contrast
- [ ] Verify: Ocean colors meet WCAG AA
- [ ] Test with color blindness simulators
- [ ] Verify: Information not conveyed by color alone

---

## Security Testing

### Authentication
- [ ] Try accessing `/home` without login
- [ ] Verify: Redirected to `/login`
- [ ] Try accessing API without token
- [ ] Verify: 401 Unauthorized error

### Authorization
- [ ] Log in as User A
- [ ] Note a journal entry ID
- [ ] Log in as User B
- [ ] Try to access User A's entry
- [ ] Verify: Cannot access

### Input Validation
- [ ] Try SQL injection in inputs
- [ ] Verify: Input sanitized
- [ ] Try XSS in journal entry
- [ ] Verify: HTML escaped
- [ ] Try extremely long inputs
- [ ] Verify: Validation errors

---

## Bug Reporting Template

When you find a bug, report it using this format:

```markdown
**Title:** Clear, descriptive title

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Screen Size: 1920x1080

**Steps to Reproduce:**
1. Go to '/journal'
2. Click 'Save Entry'
3. Observe error

**Expected Behavior:**
Entry should be saved successfully

**Actual Behavior:**
Error message appears: "Failed to save entry"

**Screenshots:**
[Attach screenshot]

**Console Errors:**
```
Error: Network request failed
at ...
```

**Additional Context:**
This happens only when content is empty
```

---

## Test Results Summary

After completing all tests, fill this out:

### Overall Results
- Total Tests: ___
- Passed: ___
- Failed: ___
- Skipped: ___

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Performance Metrics
- Average Page Load: ___ms
- Average API Response: ___ms
- JavaScript Bundle Size: ___KB

### Recommendations
1. 
2. 
3. 

---

## Continuous Testing

### Before Each Deployment
- [ ] Run all automated tests
- [ ] Test critical user flows
- [ ] Check performance metrics
- [ ] Verify responsiveness
- [ ] Test on multiple browsers

### Weekly Testing
- [ ] Full manual testing checklist
- [ ] Security audit
- [ ] Accessibility audit
- [ ] Performance profiling

---

## 🎉 Testing Complete!

Once all tests pass, your Echo: Intune application is ready for:
- ✅ Production deployment
- ✅ User acceptance testing
- ✅ Final presentation

**Happy Testing! 🧪✨**
