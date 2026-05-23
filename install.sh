#!/bin/bash

# Smart Transcript Hub - Unix/Linux/Mac Quick Start Script
# This script automates the installation process

set -e  # Exit on error

echo ""
echo "============================================"
echo "  Smart Transcript Hub - Quick Installer"
echo "============================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python installation
echo "[1/6] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python 3 is not installed${NC}"
    echo "Install with:"
    echo "  Mac: brew install python3"
    echo "  Linux: sudo apt-get install python3"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}SUCCESS: $PYTHON_VERSION found${NC}"
echo ""

# Check FFmpeg installation
echo "[2/6] Checking FFmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}WARNING: FFmpeg not found${NC}"
    echo "Install with:"
    echo "  Mac: brew install ffmpeg"
    echo "  Linux: sudo apt-get install ffmpeg"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}SUCCESS: FFmpeg found${NC}"
fi
echo ""

# Navigate to backend directory
echo "[3/6] Setting up backend..."
cd smart-hub-backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python packages..."
pip install -q -r requirements.txt 2>/dev/null || pip install -r requirements.txt

echo -e "${GREEN}SUCCESS: Dependencies installed${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}WARNING: Please edit .env and add your OPENAI_API_KEY${NC}"
    echo "Edit the file and update: OPENAI_API_KEY=sk-your-key-here"
    read -p "Press Enter to continue..."
fi

# Create uploads directory
mkdir -p uploads

# Go back to root
cd ..

# Setup frontend
echo "[4/6] Verifying frontend..."
if [ ! -f "smart-hub-frontend/index.html" ]; then
    echo -e "${RED}ERROR: Frontend index.html not found${NC}"
    exit 1
fi
echo -e "${GREEN}SUCCESS: Frontend ready${NC}"
echo ""

# Display next steps
clear
echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "[5/6] Your application is ready to run!"
echo ""
echo "START BACKEND (Terminal 1):"
echo "  cd smart-hub-backend"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""
echo "START FRONTEND (Terminal 2):"
echo "  cd smart-hub-frontend"
echo "  python -m http.server 8000"
echo ""
echo "[6/6] Open your browser:"
echo "  http://localhost:8000"
echo ""
echo "============================================"
echo ""
echo "IMPORTANT CHECKLIST:"
echo "[ ] Get OpenAI API key from https://platform.openai.com/api-keys"
echo "[ ] Edit smart-hub-backend/.env and add OPENAI_API_KEY"
echo "[ ] Verify FFmpeg is installed (ffmpeg -version)"
echo "[ ] Run the backend and frontend in separate terminals"
echo ""
echo "Need help?"
echo "- Read: SMART_HUB_SETUP.md"
echo "- Backend docs: smart-hub-backend/README.md"
echo "- Frontend docs: smart-hub-frontend/README.md"
echo ""

read -p "Press Enter to exit..."
