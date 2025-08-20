@echo off
echo Setting up remote access...

echo Building frontend...
cd client
call npm run build
cd ..

echo Starting backend with built frontend...
set SERVE_BUILT=true
start /B python -m uvicorn server.app:app --host 0.0.0.0 --port 8000

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Starting ngrok tunnel...
start /B ngrok http 8000

echo.
echo ✅ Setup complete!
echo 📱 Go to http://localhost:8000 and scan the QR code
echo 🌐 The QR code will show the ngrok URL for remote access
echo.
echo Press any key to stop...
pause >nul

echo Stopping services...
taskkill /F /IM ngrok.exe 2>nul
taskkill /F /IM python.exe 2>nul