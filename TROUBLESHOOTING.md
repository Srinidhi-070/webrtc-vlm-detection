# Troubleshooting Guide

## Common Issues and Solutions

### 1. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::8000`
**Solution**:
```bash
# Kill processes on ports
./diagnose.sh
# Or manually:
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### 2. Camera Access Denied
**Error**: Camera not working in browser
**Solution**:
- Check browser permissions (click lock icon in address bar)
- Ensure HTTPS for remote access
- Try different browsers (Chrome recommended)

### 3. WebSocket Connection Failed
**Error**: WebSocket connection errors in console
**Solution**:
- Check firewall settings
- Ensure backend is running on port 8000
- Try restarting both servers

### 4. Python Import Errors
**Error**: `ModuleNotFoundError: No module named 'server'`
**Solution**:
- Run from project root directory
- Ensure __init__.py files exist (fixed in this version)

### 5. Node.js Dependencies
**Error**: npm install fails
**Solution**:
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### 6. WASM Model Loading
**Error**: Model not found for WASM mode
**Solution**:
```bash
# Download test model
./scripts/download_model.sh
# Or manually place model.onnx in client/public/models/
```

### 7. Network Issues (Phone Connection)
**Error**: QR code shows localhost, phone can't connect
**Solution**:
- Find your laptop's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Open `http://YOUR_IP:5173?peer=1` on phone
- Ensure both devices on same WiFi network

### 8. Performance Issues
**Symptoms**: High CPU usage, low FPS
**Solutions**:
- Reduce video resolution in browser
- Increase detection interval (modify 100ms timeout in App.jsx)
- Use WASM mode for client-side processing

### 9. CORS Errors
**Error**: Cross-origin request blocked
**Solution**:
- Server already configured for development CORS
- For production, configure specific origins

### 10. Build Errors
**Error**: Vite build fails
**Solution**:
```bash
cd client
rm -rf dist node_modules
npm install
npm run build
```

## Debug Commands

```bash
# Check what's running on ports
./diagnose.sh

# Test backend directly
curl http://localhost:8000/backend-url

# Check frontend build
cd client && npm run build

# Manual startup for debugging
python -m uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload
cd client && npm run dev -- --host 0.0.0.0
```

## Environment Requirements

- **Python**: 3.9+
- **Node.js**: 18+
- **Browser**: Chrome/Firefox (WebRTC support)
- **Network**: Same WiFi for phone connection

## Still Having Issues?

1. Check browser console for JavaScript errors
2. Check terminal output for server errors
3. Verify all dependencies installed correctly
4. Try the manual startup commands above