#!/bin/bash

# Benchmark script for WebRTC VLM Detection
# Usage: ./bench/run_bench.sh --duration 30 --mode server

set -e

# Default values
DURATION=30
MODE="server"
PORT=8000

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --duration)
      DURATION="$2"
      shift 2
      ;;
    --mode)
      MODE="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🚀 Starting WebRTC VLM Detection Benchmark"
echo "Duration: ${DURATION}s | Mode: ${MODE} | Port: ${PORT}"

# Check if server is running
if ! curl -s http://localhost:${PORT}/api/metrics > /dev/null; then
    echo "❌ Server not running on port ${PORT}"
    echo "Please start the application first:"
    echo "  docker-compose up --build"
    echo "  OR ./start.sh"
    exit 1
fi

# Reset metrics
echo "📊 Resetting metrics..."
curl -s -X POST http://localhost:${PORT}/api/metrics/reset > /dev/null

echo "⏱️  Running benchmark for ${DURATION} seconds..."
echo "📱 Please use your phone to connect and stream video during this time"
echo "🎯 Move colored objects in front of the camera for detection"

# Wait for benchmark duration
sleep ${DURATION}

# Collect metrics
echo "📈 Collecting metrics..."
curl -s http://localhost:${PORT}/api/metrics > metrics.json

# Display results
echo "✅ Benchmark complete! Results saved to metrics.json"
echo ""
echo "📊 Results Summary:"
echo "=================="

if command -v jq &> /dev/null; then
    # Pretty print with jq if available
    cat metrics.json | jq '{
        "frames_processed": .count_frames,
        "median_e2e_latency_ms": .median_e2e_ms,
        "p95_e2e_latency_ms": .p95_e2e_ms,
        "processed_fps": .processed_fps,
        "server_latency_ms": .server_latency_median_ms,
        "network_latency_ms": .network_latency_median_ms,
        "uplink_kbps": .uplink_kbps,
        "downlink_kbps": .downlink_kbps
    }'
else
    # Fallback to basic display
    echo "Frames processed: $(grep -o '"count_frames":[0-9]*' metrics.json | cut -d: -f2)"
    echo "Median E2E latency: $(grep -o '"median_e2e_ms":[0-9.]*' metrics.json | cut -d: -f2)ms"
    echo "P95 E2E latency: $(grep -o '"p95_e2e_ms":[0-9.]*' metrics.json | cut -d: -f2)ms"
    echo "Processed FPS: $(grep -o '"processed_fps":[0-9.]*' metrics.json | cut -d: -f2)"
    echo "Uplink bandwidth: $(grep -o '"uplink_kbps":[0-9.]*' metrics.json | cut -d: -f2) kbps"
    echo "Downlink bandwidth: $(grep -o '"downlink_kbps":[0-9.]*' metrics.json | cut -d: -f2) kbps"
fi

echo ""
echo "📄 Full results available in metrics.json"