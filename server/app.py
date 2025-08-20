from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Body, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import qrcode
import io
import base64
import requests
import os
import cv2
import numpy as np
from typing import List, Dict, Any
import json
from pathlib import Path
import time

# Import the VLM detector (absolute import to avoid missing top-level 'utils')
from server.utils.vlm_detector import VLMDetector, draw_detections

app = FastAPI()

# Resolve absolute paths for client build directory
BASE_DIR = Path(__file__).resolve().parent
CLIENT_DIST = (BASE_DIR.parent / "client" / "dist").resolve()

from fastapi.responses import FileResponse

# Check if we should serve built files or proxy to dev server
SERVE_BUILT = os.getenv("SERVE_BUILT", "false").lower() == "true"

if SERVE_BUILT and CLIENT_DIST.exists():
    # Serve built frontend files
    app.mount("/assets", StaticFiles(directory=str(CLIENT_DIST / "assets")), name="assets")
    if (CLIENT_DIST / "models").exists():
        app.mount("/models", StaticFiles(directory=str(CLIENT_DIST / "models")), name="models")

@app.get("/")
async def read_index():
    if SERVE_BUILT and CLIENT_DIST.exists():
        return FileResponse(str(CLIENT_DIST / "index.html"))
    else:
        return {"message": "Development mode - use http://localhost:5173"}

@app.get("/bypass.html")
async def bypass_page():
    if SERVE_BUILT and CLIENT_DIST.exists():
        bypass_file = CLIENT_DIST / "bypass.html"
        if bypass_file.exists():
            return FileResponse(str(bypass_file))
    return FileResponse(str(BASE_DIR.parent / "client" / "public" / "bypass.html"))

# Initialize the VLM detector
detector = VLMDetector()

def get_local_ip():
    """Get the local network IP address."""
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

def get_tunnel_url():
    """Check for active tunnel services."""
    # Check ngrok API for single tunnel
    try:
        resp = requests.get("http://127.0.0.1:4040/api/tunnels", timeout=2).json()
        for tunnel in resp["tunnels"]:
            if ":8000" in tunnel["config"]["addr"] or ":5173" in tunnel["config"]["addr"]:
                public_url = tunnel["public_url"]
                return public_url, public_url  # Same URL for both frontend and backend
    except:
        pass
    
    # Fallback to local IP
    local_ip = get_local_ip()
    serve_built = os.getenv("SERVE_BUILT", "false").lower() == "true"
    if serve_built:
        return f"http://{local_ip}:8000", f"http://{local_ip}:8000"
    else:
        return f"http://{local_ip}:5173", f"http://{local_ip}:5173"

# Removed ngrok function - using local IP only

# Allow all origins for development (less secure but more flexible)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

peers = []
detection_clients = []

# Metrics state
metrics_state = {
    "frames": [],  # list of {frame_id, capture_ts, recv_ts, inference_ts, overlay_display_ts}
    "uplink_bytes": 0,
    "downlink_bytes": 0,
    "start_ts": None,
}

@app.websocket("/ws")
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    peers.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Relay to all other peers
            for peer in peers[:]:
                if peer != websocket:
                    try:
                        await peer.send_text(data)
                    except:
                        peers.remove(peer)
    except WebSocketDisconnect:
        if websocket in peers:
            peers.remove(websocket)

