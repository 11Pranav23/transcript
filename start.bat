@echo off
REM YouTube Transcript Generator - Windows Startup Script

color 0A
echo.
echo ========================================
echo YouTube Transcript Generator
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js ^(
for /f "tokens=*" %%i in ('node --version') do echo %%i^)
echo [OK] npm ^(
for /f "tokens=*" %%i in ('npm --version') do echo %%i^)
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
    echo [WARNING] backend\.env not found. Creating from template...
    copy "backend\.env.example" "backend\.env"
    echo [WARNING] IMPORTANT: Edit backend\.env and add your API keys!
    echo.
    pause
)

echo Starting services...
echo.

REM Start backend in new window
echo [*] Starting Backend Server on port 5000...
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
echo [*] Starting Frontend Server on port 3000...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo [INFO] Backend:  http://localhost:5000
echo [INFO] Frontend: http://localhost:3000
echo.
echo Frontend will open automatically in your browser.
echo You can close this window when done.
echo.
pause
