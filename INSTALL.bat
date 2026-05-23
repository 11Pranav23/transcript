@echo off
REM Smart Transcript Hub - Windows Quick Start Script
REM This script automates the installation process

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Smart Transcript Hub - Quick Installer
echo ============================================
echo.

REM Check Python installation
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Download from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)
echo SUCCESS: Python found
echo.

REM Check FFmpeg installation
echo [2/6] Checking FFmpeg installation...
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo WARNING: FFmpeg not found
    echo Download from: https://ffmpeg.org/download.html
    echo Or install with: choco install ffmpeg
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "!continue!"=="y" exit /b 1
)
echo SUCCESS: FFmpeg found
echo.

REM Navigate to backend directory
echo [3/6] Setting up backend...
cd smart-hub-backend

REM Check if venv exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python packages...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo SUCCESS: Dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env >nul
    echo WARNING: Please edit .env and add your OPENAI_API_KEY
    echo Open .env file and update: OPENAI_API_KEY=sk-your-key-here
    pause
)

REM Create uploads directory
if not exist uploads mkdir uploads

REM Go back to root
cd ..

REM Setup frontend
echo [4/6] Verifying frontend...
if not exist smart-hub-frontend\index.html (
    echo ERROR: Frontend index.html not found
    pause
    exit /b 1
)
echo SUCCESS: Frontend ready
echo.

REM Display next steps
cls
echo.
echo ============================================
echo   Installation Complete!
echo ============================================
echo.
echo [5/6] Your application is ready to run!
echo.
echo START BACKEND (Terminal 1):
echo   cd smart-hub-backend
echo   venv\Scripts\activate
echo   python app.py
echo.
echo START FRONTEND (Terminal 2):
echo   cd smart-hub-frontend
echo   python -m http.server 8000
echo.
echo [6/6] Open your browser:
echo   http://localhost:8000
echo.
echo ============================================
echo.
echo IMPORTANT CHECKLIST:
echo [ ] Get OpenAI API key from https://platform.openai.com/api-keys
echo [ ] Edit smart-hub-backend\.env and add OPENAI_API_KEY
echo [ ] Verify FFmpeg is installed (ffmpeg -version)
echo [ ] Run the backend and frontend in separate terminals
echo.
echo Need help?
echo - Read: SMART_HUB_SETUP.md
echo - Backend docs: smart-hub-backend\README.md
echo - Frontend docs: smart-hub-frontend\README.md
echo.
pause
