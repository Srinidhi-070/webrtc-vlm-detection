@echo off
echo Starting single ngrok tunnel (free tier)...

echo Starting frontend tunnel (port 5173) - backend will be proxied through this...
start /B ngrok http 5173

echo Waiting for tunnel to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Starting application servers...
start /B python -m uvicorn server.app:app --host 0.0.0.0 --port 8000

cd client
start /B npm run dev
cd ..

echo.
echo ✅ Single tunnel setup complete!
echo 📱 Check the QR code at http://localhost:5173 
echo 🌐 Your app is accessible from anywhere with internet using ONE ngrok tunnel
echo 💡 Backend is proxied through frontend (free tier compatible)
echo.
echo Press any key to stop all services...
pause >nul

echo Stopping services...
taskkill /F /IM ngrok.exe 2>nul
taskkill /F /IM python.exe 2>nul  
taskkill /F /IM node.exe 2>nul