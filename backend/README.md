# PhishGuard AI - Backend

> AI-Powered Phishing Email Detection System with Explainable AI

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3-orange.svg)](https://scikit-learn.org/)

## 🎯 Overview

PhishGuard AI is an intelligent phishing email detection system that uses machine learning to analyze emails and identify phishing attempts. It provides explainable AI through SHAP values, showing users exactly which features contributed to the classification.

### Key Features

- **Multi-Model ML Pipeline**: Compares Naive Bayes, Logistic Regression, Random Forest, and Gradient Boosting
- **Explainable AI**: SHAP-based explanations for every prediction
- **Real-time Analysis**: Instant email classification via REST API
- **Feature Extraction**: 27+ features including URL analysis, linguistic patterns, and structural elements
- **Batch Processing**: Analyze multiple emails simultaneously
- **Analytics Dashboard**: Track trends, statistics, and model performance
- **History Management**: Store and retrieve past analyses

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Dataset Preparation](#-dataset-preparation)
- [Training Models](#-training-models)
- [Running the API](#-running-the-api)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Development](#-development)

---

## 🚀 Installation

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- 4GB+ RAM recommended

### Step 1: Clone the Repository

```bash
cd backend
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Download NLTK Data

```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

### Step 5: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings (optional - defaults work fine)
nano .env
```

---

## 🎬 Quick Start

### Option 1: Use Sample Dataset (For Testing)

```bash
# Generate a sample dataset for testing
python scripts/generate_sample_data.py

# Preprocess the data
python scripts/preprocess.py --input data/raw/sample_emails.csv --output data/processed/features.csv

# Train models
python scripts/train.py --data data/processed/features.csv --output data/models

# Start API server
uvicorn app.main:app --reload --port 8000
```

### Option 2: Use Your Own Dataset

```bash
# 1. Place your dataset in data/raw/
# Your CSV should have columns: 'text' or 'Email Text', and 'label' or 'Email Type'
# Labels should be 0/1 or "Phishing"/"Safe" or similar

# 2. Preprocess
python scripts/preprocess.py --input data/raw/your_dataset.csv

# 3. Train models
python scripts/train.py --data data/processed/features.csv

# 4. Start API
uvicorn app.main:app --reload --port 8000
```

### Verify Installation

Visit [http://localhost:8000/docs](http://localhost:8000/docs) to see the interactive API documentation.

---

## 📊 Dataset Preparation

### Recommended Datasets

1. **Kaggle Phishing Email Dataset**: https://www.kaggle.com/datasets/subhajournal/phishingemails
2. **Nazario Phishing Corpus**: https://monkey.org/~jose/phishing/
3. **SpamAssassin Public Corpus**: https://spamassassin.apache.org/old/publiccorpus/

### Dataset Format

Your CSV file should contain:

| Column Name | Description | Example |
|------------|-------------|---------|
| `text` or `Email Text` | Full email content | "Dear Customer, Your account..." |
| `label` or `Email Type` | Classification | 0/1 or "Phishing"/"Safe" |

**Example CSV:**

```csv
text,label
"Dear Customer, Your account has been suspended. Click here to verify...",Phishing
"Hey Sarah, Meeting tomorrow at 3pm. See you there!",Safe
```

### Preprocessing

The preprocessing script will:

1. Clean HTML tags and normalize text
2. Extract 27+ features from each email
3. Create a processed CSV ready for training

```bash
python scripts/preprocess.py \
    --input data/raw/your_dataset.csv \
    --output data/processed/features.csv
```

---

## 🤖 Training Models

### Train All Models

```bash
python scripts/train.py \
    --data data/processed/features.csv \
    --output data/models
```

This will train 4 models:

1. **Naive Bayes** - Fast baseline model
2. **Logistic Regression** - Linear model with feature coefficients
3. **Random Forest** - Ensemble tree-based model
4. **Gradient Boosting** - Advanced boosting model

### Training Output

After training, you'll have:

```
data/models/
├── scaler.joblib                    # Feature scaler
├── feature_names.json               # Feature name mapping
├── naive_bayes.joblib              # Trained model
├── naive_bayes_metrics.json        # Model metrics
├── logistic_regression.joblib
├── logistic_regression_metrics.json
├── random_forest.joblib
├── random_forest_metrics.json
├── gradient_boosting.joblib
├── gradient_boosting_metrics.json
└── all_metrics.json                # Combined metrics
```

### Expected Performance

On a balanced phishing dataset, you should see:

| Model | Accuracy | Precision | Recall | F1 Score | ROC AUC |
|-------|----------|-----------|--------|----------|---------|
| Naive Bayes | 0.92 | 0.91 | 0.90 | 0.90 | 0.96 |
| Logistic Regression | 0.95 | 0.94 | 0.93 | 0.93 | 0.97 |
| Random Forest | **0.96** | **0.96** | **0.95** | **0.95** | **0.98** |
| Gradient Boosting | 0.96 | 0.95 | 0.94 | 0.95 | 0.98 |

---

## 🌐 Running the API

### Start Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

### Start Production Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Environment Variables

Edit `.env` file to configure:

```bash
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_PATH=./data/phishguard.db
DEFAULT_MODEL=random_forest
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 📚 API Documentation

### Interactive Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### 1. Analyze Email

**POST** `/api/analyze`

```json
{
  "subject": "Urgent: Your account has been suspended",
  "body": "Dear Customer, We have detected unauthorized access...",
  "model_name": "random_forest"
}
```

**Response:**

```json
{
  "prediction": "phishing",
  "confidence": 0.947,
  "threat_level": "high",
  "risk_score": 87,
  "model_used": "random_forest",
  "risk_indicators": [
    {
      "indicator": "Urgency Language Detected",
      "detail": "High urgency score: 0.45",
      "severity": "high"
    }
  ],
  "feature_importance": [...],
  "highlighted_words": [...]
}
```

#### 2. Batch Analysis

**POST** `/api/batch`

```json
{
  "emails": [
    {"subject": "Test 1", "body": "Email content 1"},
    {"subject": "Test 2", "body": "Email content 2"}
  ],
  "model_name": "random_forest"
}
```

#### 3. Get Models

**GET** `/api/models`

Returns metrics for all trained models.

#### 4. Dashboard Stats

**GET** `/api/dashboard/stats?days=7`

Returns analytics and trends.

#### 5. History

**GET** `/api/history?limit=50&offset=0`

Returns past analysis results.

### Test with cURL

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "URGENT: Account Suspended",
    "body": "Dear Customer, Your account has been suspended. Click here immediately: http://192.168.1.1/verify",
    "model_name": "random_forest"
  }'
```

---

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application
│   ├── config.py                   # Configuration management
│   ├── features/
│   │   ├── extractor.py           # Main feature extraction
│   │   ├── url_analyzer.py        # URL analysis
│   │   ├── text_analyzer.py       # Text features
│   │   └── linguistic.py          # NLP features
│   ├── models/
│   │   ├── trainer.py             # Model training
│   │   ├── predictor.py           # Prediction logic
│   │   └── model_registry.py      # Model management
│   ├── explainability/
│   │   └── shap_explainer.py      # SHAP explanations
│   ├── routes/
│   │   ├── analyze.py             # /analyze endpoint
│   │   ├── batch.py               # /batch endpoint
│   │   ├── models.py              # /models endpoint
│   │   ├── dashboard.py           # /dashboard endpoint
│   │   └── history.py             # /history endpoint
│   ├── schemas/
│   │   ├── request.py             # Request models
│   │   └── response.py            # Response models
│   ├── database/
│   │   ├── db.py                  # Database operations
│   │   └── models.py              # SQLAlchemy models
│   └── utils/
│       └── email_parser.py        # .eml file parser
├── data/
│   ├── raw/                       # Raw datasets
│   ├── processed/                 # Processed features
│   └── models/                    # Trained models
├── scripts/
│   ├── preprocess.py              # Data preprocessing
│   ├── train.py                   # Model training
│   └── generate_sample_data.py    # Sample data generator
├── requirements.txt
├── .env.example
└── README.md
```

---

## ⚙️ Configuration

### Feature Extraction

The system extracts 27+ features:

**Text/Linguistic** (13 features):
- urgency_score, threat_score, reward_score
- grammar_error_count, sentiment_score
- word_count, avg_word_length
- capitalized_word_ratio, exclamation_count
- special_char_ratio
- has_greeting, generic_greeting, has_signature

**URL Features** (9 features):
- url_count, has_ip_url, has_shortened_url
- url_domain_mismatch, has_suspicious_tld
- has_https, url_length_max
- has_at_in_url, subdomain_count_max

**Structural Features** (4 features):
- has_html, has_attachment_mention
- has_form, link_text_ratio

### Model Configuration

Default model: **Random Forest** (best F1 score)

To change default model, edit `.env`:

```bash
DEFAULT_MODEL=gradient_boosting
```

---

## 🔧 Development

### Run Tests

```bash
pytest tests/
```

### Code Style

```bash
# Format code
black app/

# Lint
flake8 app/
```

### Adding New Features

1. Edit `app/features/extractor.py`
2. Add feature to `EmailFeatures` dataclass
3. Implement extraction logic
4. Retrain models with new features

### Adding New Models

1. Edit `app/models/trainer.py`
2. Add model to `MODELS` dictionary
3. Retrain all models
4. Model will automatically appear in `/api/models`

---

## 📝 Sample Test Emails

### Phishing Example

```
Subject: ⚠️ URGENT: Your Account Has Been Compromised!

Dear Valued Customer,

We have detected unauthorized access to your account. Your account has been
temporarily suspended for your protection.

You must verify your identity immediately to restore access. Failure to do
so within 24 hours will result in permanent account termination.

Click here to verify: http://192.168.1.1/secure/verify?user=target

If you do not act now, your personal information may be at risk.

Sincerely,
Security Team
```

### Legitimate Example

```
Subject: Team sync - Thursday at 3pm

Hey Sarah,

Just wanted to confirm our team sync is still on for Thursday at 3pm in
Conference Room B.

I'll be presenting the Q3 results and would love your input on the marketing
section. Could you bring the latest campaign metrics?

Also, lunch at that new Thai place after? My treat!

Best,
Mike
```

---

## 🐛 Troubleshooting

### Models Not Loading

```
⚠ Warning: No trained models found!
```

**Solution**: Train models first:
```bash
python scripts/train.py --data data/processed/features.csv
```

### Import Errors

```
ModuleNotFoundError: No module named 'app'
```

**Solution**: Make sure you're in the `backend/` directory and virtual environment is activated.

### Database Errors

```
sqlalchemy.exc.OperationalError: unable to open database file
```

**Solution**: Check `DATABASE_PATH` in `.env` and ensure the directory exists.

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check `/docs` endpoint for API documentation
- Review logs in console for debugging

---

## 🎓 Academic Use

This project is designed for educational purposes and AI class projects. It demonstrates:

- End-to-end ML pipeline development
- Feature engineering for NLP tasks
- Model comparison and evaluation
- Explainable AI implementation
- RESTful API design
- Production-ready software architecture

Perfect for:
- Machine Learning course projects
- Cybersecurity capstone projects
- Data Science portfolios
- Research on phishing detection

---

**Built with ❤️ for AI Security Education**
