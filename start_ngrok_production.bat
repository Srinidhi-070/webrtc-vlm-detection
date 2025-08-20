@echo off
echo Building frontend for production...
cd client
call npm run build
cd ..

echo Starting backend with built frontend...
set SERVE_BUILT=true
start /B python -m uvicorn server.app:app --host 0.0.0.0 --port 8000

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Starting ngrok tunnel on port 8000...
start /B ngrok http 8000

echo.
echo ✅ Production setup complete!
echo 📱 The QR code will show the ngrok URL
echo 🌐 Everything runs through port 8000 (ngrok-compatible)
echo.
echo Press any key to stop all services...
pause >nul

echo Stopping services...
taskkill /F /IM ngrok.exe 2>nul
taskkill /F /IM python.exe 2>nul