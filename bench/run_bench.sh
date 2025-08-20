#!/usr/bin/env bash
set -euo pipefail

# Simple bench script to collect metrics.json for a short run.
# Usage: ./bench/run_bench.sh --duration 30 --mode server

DURATION=30
MODE="server"
PORT=8000

while [[ $# -gt 0 ]]; do
  case "$1" in
    --duration)
      DURATION="$2"; shift 2;;
    --mode)
      MODE="$2"; shift 2;;
    --port)
      PORT="$2"; shift 2;;
    *) shift;;
  esac
done

# PORT is already set from argument parsing or defaults

echo "[bench] Resetting metrics on :$PORT..."
curl -s -X POST http://localhost:${PORT}/metrics/reset >/dev/null || true

echo "[bench] Running for ${DURATION}s..."
sleep "$DURATION"

echo "[bench] Fetching metrics.json from :$PORT..."
curl -s http://localhost:${PORT}/metrics | jq . > metrics.json || curl -s http://localhost:${PORT}/metrics > metrics.json

echo "[bench] Done. metrics.json written."
