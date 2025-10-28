"""
Emotion Detection Module

Detects emotions from text using rule-based keyword matching.
Can be extended to use machine learning models for better accuracy.

Supported emotions:
- joy, happy, sad, angry, anxious
- excited, calm, neutral, fear, love

The detector uses:
1. Keyword matching for emotion detection
2. Punctuation analysis (!, ?) for emphasis
3. Negation handling (not, never, etc.)
4. Confidence scoring based on keyword frequency
"""

import os
import re
import string
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required NLTK data for text processing
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

class EmotionDetector:
    """
    Emotion detection using machine learning
    Detects emotions: joy, happy, sad, angry, anxious, excited, calm, neutral, fear, love
    """
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.emotions = [
            'joy', 'happy', 'sad', 'angry', 'anxious', 
            'excited', 'calm', 'neutral', 'fear', 'love'
        ]
        self.emotion_keywords = self._build_keyword_dict()
        self._initialize_model()
    
    def _build_keyword_dict(self):
        """Build emotion keyword dictionary for rule-based detection"""
        return {
            'joy': ['joy', 'joyful', 'delighted', 'cheerful', 'blissful', 'ecstatic', 'jubilant'],
            'happy': ['happy', 'glad', 'pleased', 'content', 'satisfied', 'great', 'wonderful', 'amazing', 'awesome', 'fantastic'],
            'sad': ['sad', 'unhappy', 'depressed', 'miserable', 'sorrowful', 'down', 'blue', 'disappointed', 'heartbroken'],
            'angry': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'enraged', 'upset'],
            'anxious': ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'concerned', 'afraid'],
            'excited': ['excited', 'thrilled', 'enthusiastic', 'eager', 'pumped', 'energized', 'exhilarated'],
            'calm': ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'composed', 'quiet', 'still'],
            'neutral': ['okay', 'fine', 'alright', 'normal', 'usual', 'ordinary'],
            'fear': ['fear', 'scared', 'terrified', 'frightened', 'afraid', 'horrified', 'panicked'],
            'love': ['love', 'adore', 'cherish', 'affection', 'care', 'fond', 'devoted', 'passionate'],
        }
    
    def _initialize_model(self):
        """
        Initialize or load the emotion detection model
        
        Tries to load a pre-trained ML model if available.
        Falls back to rule-based detection if no model is found.
        This allows the system to work immediately without training data.
        """
        model_path = os.getenv('MODEL_PATH', 'models/emotion_model.pkl')
        
        # Check if pre-trained machine learning model exists
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                return
            except Exception as e:
                pass
        
        # Use rule-based approach (no ML model required)
    
    def _preprocess_text(self, text):
        """
        Preprocess text for emotion analysis
        
        Cleaning steps:
        1. Convert to lowercase for consistent matching
        2. Remove URLs (not relevant for emotion)
        3. Remove special characters (keep !, ?, . for context)
        4. Remove extra whitespace
        
        Args:
            text (str): Raw text to preprocess
        
        Returns:
            str: Cleaned text ready for analysis
        """
        # Convert to lowercase for case-insensitive matching
        text = text.lower()
        
        # Remove URLs (they don't convey emotion)
        text = re.sub(r'http\S+|www.\S+', '', text)
        
        # Remove special characters but keep punctuation for emotion cues
        text = re.sub(r'[^a-z\s!?.,]', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def _rule_based_detection(self, text):
        """
        Rule-based emotion detection using keyword matching
        
        Algorithm:
        1. Count occurrences of emotion-specific keywords
        2. Analyze punctuation for emotional emphasis
        3. Handle negation words (not, never) to adjust scores
        4. Calculate confidence based on keyword frequency
        
        Args:
            text (str): Preprocessed text to analyze
        
        Returns:
            tuple: (dominant_emotion, confidence_score)
        """
        text_lower = text.lower()
        
        # Initialize emotion scores (higher score = stronger emotion)
        emotion_scores = {emotion: 0 for emotion in self.emotions}
        
        for emotion, keywords in self.emotion_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    emotion_scores[emotion] += 1
        
        # Check for emotional punctuation
        if '!' in text:
            emotion_scores['excited'] += 0.5
            emotion_scores['happy'] += 0.3
        
        if '?' in text and any(word in text_lower for word in ['why', 'what', 'how']):
            emotion_scores['anxious'] += 0.3
        
        # Negation handling
        negation_words = ['not', 'no', 'never', 'neither', 'nobody', 'nothing']
        has_negation = any(word in text_lower for word in negation_words)
        
        if has_negation:
            # Reduce positive emotions
            emotion_scores['happy'] *= 0.5
            emotion_scores['joy'] *= 0.5
            emotion_scores['excited'] *= 0.5
            # Increase negative emotions
            emotion_scores['sad'] *= 1.5
            emotion_scores['anxious'] *= 1.5
        
        # Get the dominant emotion
        max_score = max(emotion_scores.values())
        
        if max_score == 0:
            return 'neutral', 0.5
        
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        
        # Calculate confidence (normalized score)
        total_score = sum(emotion_scores.values())
        confidence = emotion_scores[dominant_emotion] / total_score if total_score > 0 else 0.5
        
        # Ensure confidence is between 0.5 and 1.0
        confidence = max(0.5, min(1.0, confidence))
        
        return dominant_emotion, confidence
    
    def predict(self, text):
        """
        Predict emotion from text
        
        Returns:
            dict: {
                'emotion': str,
                'probability': float,
                'all_emotions': dict
            }
        """
        if not text or len(text.strip()) == 0:
            return {
                'emotion': 'neutral',
                'probability': 0.5,
                'all_emotions': {'neutral': 0.5}
            }
        
        # Preprocess
        processed_text = self._preprocess_text(text)
        
        # Use rule-based detection
        emotion, probability = self._rule_based_detection(processed_text)
        
        # Build all emotions dict
        all_emotions = {emotion: probability}
        
        return {
            'emotion': emotion,
            'probability': round(probability, 2),
            'all_emotions': all_emotions
        }
    
    def is_loaded(self):
        """Check if model is loaded"""
        return True  # Always true for rule-based approach
    
    def train_model(self, texts, labels):
        """
        Train the emotion detection model (for future enhancement)
        
        Args:
            texts: List of text samples
            labels: List of emotion labels
        """
        try:
            # Create pipeline
            pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
                ('classifier', MultinomialNB())
            ])
            
            # Train
            pipeline.fit(texts, labels)
            
            # Save model
            model_dir = 'models'
            os.makedirs(model_dir, exist_ok=True)
            
            model_path = os.path.join(model_dir, 'emotion_model.pkl')
            joblib.dump(pipeline, model_path)
            
            self.model = pipeline
            
            print(f"✅ Model trained and saved to {model_path}")
            return True
        
        except Exception as e:
            print(f"❌ Error training model: {e}")
            return False

