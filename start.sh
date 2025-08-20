#!/usr/bin/env bash
set -euo pipefail

# Simple convenience launcher for local development
# Usage:
#   ./start.sh [--mode wasm|server] [--ngrok]
# Defaults:
#   MODE=server (placeholder for future WASM mode)

MODE="server"
USE_NGROK=0

for arg in "$@"; do
  case "$arg" in
    --mode)
      echo "error: --mode requires a value (wasm|server)" >&2
      exit 1
      ;;
    --mode=wasm)
      MODE="wasm"
      ;;
    --mode=server)
      MODE="server"
      ;;
    --ngrok)
      USE_NGROK=1
      shift
      ;;
    *) ;;
  esac
done

# Kill child processes on exit
pids=()
cleanup() {
  printf "\nShutting down..."
  for p in "${pids[@]}"; do
    if kill -0 "$p" 2>/dev/null; then
      kill "$p" 2>/dev/null || true
    fi
  done
}
trap cleanup EXIT

# Ensure Python deps installed (using system Python)
echo "[start] Installing backend dependencies..."
python -m pip install -r server/requirements.txt >/dev/null

# Ensure Node deps installed
if [ ! -d "client/node_modules" ]; then
  echo "[start] Installing frontend dependencies..."
  (cd client && npm install)
fi

# Optional: launch ngrok in background if requested (frontend + backend)
if [ "$USE_NGROK" -eq 1 ]; then
  if ! command -v ngrok >/dev/null 2>&1; then
    echo "[warn] ngrok not found in PATH; skipping ngrok startup"
  else
    echo "[start] Launching ngrok for backend (8000) and frontend (5173)"
    # Start two ngrok tunnels in background; requires ngrok.yml configuration
    ngrok http 8000 >/dev/null & pids+=($!)
    ngrok http 5173 >/dev/null & pids+=($!)
  fi
fi

# Start backend
echo "[start] Starting backend on http://localhost:8000"
python -m uvicorn server.app:app --host 0.0.0.0 --port 8000 &
pids+=($!)

# Warn if wasm mode without model present
if [ "$MODE" = "wasm" ] && [ ! -f "client/public/models/model.onnx" ]; then
  echo "[warn] WASM mode selected but no model found at client/public/models/model.onnx"
  echo "       Place a small model there or run: ./scripts/download_model.sh"
fi

# Start frontend (Vite dev server)
echo "[start] Starting frontend on http://localhost:5173 (MODE=${MODE})"
# Export VITE_MODE for the frontend build/runtime
(cd client && VITE_MODE=${MODE} npm run dev -- --host 0.0.0.0) &
pids+=($!)

# Display summary
cat <<EOF

[start] Launch complete
  Backend:  http://localhost:8000
  Frontend: http://localhost:5173

Phone-join:
  1) Open http://localhost:5173 on laptop
  2) Scan the QR code or open the shown URL on your phone
  3) Start Camera -> Start Detection

Press Ctrl+C to stop both servers.
EOF

# Wait on both
wait