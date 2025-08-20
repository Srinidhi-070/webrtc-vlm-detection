@echo off
echo Building and running WebRTC VLM Detection in Docker...

echo Building Docker image...
docker build -t webrtc-vlm-detection .

echo Starting container...
docker run -d --name webrtc-vlm -p 8000:8000 webrtc-vlm-detection

echo.
echo ✅ Container started!
echo 📱 Open http://localhost:8000 and scan QR code with your phone
echo 🔧 To stop: docker stop webrtc-vlm
echo 🗑️ To remove: docker rm webrtc-vlm
echo.

timeout /t 3 /nobreak >nul
start http://localhost:8000