# Design Report (1 page)

## Overview
This demo implements real-time multi-object detection on live video streamed from a phone to a browser, with detection results overlaid in near-real time. Two execution modes are provided:
- Server mode: Client sends frames to a FastAPI backend that performs inference and broadcasts results over WebSocket.
- WASM mode (low-resource path): Client performs on-device inference (scaffolded with downscaled color-based detection; ready to swap in onnxruntime-web/tfjs-wasm).

## Architecture & Components
- Client (Vite + React):
  - Captures camera frames via getUserMedia.
  - Server mode: POSTs /detect (frame_id, capture_ts). Listens on WS /ws/detection for results and overlays boxes.
  - WASM mode: Downscales to 320×240 and runs lightweight detection in-browser.
  - WebRTC (signaling relay): Minimal peer relay via WS /ws. STUN configured for broader connectivity.
  - Metrics: Posts /metrics/frame when overlays are displayed.
- Server (FastAPI):
  - /detect: Decodes base64, runs detector, returns detections and timestamps with normalized [0..1] coords.
  - /ws/detection: Broadcasts detection results to subscribers.
  - /metrics: Tracks e2e and latency metrics; writes metrics.json.
  - Static serving: Serves client/dist with absolute paths.

## Detection Contract
Server result format per frame:
{
  "frame_id": "string_or_int",
  "capture_ts": 1690000000000,
  "recv_ts": 1690000000100,
  "inference_ts": 1690000000120,
  "detections": [
    { "label": "object", "score": 0.9, "xmin": 0.1, "ymin": 0.1, "xmax": 0.3, "ymax": 0.4 }
  ]
}
- Coordinates normalized [0..1] for resolution-agnostic overlays.
- Client uses capture_ts and frame_id for alignment.

## Low-resource mode
- WASM path: Targets on-device inference using onnxruntime-web or tfjs-wasm (small quantized model such as MobileNet-SSD/YOLOv5n). The current scaffold uses color-based detection to verify the pipeline; swapping in a model requires loading the .onnx/.json weights and binding the execution provider (wasm or webgl when available).
- Downscale: 320×240 capture for inference.
- Target FPS: 10���15 FPS to fit CPU-bound devices.
- Backpressure: Process-latest policy (see below) to prevent latency build-up.
- Benefits: No GPU required; resilient to variable networks; privacy by keeping inference on-device.

## Backpressure & queueing
- Process-latest strategy:
  - Maintain at most one pending frame per pipeline stage; when a new frame arrives and the previous one hasn’t been processed, drop the older one.
  - In server mode, the client samples at ~10 FPS and avoids queuing additional POSTs while one is in-flight (can be improved by tracking promise state and skipping if pending).
  - In WASM mode, the detector runs at a fixed interval; if processing drifts, it simply acts on the most recent camera frame at the next tick.
- Frame thinning:
  - Fixed sampling interval (~100 ms). On overload, the next tick will use the most recent frame, effectively dropping stale frames.

## Trade-offs & rationale
- Simplicity of topology: One backend service; optional front-end dev server. Minimizes infra for a reproducible demo.
- Contract-first: Normalized coords and timestamps standardize overlays across resolutions and simplify latency measurement.
- WASM-first fallback: Guarantees a no-GPU path on modest laptops while retaining a server mode for consistency.

## Known limitations & next improvements
- WASM mode currently uses a toy color-based detector; next step is integrating a small quantized model with onnxruntime-web or tfjs-wasm.
- STUN-only WebRTC may be insufficient under restrictive NAT; adding TURN would improve connectivity.
- Network bandwidth estimation is based on payload sizes; for finer accuracy, integrate WebRTC getStats for RTP bitrate.
- Adaptive FPS: Add dynamic sampling (increase/decrease capture interval) based on CPU load and e2e latency.

## Measurement methodology
- E2E latency (per frame): overlay_display_ts - capture_ts.
- Server latency: inference_ts - recv_ts.
- Network latency: recv_ts - capture_ts.
- Processed FPS: frames displayed / duration.
- Bandwidth: Estimated from payload sizes over duration (uplink/downlink kbps), cross-check with DevTools.

## Security & privacy considerations
- CORS relaxed for local development.
- For production, restrict origins and use HTTPS for all endpoints; prefer on-device inference in WASM mode.

## Conclusion
This implementation delivers a working demo with server-mode detection, WASM low-resource scaffolding, standardized metrics, and a clear path to integrate a real WASM model and finalize documentation/bench requirements.
