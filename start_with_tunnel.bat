@echo off
echo Choose remote access method:
echo 1. LocalTunnel (free, no signup)
echo 2. Cloudflare Tunnel (free, no signup) 
echo 3. Local network only
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Starting with LocalTunnel...
    start /B npx localtunnel --port 5173 --subdomain webrtc-vlm-frontend
    start /B npx localtunnel --port 8000 --subdomain webrtc-vlm-backend
    echo {"frontend": "https://webrtc-vlm-frontend.loca.lt", "backend": "https://webrtc-vlm-backend.loca.lt"} > tunnel_urls.txt
    echo Frontend: https://webrtc-vlm-frontend.loca.lt
    echo Backend: https://webrtc-vlm-backend.loca.lt
) else if "%choice%"=="2" (
    echo Starting with Cloudflare Tunnel...
    start /B cloudflared tunnel --url http://localhost:5173
    start /B cloudflared tunnel --url http://localhost:8000
    echo Check terminal output for tunnel URLs
) else (
    echo Using local network only...
)

echo.
echo Starting servers...
start /B python -m uvicorn server.app:app --host 0.0.0.0 --port 8000
cd client
start /B npm run dev
cd ..

echo.
echo Servers started! Check the QR code in your browser.
pause