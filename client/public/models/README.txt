Place your ONNX model file here as 'model.onnx' for WASM mode.

For testing, you can download a small model:
- YOLOv5n: https://github.com/ultralytics/yolov5/releases/download/v7.0/yolov5n.onnx
- Or use any object detection model that outputs [x1,y1,x2,y2,confidence,class_id] format

The model should accept input shape [1,3,H,W] where H,W are typically 320, 416, or 640.