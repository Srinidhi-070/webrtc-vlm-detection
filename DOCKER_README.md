# Docker Deployment Guide

## Quick Start

### Option 1: Simple Docker Run
```cmd
docker-run.bat
```

### Option 2: Docker Compose (Local)
```cmd
docker-compose up --build
```

### Option 3: Docker Compose with Remote Access
```cmd
# Set your ngrok auth token
set NGROK_AUTHTOKEN=your_token_here
docker-compose --profile remote up --build
```

## Manual Commands

### Build Image
```cmd
docker build -t webrtc-vlm-detection .
```

### Run Container
```cmd
docker run -d -p 8000:8000 --name webrtc-vlm webrtc-vlm-detection
```

### View Logs
```cmd
docker logs webrtc-vlm
```

### Stop and Remove
```cmd
docker stop webrtc-vlm
docker rm webrtc-vlm
```

## Environment Variables

- `SERVE_BUILT=true` - Serves built frontend files
- `FRONTEND_URL` - Frontend URL for QR code generation
- `BACKEND_URL` - Backend URL for API calls

## Ports

- **8000** - Main application (HTTP + WebSocket)
- **4040** - ngrok web interface (when using remote profile)

## Usage

1. **Start container** using any method above
2. **Open browser** to http://localhost:8000
3. **Scan QR code** with your phone
4. **Start detection** and enjoy real-time object detection!

## Remote Access with ngrok

1. Get auth token from https://dashboard.ngrok.com/get-started/your-authtoken
2. Set environment variable: `NGROK_AUTHTOKEN=your_token`
3. Run: `docker-compose --profile remote up --build`
4. Access via ngrok URL shown in logs

## Troubleshooting

- **Port conflicts**: Change port mapping `-p 8001:8000`
- **Build issues**: Clear Docker cache `docker system prune`
- **Permission issues**: Run Docker as administrator