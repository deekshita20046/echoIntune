"""
Personalized Insights Generator

Analyzes user data to generate actionable insights and recommendations.
Processes journal entries, mood history, tasks, and habits to:
- Identify mood patterns and trends
- Analyze productivity patterns
- Generate personalized habit recommendations
- Provide weekly summaries
- Detect correlations between mood and productivity

This module uses statistical analysis and pattern recognition
to provide meaningful insights to users.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from collections import Counter
from typing import List, Dict, Any
import re

class PersonalizedInsights:
    """
    Generate personalized insights based on user data patterns
    
    Main capabilities:
    - Mood pattern analysis (trends, day-of-week patterns)
    - Productivity insights (completion rates, best times)
    - Journal theme extraction
    - Habit performance tracking
    - Personalized recommendations
    """
    
    def __init__(self):
        """
        Initialize the insights generator with keyword dictionaries
        
        Keyword sets are used for:
        - Emotion detection in journal content
        - Productivity topic identification
        - Habit-related content analysis
        """
        # Keywords for emotion detection in journal entries
        self.emotion_keywords = {
            'joy': ['happy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'enjoy', 'fun', 'smile'],
            'sad': ['sad', 'depressed', 'down', 'lonely', 'hurt', 'cry', 'tears', 'grief', 'loss', 'disappointed'],
            'angry': ['angry', 'mad', 'furious', 'rage', 'annoyed', 'irritated', 'frustrated', 'hate', 'upset'],
            'anxious': ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared', 'tense', 'overwhelmed'],
            'calm': ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'zen', 'meditation', 'breathing', 'mindful']
        }
        
        # Keywords for productivity-related content
        self.productivity_keywords = [
            'task', 'work', 'project', 'deadline', 'complete', 'finish', 'accomplish', 'goal', 'plan', 'schedule',
            'meeting', 'email', 'focus', 'concentrate', 'productive', 'efficient', 'organized'
        ]
        
        # Keywords for habit-related content
        self.habit_keywords = [
            'exercise', 'workout', 'run', 'walk', 'gym', 'yoga', 'meditation', 'read', 'study', 'learn',
            'sleep', 'wake', 'morning', 'evening', 'routine', 'habit', 'practice', 'consistency'
        ]

    def generate_insights(self, journal_entries: List[Dict], mood_history: List[Dict], 
                         task_history: List[Dict], habit_data: List[Dict]) -> Dict[str, Any]:
        """
        Generate comprehensive personalized insights from all user data
        
        Combines multiple analysis methods to provide a holistic view
        of the user's mental health, productivity, and habits.
        
        Args:
            journal_entries: List of journal entry objects
            mood_history: List of mood entry objects
            task_history: List of task objects
            habit_data: List of habit objects
        
        Returns:
            Dictionary containing:
            - mood_patterns: Mood trends and patterns
            - productivity_insights: Task completion and productivity
            - journal_insights: Writing patterns and themes
            - habit_insights: Habit performance
            - recommendations: Personalized suggestions
            - weekly_summary: Summary of the past week
        """
        
        insights = {
            'mood_patterns': self._analyze_mood_patterns(mood_history),
            'productivity_insights': self._analyze_productivity_patterns(task_history, mood_history),
            'journal_insights': self._analyze_journal_patterns(journal_entries),
            'habit_insights': self._analyze_habit_patterns(habit_data, mood_history),
            'recommendations': self._generate_recommendations(journal_entries, mood_history, task_history, habit_data),
            'weekly_summary': self._generate_weekly_summary(journal_entries, mood_history, task_history)
        }
        
        return insights

    def analyze_mood_patterns(self, mood_history: List[Dict]) -> Dict[str, Any]:
        """
        Analyze mood patterns and trends over time
        
        Identifies:
        - Most common emotions
        - Average mood scores
        - Trends (improving/declining/stable)
        - Day-of-week patterns
        
        Args:
            mood_history: List of mood entries with dates and scores
        
        Returns:
            Dictionary with mood analysis results
        """
        if not mood_history:
            return {'error': 'No mood data available'}
        
        # Extract emotions and scores
        emotions = [entry.get('emotion', 'neutral') for entry in mood_history]
        scores = [entry.get('score', 5) for entry in mood_history]
        dates = [entry.get('date') for entry in mood_history]
        
        # Calculate statistics
        emotion_counts = Counter(emotions)
        most_common_emotion = emotion_counts.most_common(1)[0][0] if emotion_counts else 'neutral'
        avg_mood_score = np.mean(scores) if scores else 5.0
        
        # Analyze trends
        if len(scores) >= 7:  # At least a week of data
            recent_avg = np.mean(scores[-7:])  # Last 7 days
            older_avg = np.mean(scores[:-7]) if len(scores) > 7 else recent_avg
            trend = 'improving' if recent_avg > older_avg else 'declining' if recent_avg < older_avg else 'stable'
        else:
            trend = 'insufficient_data'
        
        # Day of week analysis
        day_patterns = self._analyze_day_patterns(mood_history)
        
        return {
            'most_common_emotion': most_common_emotion,
            'average_mood_score': round(avg_mood_score, 2),
            'mood_trend': trend,
            'emotion_distribution': dict(emotion_counts),
            'day_patterns': day_patterns,
            'total_entries': len(mood_history)
        }

    def analyze_productivity(self, task_history: List[Dict], mood_history: List[Dict], 
                           journal_entries: List[Dict]) -> Dict[str, Any]:
        """
        Analyze productivity patterns and task completion
        
        Examines:
        - Task completion rates
        - Correlation between mood and productivity
        - Best productivity times
        - Task type analysis
        
        Args:
            task_history: List of task objects
            mood_history: List of mood entries
            journal_entries: List of journal entries
        
        Returns:
            Dictionary with productivity insights
        """
        
        if not task_history:
            return {'error': 'No task data available'}
        
        # Calculate completion rates
        total_tasks = len(task_history)
        completed_tasks = len([task for task in task_history if task.get('completed', False)])
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Analyze mood-productivity correlation
        mood_productivity_correlation = self._calculate_mood_productivity_correlation(task_history, mood_history)
        
        # Best productivity times
        best_times = self._analyze_best_productivity_times(task_history)
        
        # Task type analysis
        task_insights = self._analyze_task_types(task_history)
        
        return {
            'completion_rate': round(completion_rate, 1),
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'mood_productivity_correlation': mood_productivity_correlation,
            'best_productivity_times': best_times,
            'task_insights': task_insights
        }

    def generate_habit_recommendations(self, current_habits: List[Dict], mood_history: List[Dict], 
                                     journal_entries: List[Dict]) -> List[Dict]:
        """
        Generate personalized habit recommendations based on user data
        
        Recommendations are based on:
        - Current mood patterns (mood-boosting habits for low moods)
        - Journal content analysis (productivity habits if mentioned)
        - General wellness recommendations
        
        Args:
            current_habits: List of user's existing habits
            mood_history: Recent mood entries
            journal_entries: Journal content for theme analysis
        
        Returns:
            List of recommendation objects with type, title, and suggestions
        """
        
        recommendations = []
        
        # Analyze current habits performance
        habit_performance = self._analyze_habit_performance(current_habits, mood_history)
        
        # Mood-based recommendations
        if mood_history:
            recent_moods = [entry.get('emotion', 'neutral') for entry in mood_history[-7:]]
            most_common_recent = Counter(recent_moods).most_common(1)[0][0]
            
            if most_common_recent in ['sad', 'anxious']:
                recommendations.append({
                    'type': 'mood_improvement',
                    'title': 'Mood-Boosting Habits',
                    'description': 'Consider adding habits that naturally improve your mood',
                    'suggestions': [
                        {'name': 'Morning Gratitude', 'description': 'Write 3 things you\'re grateful for each morning'},
                        {'name': 'Daily Walk', 'description': 'Take a 10-minute walk in nature'},
                        {'name': 'Deep Breathing', 'description': 'Practice 5 minutes of deep breathing exercises'}
                    ]
                })
        
        # Productivity-based recommendations
        if journal_entries:
            productivity_mentions = self._count_productivity_mentions(journal_entries)
            if productivity_mentions > 0:
                recommendations.append({
                    'type': 'productivity',
                    'title': 'Productivity Habits',
                    'description': 'Based on your journal entries, here are productivity habits to try',
                    'suggestions': [
                        {'name': 'Time Blocking', 'description': 'Block specific times for different types of work'},
                        {'name': 'Daily Planning', 'description': 'Plan your day the night before'},
                        {'name': 'Focus Sessions', 'description': 'Use 25-minute focused work sessions'}
                    ]
                })
        
        # Wellness recommendations
        recommendations.append({
            'type': 'wellness',
            'title': 'Wellness Habits',
            'description': 'General wellness habits for better overall health',
            'suggestions': [
                {'name': 'Hydration', 'description': 'Drink 8 glasses of water daily'},
                {'name': 'Sleep Schedule', 'description': 'Maintain consistent sleep and wake times'},
                {'name': 'Digital Detox', 'description': 'Take 1 hour before bed without screens'}
            ]
        })
        
        return recommendations

    def _analyze_mood_patterns(self, mood_history: List[Dict]) -> Dict[str, Any]:
        """Internal method to analyze mood patterns"""
        return self.analyze_mood_patterns(mood_history)

    def _analyze_productivity_patterns(self, task_history: List[Dict], mood_history: List[Dict]) -> Dict[str, Any]:
        """Internal method to analyze productivity patterns"""
        return self.analyze_productivity(task_history, mood_history, [])

    def _analyze_journal_patterns(self, journal_entries: List[Dict]) -> Dict[str, Any]:
        """Analyze journal entry patterns"""
        if not journal_entries:
            return {'error': 'No journal data available'}
        
        # Analyze writing frequency
        total_entries = len(journal_entries)
        
        # Analyze content themes
        all_content = ' '.join([entry.get('content', '') for entry in journal_entries])
        themes = self._extract_content_themes(all_content)
        
        # Analyze emotion patterns in journal
        emotion_patterns = self._analyze_journal_emotions(journal_entries)
        
        return {
            'total_entries': total_entries,
            'content_themes': themes,
            'emotion_patterns': emotion_patterns,
            'writing_frequency': self._calculate_writing_frequency(journal_entries)
        }

    def _analyze_habit_patterns(self, habit_data: List[Dict], mood_history: List[Dict]) -> Dict[str, Any]:
        """Analyze habit patterns and correlations"""
        if not habit_data:
            return {'error': 'No habit data available'}
        
        # Calculate habit completion rates
        habit_performance = {}
        for habit in habit_data:
            name = habit.get('name', 'Unknown')
            completion_rate = self._calculate_habit_completion_rate(habit)
            habit_performance[name] = completion_rate
        
        # Find best performing habits
        best_habits = sorted(habit_performance.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'habit_performance': habit_performance,
            'best_habits': best_habits[:3],
            'total_habits': len(habit_data),
            'average_completion_rate': np.mean(list(habit_performance.values())) if habit_performance else 0
        }

    def _generate_recommendations(self, journal_entries: List[Dict], mood_history: List[Dict], 
                                task_history: List[Dict], habit_data: List[Dict]) -> List[Dict]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Mood-based recommendations
        if mood_history:
            recent_avg_mood = np.mean([entry.get('score', 5) for entry in mood_history[-7:]])
            if recent_avg_mood < 4:
                recommendations.append({
                    'type': 'mood_support',
                    'title': 'Mood Support',
                    'message': 'Your recent mood scores have been lower. Consider journaling more or trying relaxation techniques.',
                    'priority': 'high'
                })
        
        # Productivity recommendations
        if task_history:
            completion_rate = len([t for t in task_history if t.get('completed', False)]) / len(task_history)
            if completion_rate < 0.7:
                recommendations.append({
                    'type': 'productivity',
                    'title': 'Productivity Boost',
                    'message': 'Try breaking large tasks into smaller, manageable pieces.',
                    'priority': 'medium'
                })
        
        # Habit recommendations
        if habit_data:
            avg_completion = np.mean([self._calculate_habit_completion_rate(h) for h in habit_data])
            if avg_completion < 0.6:
                recommendations.append({
                    'type': 'habits',
                    'title': 'Habit Consistency',
                    'message': 'Focus on building consistency with one habit at a time.',
                    'priority': 'medium'
                })
        
        return recommendations

    def _generate_weekly_summary(self, journal_entries: List[Dict], mood_history: List[Dict], 
                               task_history: List[Dict]) -> Dict[str, Any]:
        """Generate weekly summary insights"""
        
        # Get last 7 days of data
        week_ago = datetime.now() - timedelta(days=7)
        
        recent_journals = [j for j in journal_entries if self._is_within_week(j.get('created_at'), week_ago)]
        recent_moods = [m for m in mood_history if self._is_within_week(m.get('date'), week_ago)]
        recent_tasks = [t for t in task_history if self._is_within_week(t.get('created_at'), week_ago)]
        
        return {
            'journal_entries_this_week': len(recent_journals),
            'mood_entries_this_week': len(recent_moods),
            'tasks_this_week': len(recent_tasks),
            'completed_tasks_this_week': len([t for t in recent_tasks if t.get('completed', False)]),
            'average_mood_this_week': np.mean([m.get('score', 5) for m in recent_moods]) if recent_moods else None
        }

    # ========================================
    # HELPER METHODS
    # These are internal methods used by the main analysis functions
    # ========================================
    
    def _analyze_day_patterns(self, mood_history: List[Dict]) -> Dict[str, float]:
        """
        Analyze mood patterns by day of week
        
        Helps identify if certain days (e.g., Mondays, Fridays) 
        have consistently better or worse moods.
        """
        day_scores = {'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 
                     'Friday': [], 'Saturday': [], 'Sunday': []}
        
        for entry in mood_history:
            date_str = entry.get('date')
            if date_str:
                try:
                    date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    day_name = date_obj.strftime('%A')
                    score = entry.get('score', 5)
                    day_scores[day_name].append(score)
                except:
                    continue
        
        # Calculate averages
        day_averages = {}
        for day, scores in day_scores.items():
            if scores:
                day_averages[day] = round(np.mean(scores), 2)
        
        return day_averages

    def _calculate_mood_productivity_correlation(self, task_history: List[Dict], mood_history: List[Dict]) -> float:
        """Calculate correlation between mood and productivity"""
        if not task_history or not mood_history:
            return 0.0
        
        # This is a simplified correlation calculation
        # In a real implementation, you'd use proper statistical methods
        return 0.65  # Placeholder correlation value

    def _analyze_best_productivity_times(self, task_history: List[Dict]) -> List[str]:
        """Analyze when user is most productive"""
        # Simplified analysis - in reality, you'd analyze timestamps
        return ['Morning (9-11 AM)', 'Afternoon (2-4 PM)']

    def _analyze_task_types(self, task_history: List[Dict]) -> Dict[str, Any]:
        """Analyze task types and completion rates"""
        task_types = {}
        for task in task_history:
            title = task.get('title', '').lower()
            completed = task.get('completed', False)
            
            # Simple categorization
            if any(word in title for word in ['work', 'project', 'meeting']):
                category = 'work'
            elif any(word in title for word in ['exercise', 'gym', 'run']):
                category = 'health'
            elif any(word in title for word in ['read', 'study', 'learn']):
                category = 'learning'
            else:
                category = 'personal'
            
            if category not in task_types:
                task_types[category] = {'total': 0, 'completed': 0}
            
            task_types[category]['total'] += 1
            if completed:
                task_types[category]['completed'] += 1
        
        # Calculate completion rates
        for category in task_types:
            total = task_types[category]['total']
            completed = task_types[category]['completed']
            task_types[category]['completion_rate'] = (completed / total * 100) if total > 0 else 0
        
        return task_types

    def _analyze_habit_performance(self, current_habits: List[Dict], mood_history: List[Dict]) -> Dict[str, float]:
        """Analyze performance of current habits"""
        performance = {}
        for habit in current_habits:
            name = habit.get('name', 'Unknown')
            completion_rate = self._calculate_habit_completion_rate(habit)
            performance[name] = completion_rate
        return performance

    def _calculate_habit_completion_rate(self, habit: Dict) -> float:
        """Calculate completion rate for a habit"""
        marked_days = habit.get('marked_days', [])
        if not marked_days:
            return 0.0
        
        # Calculate based on recent activity (last 30 days)
        recent_days = [day for day in marked_days if self._is_recent(day)]
        return len(recent_days) / 30.0 if recent_days else 0.0

    def _extract_content_themes(self, content: str) -> List[str]:
        """Extract main themes from journal content"""
        themes = []
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['work', 'job', 'career', 'office']):
            themes.append('Work & Career')
        if any(word in content_lower for word in ['family', 'friend', 'relationship', 'love']):
            themes.append('Relationships')
        if any(word in content_lower for word in ['health', 'exercise', 'fitness', 'doctor']):
            themes.append('Health & Wellness')
        if any(word in content_lower for word in ['travel', 'vacation', 'trip', 'adventure']):
            themes.append('Travel & Adventure')
        if any(word in content_lower for word in ['learn', 'study', 'education', 'course']):
            themes.append('Learning & Growth')
        
        return themes

    def _analyze_journal_emotions(self, journal_entries: List[Dict]) -> Dict[str, int]:
        """Analyze emotions mentioned in journal entries"""
        emotion_counts = {emotion: 0 for emotion in self.emotion_keywords.keys()}
        
        for entry in journal_entries:
            content = entry.get('content', '').lower()
            for emotion, keywords in self.emotion_keywords.items():
                for keyword in keywords:
                    if keyword in content:
                        emotion_counts[emotion] += 1
        
        return emotion_counts

    def _calculate_writing_frequency(self, journal_entries: List[Dict]) -> str:
        """Calculate how frequently user writes"""
        if not journal_entries:
            return 'No entries'
        
        # Calculate days between entries
        dates = [entry.get('created_at') for entry in journal_entries if entry.get('created_at')]
        if len(dates) < 2:
            return 'Insufficient data'
        
        # Simplified frequency calculation
        total_days = len(dates)
        if total_days >= 20:
            return 'Daily'
        elif total_days >= 10:
            return 'Frequent'
        elif total_days >= 5:
            return 'Occasional'
        else:
            return 'Rare'

    def _count_productivity_mentions(self, journal_entries: List[Dict]) -> int:
        """Count mentions of productivity-related topics"""
        count = 0
        for entry in journal_entries:
            content = entry.get('content', '').lower()
            for keyword in self.productivity_keywords:
                if keyword in content:
                    count += 1
        return count

    def _is_within_week(self, date_str: str, week_ago: datetime) -> bool:
        """Check if date is within the last week"""
        if not date_str:
            return False
        try:
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return date_obj >= week_ago
        except:
            return False

    def _is_recent(self, date_str: str) -> bool:
        """Check if date is within the last 30 days"""
        if not date_str:
            return False
        try:
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            thirty_days_ago = datetime.now() - timedelta(days=30)
            return date_obj >= thirty_days_ago
        except:
            return False
