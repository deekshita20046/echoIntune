"""
Echo: Intune - ML Service API

Flask-based machine learning service for emotion detection and personalized insights.
Provides REST API endpoints for:
- Emotion detection from text
- Batch emotion analysis
- Personalized insights generation
- Mood pattern analysis
- Productivity insights
- Habit recommendations

This service is optional but enhances the main application with AI-powered features.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv
from emotion_detector import EmotionDetector
from personalized_insights import PersonalizedInsights

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Configure CORS - Allow requests from frontend and backend
# Origins are loaded from environment variable (see .env.example)
CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5002').split(','))

# Initialize ML components
detector = EmotionDetector()  # Handles emotion detection from text
insights_generator = PersonalizedInsights()  # Generates personalized insights

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    
    Returns service status and model availability
    Used by monitoring systems and deployment platforms
    """
    return jsonify({
        'status': 'OK',
        'message': 'ML Service is running',
        'model_loaded': detector.is_loaded()
    })

@app.route('/api/detect-emotion', methods=['POST'])
def detect_emotion():
    """
    Detect emotion from text using ML/rule-based approach
    
    Request body:
        {
            "text": "I feel amazing today!"
        }
    
    Response:
        {
            "emotion": "joy",
            "probability": 0.85,
            "all_emotions": {"joy": 0.85}
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        
        if not text or len(text.strip()) == 0:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Detect emotion
        result = detector.predict(text)
        
        return jsonify(result)
    
    except Exception as e:
        app.logger.error(f'Error detecting emotion: {str(e)}')
        return jsonify({
            'error': 'Failed to detect emotion',
            'details': str(e)
        }), 500

@app.route('/api/batch-detect', methods=['POST'])
def batch_detect_emotion():
    """
    Batch emotion detection for multiple texts
    
    Useful for analyzing multiple journal entries at once
    
    Request body:
        {
            "texts": ["Text 1", "Text 2", "Text 3"]
        }
    
    Response:
        {
            "results": [
                {"emotion": "happy", "probability": 0.8},
                {"emotion": "sad", "probability": 0.7},
                ...
            ]
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({'error': 'No texts provided'}), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list):
            return jsonify({'error': 'Texts must be a list'}), 400
        
        results = []
        for text in texts:
            if text and len(text.strip()) > 0:
                results.append(detector.predict(text))
            else:
                results.append({
                    'emotion': 'neutral',
                    'probability': 0.5,
                    'all_emotions': {}
                })
        
        return jsonify({'results': results})
    
    except Exception as e:
        app.logger.error(f'Error in batch detection: {str(e)}')
        return jsonify({
            'error': 'Failed to process batch detection',
            'details': str(e)
        }), 500

@app.route('/api/personalized-insights', methods=['POST'])
def generate_personalized_insights():
    """
    Generate personalized insights based on user data
    
    Analyzes journal entries, mood history, tasks, and habits
    to provide comprehensive personalized insights
    
    Request body:
        {
            "journal_entries": [...],
            "mood_history": [...],
            "task_history": [...],
            "habit_data": [...]
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract user data
        journal_entries = data.get('journal_entries', [])
        mood_history = data.get('mood_history', [])
        task_history = data.get('task_history', [])
        habit_data = data.get('habit_data', [])
        
        # Generate insights
        insights = insights_generator.generate_insights(
            journal_entries=journal_entries,
            mood_history=mood_history,
            task_history=task_history,
            habit_data=habit_data
        )
        
        return jsonify(insights)
    
    except Exception as e:
        app.logger.error(f'Error generating insights: {str(e)}')
        return jsonify({
            'error': 'Failed to generate insights',
            'details': str(e)
        }), 500

@app.route('/api/mood-patterns', methods=['POST'])
def analyze_mood_patterns():
    """Analyze mood patterns and trends"""
    try:
        data = request.get_json()
        
        if not data or 'mood_history' not in data:
            return jsonify({'error': 'No mood history provided'}), 400
        
        mood_history = data['mood_history']
        
        # Analyze patterns
        patterns = insights_generator.analyze_mood_patterns(mood_history)
        
        return jsonify(patterns)
    
    except Exception as e:
        app.logger.error(f'Error analyzing mood patterns: {str(e)}')
        return jsonify({
            'error': 'Failed to analyze mood patterns',
            'details': str(e)
        }), 500

@app.route('/api/productivity-insights', methods=['POST'])
def analyze_productivity():
    """Analyze productivity patterns"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        task_history = data.get('task_history', [])
        mood_history = data.get('mood_history', [])
        journal_entries = data.get('journal_entries', [])
        
        # Analyze productivity
        insights = insights_generator.analyze_productivity(
            task_history=task_history,
            mood_history=mood_history,
            journal_entries=journal_entries
        )
        
        return jsonify(insights)
    
    except Exception as e:
        app.logger.error(f'Error analyzing productivity: {str(e)}')
        return jsonify({
            'error': 'Failed to analyze productivity',
            'details': str(e)
        }), 500

@app.route('/api/habit-recommendations', methods=['POST'])
def generate_habit_recommendations():
    """Generate personalized habit recommendations"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        current_habits = data.get('current_habits', [])
        mood_history = data.get('mood_history', [])
        journal_entries = data.get('journal_entries', [])
        
        # Generate recommendations
        recommendations = insights_generator.generate_habit_recommendations(
            current_habits=current_habits,
            mood_history=mood_history,
            journal_entries=journal_entries
        )
        
        return jsonify(recommendations)
    
    except Exception as e:
        app.logger.error(f'Error generating habit recommendations: {str(e)}')
        return jsonify({
            'error': 'Failed to generate habit recommendations',
            'details': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors - endpoint not found"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors - internal server error"""
    return jsonify({'error': 'Internal server error'}), 500

# Application entry point
if __name__ == '__main__':
    # Get configuration from environment variables
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    # Start Flask server
    # host='0.0.0.0' allows external connections (needed for Docker/production)
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )

