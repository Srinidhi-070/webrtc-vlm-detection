@echo off
echo Pushing WebRTC VLM Detection to GitHub...

echo Initializing Git repository...
git init

echo Adding remote repository...
git remote add origin https://github.com/Srinidhi-070/webrtc-vlm-detection.git

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "🎉 Initial commit: WebRTC VLM Detection with dual camera support

✨ Features:
- 📱 Phone-to-PC WebRTC streaming
- 🤖 Real-time object detection
- 🎯 Multi-color detection (red, blue, green, yellow)
- 🐳 Docker containerization
- 🌐 Remote access via ngrok
- 📊 Live metrics and FPS counter
- 🔧 Cross-platform support

🚀 Quick Start:
- Docker: docker-compose up --build
- Local: start.bat (Windows) or ./start.sh (Linux/macOS)
- Remote: Use ngrok for internet access

💻 Tech Stack: React + FastAPI + WebRTC + OpenCV + Docker"

echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Successfully pushed to GitHub!
echo 🌐 Repository: https://github.com/Srinidhi-070/webrtc-vlm-detection
echo.
pause