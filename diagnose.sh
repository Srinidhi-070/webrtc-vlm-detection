#!/usr/bin/env bash
set -euo pipefail

echo "=== WebRTC VLM Detection Diagnostic Tool ==="
echo ""

# Check if ports are already in use
echo "Checking port usage..."
if lsof -i :8000 >/dev/null 2>&1; then
    echo "❌ Port 8000 (backend) is already in use"
    echo "   Process: $(lsof -t -i :8000)"
else
    echo "✅ Port 8000 (backend) is available"
fi

if lsof -i :5173 >/dev/null 2>&1; then
    echo "❌ Port 5173 (frontend) is already in use"
    echo "   Process: $(lsof -t -i :5173)"
else
    echo "✅ Port 5173 (frontend) is available"
fi

echo ""

# Check network connectivity
echo "Checking network interfaces..."
if command -v ip >/dev/null 2>&1; then
  ip addr show | grep "inet " | grep -v "127.0.0.1"
elif command -v ifconfig >/dev/null 2>&1; then
  ifconfig | grep "inet " | grep -v "127.0.0.1"
elif command -v ipconfig >/dev/null 2>&1; then
  ipconfig | findstr "IPv4"
else
  echo "Could not get IP addresses"
fi

echo ""
echo "=== Quick Fix Commands ==="
echo "To kill existing processes:"
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
  echo "  taskkill /F /PID $(lsof -t -i :8000 2>/dev/null || echo 'none')"
  echo "  taskkill /F /PID $(lsof -t -i :5173 2>/dev/null || echo 'none')"
else
  echo "  kill $(lsof -t -i :8000 2>/dev/null || echo 'none')"
  echo "  kill $(lsof -t -i :5173 2>/dev/null || echo 'none')"
fi
echo ""
echo "To start correctly:"
echo "  ./start.sh"
echo ""
echo "To start manually:"
echo "  Terminal 1: python -m uvicorn server.app:app --host 0.0.0.0 --port 8000"
echo "  Terminal 2: cd client && npm run dev -- --host 0.0.0.0 --port 5173"
