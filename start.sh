#!/bin/bash

# YouTube Transcript Generator - Startup Script
# This script starts both backend and frontend servers

set -e

echo "🚀 Starting YouTube Transcript Generator..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install it from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js ${NC}$(node --version)"
echo -e "${GREEN}✓ npm ${NC}$(npm --version)"
echo ""

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found. Creating from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit backend/.env and add your API keys!${NC}"
    echo ""
fi

echo -e "${YELLOW}Starting Backend Server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

sleep 3

echo -e "${YELLOW}Starting Frontend Server...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✓ Backend running on: http://localhost:5000${NC}"
echo -e "${GREEN}✓ Frontend running on: http://localhost:3000${NC}"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
