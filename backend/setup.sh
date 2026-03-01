#!/bin/bash

# PhishGuard AI - Quick Setup Script
# This script sets up the backend environment and trains the models

set -e

echo "========================================"
echo "PhishGuard AI - Quick Setup"
echo "========================================"
echo ""

# Check Python version
echo "1. Checking Python version..."
python3 --version || { echo "Error: Python 3 not found. Please install Python 3.10+"; exit 1; }

# Create virtual environment
echo ""
echo "2. Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "   ✓ Virtual environment created"
else
    echo "   ✓ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "3. Activating virtual environment..."
source venv/bin/activate
echo "   ✓ Virtual environment activated"

# Install dependencies
echo ""
echo "4. Installing dependencies..."
pip install --upgrade pip > /dev/null
pip install -r requirements.txt
echo "   ✓ Dependencies installed"

# Download NLTK data
echo ""
echo "5. Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True)"
echo "   ✓ NLTK data downloaded"

# Create directories
echo ""
echo "6. Creating data directories..."
mkdir -p data/raw data/processed data/models
echo "   ✓ Directories created"

# Generate sample data
echo ""
echo "7. Generating sample dataset..."
python scripts/generate_sample_data.py
echo "   ✓ Sample data generated"

# Preprocess data
echo ""
echo "8. Preprocessing data..."
python scripts/preprocess.py --input data/raw/sample_emails.csv --output data/processed/features.csv
echo "   ✓ Data preprocessed"

# Train models
echo ""
echo "9. Training models (this may take a few minutes)..."
python scripts/train.py --data data/processed/features.csv --output data/models
echo "   ✓ Models trained"

# Done
echo ""
echo "========================================"
echo "Setup Complete! 🎉"
echo "========================================"
echo ""
echo "You can now start the API server:"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Then visit: http://localhost:8000/docs"
echo "========================================"
