@echo off
echo Starting ngrok tunnels...

echo Starting backend tunnel (port 8000)...
start /B ngrok http 8000

echo Starting frontend tunnel (port 5173)...  
start /B ngrok http 5173

echo Waiting for tunnels to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting application servers...
start /B python -m uvicorn server.app:app --host 0.0.0.0 --port 8000

cd client
start /B npm run dev
cd ..

echo.
echo ✅ All services started!
echo 📱 Check the QR code at http://localhost:5173 - it should now show ngrok URLs
echo 🌐 Your app is accessible from anywhere with internet
echo.
echo Press any key to stop all services...
pause >nul

echo Stopping services...
taskkill /F /IM ngrok.exe 2>nul
taskkill /F /IM python.exe 2>nul  
taskkill /F /IM node.exe 2>nul