@app.websocket("/ws/detection")
@app.websocket("/api/ws/detection")
async def detection_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time detection results."""
    await websocket.accept()
    detection_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in detection_clients:
            detection_clients.remove(websocket)

@app.post("/metrics/reset")
@app.post("/api/metrics/reset")
async def metrics_reset():
    metrics_state["frames"] = []
    metrics_state["uplink_bytes"] = 0
    metrics_state["downlink_bytes"] = 0
    metrics_state["start_ts"] = int(time.time() * 1000)
    return {"ok": True}

@app.post("/metrics/frame")
@app.post("/api/metrics/frame")
async def metrics_frame(data: Dict[str, Any] = Body(...)):
    # Expect: frame_id, capture_ts, recv_ts, inference_ts, overlay_display_ts
    try:
        required = ["frame_id", "capture_ts", "recv_ts", "inference_ts", "overlay_display_ts"]
        if not all(k in data for k in required):
            return {"error": "missing required fields"}
        metrics_state["frames"].append({
            "frame_id": data["frame_id"],
            "capture_ts": int(data["capture_ts"]),
            "recv_ts": int(data["recv_ts"]),
            "inference_ts": int(data["inference_ts"]),
            "overlay_display_ts": int(data["overlay_display_ts"]),
        })
        return {"ok": True}
    except Exception as e:
        return {"error": str(e)}

@app.get("/metrics")
@app.get("/api/metrics")
async def metrics_get():
    # Compute metrics over collected frames
    import statistics
    frames = metrics_state["frames"]
    if len(frames) == 0:
        result = {
            "count_frames": 0,
            "median_e2e_ms": None,
            "p95_e2e_ms": None,
            "server_latency_median_ms": None,
            "network_latency_median_ms": None,
            "processed_fps": 0,
            "uplink_kbps": 0,
            "downlink_kbps": 0,
        }
    else:
        e2e = [(f["overlay_display_ts"] - f["capture_ts"]) for f in frames if f["overlay_display_ts"] >= f["capture_ts"]]
        server_lat = [(f["inference_ts"] - f["recv_ts"]) for f in frames if f["inference_ts"] >= f["recv_ts"]]
        net_lat = [(f["recv_ts"] - f["capture_ts"]) for f in frames if f["recv_ts"] >= f["capture_ts"]]
        duration_ms = (
            (max(f["overlay_display_ts"] for f in frames) - metrics_state["start_ts"]) if metrics_state["start_ts"] else (max(f["overlay_display_ts"] for f in frames) - min(f["capture_ts"] for f in frames))
        )
        duration_s = max(1e-3, duration_ms / 1000.0)
        processed_fps = len(frames) / duration_s
        uplink_kbps = (metrics_state["uplink_bytes"] * 8) / duration_s / 1000.0
        downlink_kbps = (metrics_state["downlink_bytes"] * 8) / duration_s / 1000.0

        def p95(vals):
            if not vals:
                return None
            vals_sorted = sorted(vals)
            idx = int(0.95 * (len(vals_sorted) - 1))
            return vals_sorted[idx]

        result = {
            "count_frames": len(frames),
            "median_e2e_ms": statistics.median(e2e) if e2e else None,
            "p95_e2e_ms": p95(e2e),
            "server_latency_median_ms": statistics.median(server_lat) if server_lat else None,
            "network_latency_median_ms": statistics.median(net_lat) if net_lat else None,
            "processed_fps": processed_fps,
            "uplink_kbps": uplink_kbps,
            "downlink_kbps": downlink_kbps,
        }

    # Persist metrics.json at repo root
    try:
        metrics_path = (BASE_DIR.parent / "metrics.json").resolve()
        with open(metrics_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
    except Exception as e:
        print(f"Failed to write metrics.json: {e}")

    return result

@app.post("/detect")
@app.post("/api/detect")
async def detect_objects(request: Request, frame_data: Dict[str, Any] = Body(...)):
    """
    Process a frame and return detection results following the specified contract.

    Expects JSON body with:
      - image: base64 data URL or base64 string
      - frame_id: optional string/int
      - capture_ts: optional ms timestamp from client
    """
    try:
        # Basic CSRF protection (skip for ngrok)
        if not request.headers.get("X-Requested-With") and not request.headers.get("ngrok-skip-browser-warning"):
            return {"error": "Invalid request"}
            
        recv_ts = int(time.time() * 1000)

        # Extract metadata
        frame_id = frame_data.get("frame_id")
        capture_ts = frame_data.get("capture_ts")

        # Extract image data from base64
        image_data = frame_data.get("image", "")
        if not image_data:
            return {"error": "No image data provided"}

        # Remove data URL prefix if present
        if image_data.startswith("data:image"):
            image_data = image_data.split(",")[1]

        # Decode base64 image
        # Track uplink bytes (approx actual image bytes)
        image_bytes = base64.b64decode(image_data)
        metrics_state["uplink_bytes"] += len(image_bytes)
        image_array = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if frame is None:
            return {"error": "Failed to decode image"}

        h, w = frame.shape[:2]

        # Run detection and mark inference completion time
        detections_raw = detector.detect_objects(frame)
        inference_ts = int(time.time() * 1000)

        # Convert to normalized contract format
        detections_contract = []
        for det in detections_raw:
            # det: {bbox: [x1,y1,x2,y2], confidence, label}
            bbox = det.get("bbox", [0, 0, 0, 0])
            x1, y1, x2, y2 = bbox
            xmin = max(0.0, min(1.0, float(x1) / max(1, w)))
            ymin = max(0.0, min(1.0, float(y1) / max(1, h)))
            xmax = max(0.0, min(1.0, float(x2) / max(1, w)))
            ymax = max(0.0, min(1.0, float(y2) / max(1, h)))
            detections_contract.append({
                "label": det.get("label", "object"),
                "score": float(det.get("confidence", 0.0)),
                "xmin": xmin,
                "ymin": ymin,
                "xmax": xmax,
                "ymax": ymax,
            })

        result = {
            "frame_id": frame_id if frame_id is not None else "unknown",
            "capture_ts": int(capture_ts) if capture_ts is not None else None,
            "recv_ts": recv_ts,
            "inference_ts": inference_ts,
            "detections": detections_contract,
        }

        # Broadcast to detection clients
        payload = json.dumps(result)
        # Count bytes once per client to estimate total downlink
        for client in detection_clients[:]:
            try:
                await client.send_text(payload)
                metrics_state["downlink_bytes"] += len(payload)
            except (WebSocketDisconnect, ConnectionResetError, RuntimeError):
                detection_clients.remove(client)
            except Exception as e:
                print(f"Error sending to detection client: {e}")
                detection_clients.remove(client)

        return result
    except Exception as e:
        print(f"Error in detect_objects: {e}")
        return {"error": str(e)}

@app.get("/backend-url")
@app.get("/api/backend-url")
async def get_backend_url():
    """Return the current frontend and backend URLs for frontend to use."""
    frontend_url, backend_url = get_tunnel_url()
    return {
        "frontend_url": frontend_url,
        "backend_url": backend_url
    }

@app.get("/qr")
@app.get("/api/qr")
async def get_qr():
    """Generate QR code with the correct frontend URL."""
    frontend_url, _ = get_tunnel_url()
    
    # Use bypass page for ngrok to avoid browser warning
    if 'ngrok' in frontend_url:
        url = f"{frontend_url}/bypass.html?peer=1"
    else:
        url = f"{frontend_url}/?peer=1"
    
    qr = qrcode.make(url)
    buf = io.BytesIO()
    qr.save(buf, "PNG")
    img_str = base64.b64encode(buf.getvalue()).decode()
    
    is_local = 'localhost' in url or '192.168.' in url or '10.' in url
    network_msg = "Make sure both devices are on same WiFi" if is_local else "Works from anywhere with internet"
    
    return HTMLResponse(f"""
    <div style="text-align: center; font-family: Arial;">
        <img src='data:image/png;base64,{img_str}' style='width: 200px; height: 200px;' />
        <p><strong>Scan with phone:</strong></p>
        <p style="font-size: 14px; color: #666;">{url}</p>
        <p style="font-size: 12px; color: #999;">{network_msg}</p>
    </div>
    """)
