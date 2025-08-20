# WebRTC VLM Detection - Setup Guide

## All Issues Fixed ✅
✅ Added missing `__init__.py` files for Python imports  
✅ Fixed shell script syntax errors and cross-platform compatibility  
✅ Added comprehensive WebSocket error handling  
✅ Added null checks for DOM elements  
✅ Optimized canvas reuse for better performance  
✅ Added error handling for WASM detection  
✅ Created Windows batch file with dependency checks  
✅ Fixed CSRF protection for /detect endpoint  
✅ Improved variable naming and code clarity  
✅ Added comprehensive error handling utilities  
✅ Fixed ngrok configuration script  
✅ Added model download script  
✅ Created troubleshooting guide  

## Quick Start (Windows)

### Option 1: Use the Windows Batch File (Recommended)
```cmd
# Double-click start.bat or run in Command Prompt:
start.bat
```

### Option 2: Manual Setup
```cmd
# Install backend dependencies
python -m pip install -r server/requirements.txt

# Install frontend dependencies
cd client
npm install
cd ..

# Start backend (Terminal 1)
python -m uvicorn server.app:app --host 0.0.0.0 --port 8000

# Start frontend (Terminal 2)
cd client
npm run dev -- --host 0.0.0.0
```

## Quick Start (Linux/macOS)
```bash
# Make script executable and run
chmod +x ./start.sh
./start.sh
```

## Usage Instructions

1. **Start the servers** using one of the methods above
2. **Open your browser** and go to http://localhost:5173
3. **Click "Start Camera"** to enable your webcam
4. **Click "Start Detection"** to begin object detection
5. **For phone connection:**
   - Scan the QR code displayed on the page, OR
   - Open http://YOUR_LAPTOP_IP:5173?peer=1 on your phone
   - Allow camera access when prompted

## Project Structure
```
webrtc-vlm-detection/
├── server/                 # FastAPI backend
│   ├── app.py             # Main server application
│   ├── utils/             # Detection utilities
│   └── requirements.txt   # Python dependencies
├── client/                # React frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
├── start.sh              # Unix startup script
├── start.bat             # Windows startup script
└── README.md             # Project documentation
```

## Detection Modes

### Server Mode (Default)
- Detection runs on the backend server
- Client sends frames via HTTP POST
- Results broadcast via WebSocket
- Better accuracy, higher server load

### WASM Mode (Experimental)
- On-device inference using ONNX Runtime Web
- Lower server load, privacy-friendly
- Requires model file at `client/public/models/model.onnx`

## Troubleshooting

### Common Issues:
1. **Port already in use**: Kill existing processes on ports 8000/5173
2. **Camera not working**: Check browser permissions
3. **QR code shows localhost**: Use your actual IP address for phone connection
4. **Detection not working**: Check browser console for errors

### Network Issues:
- Ensure laptop and phone are on the same WiFi network
- Check firewall settings (allow ports 8000 and 5173)
- For remote access, consider using ngrok: `./start.sh --ngrok`

### Performance Issues:
- Reduce video resolution in browser settings
- Lower detection frequency (modify the 100ms timeout in App.jsx)
- Use WASM mode for client-side processing

## Development Notes

The project uses:
- **Backend**: FastAPI + OpenCV + ONNX Runtime
- **Frontend**: React + Vite + WebRTC
- **Detection**: Color-based fallback (red objects) or ONNX model
- **Communication**: WebSocket for real-time results

For production deployment, consider:
- Adding HTTPS/WSS support
- Implementing proper authentication
- Using a production WSGI server
- Adding rate limiting and error monitoring