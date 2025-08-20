#!/usr/bin/env bash
set -euo pipefail

# Download a small ONNX model for testing
MODEL_DIR="client/public/models"
MODEL_URL="https://github.com/ultralytics/yolov5/releases/download/v7.0/yolov5n.onnx"
MODEL_FILE="$MODEL_DIR/model.onnx"

echo "Creating models directory..."
mkdir -p "$MODEL_DIR"

if [ -f "$MODEL_FILE" ]; then
    echo "Model already exists at $MODEL_FILE"
    exit 0
fi

echo "Downloading YOLOv5n model..."
if command -v curl >/dev/null 2>&1; then
    curl -L "$MODEL_URL" -o "$MODEL_FILE"
elif command -v wget >/dev/null 2>&1; then
    wget "$MODEL_URL" -O "$MODEL_FILE"
else
    echo "Error: Neither curl nor wget found. Please install one of them."
    exit 1
fi

echo "Model downloaded to $MODEL_FILE"
echo "File size: $(du -h "$MODEL_FILE" | cut -f1)"