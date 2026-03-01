@echo off
REM PhishGuard AI - Quick Setup Script for Windows

echo ========================================
echo PhishGuard AI - Quick Setup
echo ========================================
echo.

REM Check Python
echo 1. Checking Python version...
python --version || (
    echo Error: Python not found. Please install Python 3.10+
    exit /b 1
)

REM Create virtual environment
echo.
echo 2. Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    echo    OK Virtual environment created
) else (
    echo    OK Virtual environment already exists
)

REM Activate virtual environment
echo.
echo 3. Activating virtual environment...
call venv\Scripts\activate
echo    OK Virtual environment activated

REM Install dependencies
echo.
echo 4. Installing dependencies...
python -m pip install --upgrade pip >nul
pip install -r requirements.txt
echo    OK Dependencies installed

REM Download NLTK data
echo.
echo 5. Downloading NLTK data...
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True)"
echo    OK NLTK data downloaded

REM Create directories
echo.
echo 6. Creating data directories...
if not exist "data\raw" mkdir data\raw
if not exist "data\processed" mkdir data\processed
if not exist "data\models" mkdir data\models
echo    OK Directories created

REM Generate sample data
echo.
echo 7. Generating sample dataset...
python scripts\generate_sample_data.py
echo    OK Sample data generated

REM Preprocess data
echo.
echo 8. Preprocessing data...
python scripts\preprocess.py --input data\raw\sample_emails.csv --output data\processed\features.csv
echo    OK Data preprocessed

REM Train models
echo.
echo 9. Training models (this may take a few minutes)...
python scripts\train.py --data data\processed\features.csv --output data\models
echo    OK Models trained

REM Done
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now start the API server:
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload
echo.
echo Then visit: http://localhost:8000/docs
echo ========================================
pause
