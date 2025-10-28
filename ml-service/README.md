# Echo: Intune ML Service

Python Flask microservice for emotion detection using NLP and machine learning.

## Features

- **Emotion Detection**: Detects 10 different emotions from text
  - joy, happy, sad, angry, anxious, excited, calm, neutral, fear, love
- **Rule-based NLP**: Uses keyword matching and sentiment analysis
- **Batch Processing**: Support for batch emotion detection
- **Scalable**: Can be enhanced with ML models (Naive Bayes, BERT, etc.)

## Installation

### Local Development

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download NLTK data:
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the service:
```bash
python app.py
```

The service will be available at `http://localhost:5001`

### Docker Deployment

Build and run using Docker:

```bash
docker build -t echointunee-ml .
docker run -p 5001:5001 echointunee-ml
```

## API Endpoints

### Health Check
```
GET /health
```

### Detect Emotion
```
POST /api/detect-emotion
Content-Type: application/json

{
  "text": "I am so happy today!"
}

Response:
{
  "emotion": "happy",
  "probability": 0.85,
  "all_emotions": {
    "happy": 0.85
  }
}
```

### Batch Detection
```
POST /api/batch-detect
Content-Type: application/json

{
  "texts": [
    "I am so happy today!",
    "I feel anxious about tomorrow."
  ]
}

Response:
{
  "results": [
    {
      "emotion": "happy",
      "probability": 0.85,
      "all_emotions": {...}
    },
    {
      "emotion": "anxious",
      "probability": 0.78,
      "all_emotions": {...}
    }
  ]
}
```

## Emotions Detected

1. **joy** - Extreme happiness, bliss
2. **happy** - General positive feeling
3. **excited** - High energy, enthusiasm
4. **calm** - Peaceful, relaxed
5. **neutral** - No strong emotion
6. **anxious** - Worried, nervous
7. **sad** - Unhappy, disappointed
8. **angry** - Frustrated, upset
9. **fear** - Scared, afraid
10. **love** - Affection, care

## Future Enhancements

- [ ] Train custom ML model with user data
- [ ] Integrate transformer models (BERT, RoBERTa)
- [ ] Multi-language support
- [ ] Emotion intensity scoring
- [ ] Context-aware emotion detection
- [ ] Real-time emotion tracking

## Model Training

To train a custom model (future feature):

```python
from emotion_detector import EmotionDetector

detector = EmotionDetector()

# Prepare training data
texts = ["I am happy", "I am sad", ...]
labels = ["happy", "sad", ...]

# Train
detector.train_model(texts, labels)
```

## Technologies

- Flask - Web framework
- scikit-learn - Machine learning
- NLTK - Natural language processing
- NumPy/Pandas - Data processing
- Gunicorn - Production server

## License

MIT License

