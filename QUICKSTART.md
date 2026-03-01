# PhishGuard AI - Quick Start Guide

Get up and running in **5 minutes**! 🚀

---

## 📋 Prerequisites

- Python 3.10 or higher
- pip (comes with Python)
- 4GB+ RAM

---

## 🎯 Method 1: Automated Setup (Recommended)

### On Linux/Mac:

```bash
cd backend
./setup.sh
```

### On Windows:

```cmd
cd backend
setup.bat
```

This will automatically:
1. Create a virtual environment
2. Install all dependencies
3. Generate sample training data
4. Preprocess the data
5. Train all 4 ML models
6. Set up the database

**Then start the server:**

```bash
# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start API server
uvicorn app.main:app --reload
```

Visit **http://localhost:8000/docs** to see the API! ✅

---

## 🔧 Method 2: Manual Setup

### Step 1: Install Dependencies

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

### Step 2: Prepare Data

```bash
# Generate sample dataset
python scripts/generate_sample_data.py

# Preprocess data (extract features)
python scripts/preprocess.py --input data/raw/sample_emails.csv
```

### Step 3: Train Models

```bash
# Train all 4 models (takes 2-3 minutes)
python scripts/train.py --data data/processed/features.csv
```

### Step 4: Start API Server

```bash
uvicorn app.main:app --reload --port 8000
```

Visit **http://localhost:8000/docs** for interactive API documentation!

---

## 🧪 Test the API

### Using the Web Interface

Open http://localhost:8000/docs and try the `/api/analyze` endpoint:

**Input:**
```json
{
  "subject": "URGENT: Account Suspended!",
  "body": "Dear Customer, Your account has been suspended. Click here immediately: http://192.168.1.1/verify",
  "model_name": "random_forest"
}
```

### Using cURL

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "URGENT: Account Suspended!",
    "body": "Dear Customer, Your account has been suspended. Click here: http://192.168.1.1/verify",
    "model_name": "random_forest"
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/analyze",
    json={
        "subject": "URGENT: Account Suspended!",
        "body": "Dear Customer, Click here immediately: http://192.168.1.1/verify",
        "model_name": "random_forest"
    }
)

result = response.json()
print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']:.2%}")
print(f"Threat Level: {result['threat_level']}")
```

---

## 🎨 Expected Output

```json
{
  "prediction": "phishing",
  "confidence": 0.94,
  "threat_level": "critical",
  "risk_score": 94,
  "model_used": "random_forest",
  "risk_indicators": [
    {
      "indicator": "Urgency Language Detected",
      "detail": "High urgency score: 0.45",
      "severity": "high"
    },
    {
      "indicator": "IP-Based URL Detected",
      "detail": "Email contains URLs using IP addresses",
      "severity": "critical"
    },
    {
      "indicator": "Generic Greeting",
      "detail": "Email uses 'Dear Customer' instead of a name",
      "severity": "medium"
    }
  ],
  "feature_importance": [
    {
      "feature": "urgency_score",
      "value": 0.45,
      "impact": 0.34,
      "direction": "phishing"
    },
    {
      "feature": "has_ip_url",
      "value": 1.0,
      "impact": 0.28,
      "direction": "phishing"
    }
  ]
}
```

---

## 📚 Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze a single email |
| `/api/batch` | POST | Analyze multiple emails |
| `/api/models` | GET | Get all model performance metrics |
| `/api/dashboard/stats` | GET | Get analytics dashboard data |
| `/api/history` | GET | Get analysis history |
| `/api/health` | GET | Health check |
| `/docs` | GET | Interactive API documentation |

---

## 🔍 Using Your Own Dataset

### Step 1: Prepare CSV File

Your CSV should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `text` or `Email Text` | Email content | "Your account has been..." |
| `label` or `Email Type` | 0/1 or Phishing/Safe | "Phishing" or 1 |

**Example CSV:**
```csv
text,label
"URGENT! Your account will be closed. Click here: http://evil.com",Phishing
"Hey Sarah, meeting at 3pm tomorrow. See you there!",Safe
"Congratulations! You won $1000000. Claim now: http://scam.xyz",Phishing
```

### Step 2: Preprocess

```bash
python scripts/preprocess.py --input data/raw/your_dataset.csv
```

### Step 3: Train

```bash
python scripts/train.py --data data/processed/features.csv
```

### Step 4: Restart API

```bash
uvicorn app.main:app --reload
```

Your custom models are now loaded! 🎉

---

## 🎯 Model Selection

Four models are available:

| Model | Best For | Speed | Accuracy |
|-------|----------|-------|----------|
| `naive_bayes` | Quick baseline | ⚡⚡⚡ | 92% |
| `logistic_regression` | Interpretability | ⚡⚡ | 95% |
| `random_forest` | **Best overall** (default) | ⚡ | **96%** |
| `gradient_boosting` | Highest precision | ⚡ | 96% |

To use a specific model:
```json
{
  "subject": "Test",
  "body": "Test email",
  "model_name": "gradient_boosting"
}
```

---

## 🐛 Troubleshooting

### "No models found" Error

```bash
python scripts/train.py --data data/processed/features.csv
```

### Port Already in Use

```bash
# Use a different port
uvicorn app.main:app --reload --port 8080
```

### Module Not Found

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Windows: venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Error

```bash
# Delete and recreate database
rm data/phishguard.db
uvicorn app.main:app --reload
```

---

## 📖 Next Steps

1. **Explore API Docs**: http://localhost:8000/docs
2. **Read Backend README**: [backend/README.md](backend/README.md)
3. **Try Different Models**: Compare all 4 models via `/api/models`
4. **Build Frontend**: Use the spec in the main README
5. **Train on Real Data**: Use Kaggle phishing datasets

---

## 🎓 Learning Resources

- **SHAP Explainability**: https://shap.readthedocs.io/
- **FastAPI Tutorial**: https://fastapi.tiangolo.com/tutorial/
- **scikit-learn Guide**: https://scikit-learn.org/stable/user_guide.html
- **Phishing Detection Research**: Search "phishing detection machine learning" on Google Scholar

---

## 💡 Tips

- Use `random_forest` for best accuracy
- Check `/api/dashboard/stats` for analytics
- Use `/api/batch` for analyzing multiple emails
- View `/api/history` to see past analyses
- Try different models and compare results

---

## ✅ Success Checklist

- [ ] Virtual environment created and activated
- [ ] Dependencies installed
- [ ] Sample data generated
- [ ] Data preprocessed
- [ ] Models trained (should see 4 .joblib files in data/models/)
- [ ] API server running
- [ ] Can access http://localhost:8000/docs
- [ ] Successfully analyzed a test email

---

## 🎉 You're Ready!

Your PhishGuard AI backend is now running! Start analyzing emails and exploring the API.

For questions, check the main README or create an issue on GitHub.

**Happy phishing hunting! 🛡️**
