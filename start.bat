@echo off
setlocal enabledelayedexpansion

echo [start] Checking dependencies...

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.9+
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [start] Installing backend dependencies...
python -m pip install -r server/requirements.txt
if errorlevel 1 (
    echo Error: Failed to install Python dependencies
    pause
    exit /b 1
)

echo [start] Installing frontend dependencies...
if not exist "client\node_modules" (
    cd client
    npm install
    if errorlevel 1 (
        echo Error: Failed to install Node.js dependencies
        pause
        exit /b 1
    )
    cd ..
)

echo [start] Starting backend on http://localhost:8000
start "Backend Server" python -m uvicorn server.app:app --host 0.0.0.0 --port 8000

echo [start] Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo [start] Starting frontend on http://localhost:5173
cd client
start "Frontend Server" npm run dev -- --host 0.0.0.0
cd ..

echo.
echo [start] Launch complete
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo Phone-join:
echo   1) Open http://localhost:5173 on laptop
echo   2) Scan the QR code or open the shown URL on your phone
echo   3) Start Camera -^> Start Detection
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.

pause