import cv2
import numpy as np
import onnxruntime as ort
import os
from typing import List, Dict, Any, Optional

class VLMDetector:
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the VLM detector.
        
        Args:
            model_path: Path to the ONNX model file. If None, uses a simple color-based detection.
        """
        self.model_path = model_path
        self.session = None
        
        if model_path and os.path.exists(model_path):
            try:
                self.session = ort.InferenceSession(model_path)
                self.use_model = True
            except Exception as e:
                print(f"Failed to load model: {e}")
                self.use_model = False
        else:
            self.use_model = False
            print("No model provided, using simple color-based detection")
    
    def detect_objects(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect objects in a frame.
        
        Args:
            frame: Input frame as numpy array (BGR format)
            
        Returns:
            List of detected objects with bounding boxes and labels
        """
        if self.use_model and self.session:
            return self._detect_with_model(frame)
        else:
            return self._detect_simple(frame)
    
    def _detect_with_model(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect objects using the loaded ONNX model.
        This is a placeholder implementation - you would need to adjust this
        based on your specific model's input/output format.
        """
        # Resize frame to model input size (example: 640x640)
        input_size = (640, 640)
        resized_frame = cv2.resize(frame, input_size)
        
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
        
        # Normalize pixel values to [0, 1]
        input_image = rgb_frame.astype(np.float32) / 255.0
        
        # Change HWC to CHW format
        input_image = np.transpose(input_image, (2, 0, 1))
        
        # Add batch dimension
        input_image = np.expand_dims(input_image, axis=0)
        
        # Run inference
        try:
            if self.session is not None:
                outputs = self.session.run(None, {'input': input_image})
                
                # Process outputs (this depends on your model's output format)
                # This is a simplified example - you would need to adjust based on your model
                detections = []
                if len(outputs) > 0:
                    # Assuming output is [batch_size, num_detections, 6] where last dimension is [x1, y1, x2, y2, confidence, class_id]
                    # Handle SparseTensor conversion if needed
                    output = outputs[0]
                    # Convert to numpy array if it's not already a numpy array
                    # This handles SparseTensor and other special types
                    if not isinstance(output, np.ndarray):
                        try:
                            # Use np.asarray which can handle most array-like objects including sparse tensors
                            output = np.asarray(output)
                        except Exception as e:
                            print(f"Error converting output to numpy array: {e}")
                            # Fallback to np.array conversion
                            output = np.array(output)
                    
                    # Access first batch (first element)
                    if len(output) > 0:
                        output = output[0]
                    
                    for detection in output:
                        x1, y1, x2, y2, conf, class_id = detection
                        if conf > 0.5:  # Confidence threshold
                            # Convert coordinates back to original frame size
                            h, w = frame.shape[:2]
                            x1 = int(x1 * w / input_size[0])
                            y1 = int(y1 * h / input_size[1])
                            x2 = int(x2 * w / input_size[0])
                            y2 = int(y2 * h / input_size[1])
                            
                            detections.append({
                                'bbox': [x1, y1, x2, y2],
                                'confidence': float(conf),
                                'class_id': int(class_id),
                                'label': f'object_{int(class_id)}'
                            })
                
                return detections
            else:
                return []
        except Exception as e:
            print(f"Error during model inference: {e}")
            return []
    
    def _detect_simple(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Optimized multi-color object detection.
        """
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        detections = []
        
        # Define color ranges for multiple objects
        colors = {
            'red': ([0, 50, 50], [10, 255, 255], [170, 50, 50], [180, 255, 255]),
            'blue': ([100, 50, 50], [130, 255, 255]),
            'green': ([40, 50, 50], [80, 255, 255]),
            'yellow': ([20, 50, 50], [40, 255, 255])
        }
        
        kernel = np.ones((3, 3), np.uint8)
        
        for color_name, ranges in colors.items():
            if len(ranges) == 4:  # Red has two ranges
                mask1 = cv2.inRange(hsv, np.array(ranges[0]), np.array(ranges[1]))
                mask2 = cv2.inRange(hsv, np.array(ranges[2]), np.array(ranges[3]))
                mask = mask1 + mask2
            else:
                mask = cv2.inRange(hsv, np.array(ranges[0]), np.array(ranges[1]))
            
            # Clean up mask
            mask = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_OPEN, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 300:  # Lower threshold for better detection
                    x, y, w, h = cv2.boundingRect(contour)
                    # Filter out very thin or very wide rectangles
                    aspect_ratio = w / h if h > 0 else 0
                    if 0.2 < aspect_ratio < 5.0:
                        detections.append({
                            'bbox': [x, y, x + w, y + h],
                            'confidence': min(0.95, area / 8000),
                            'class_id': list(colors.keys()).index(color_name),
                            'label': color_name
                        })
        
        return detections

def draw_detections(frame: np.ndarray, detections: List[Dict[str, Any]]) -> np.ndarray:
    """
    Draw detection bounding boxes on a frame.
    
    Args:
        frame: Input frame as numpy array (BGR format)
        detections: List of detections from detect_objects
        
    Returns:
        Frame with drawn detections
    """
    result_frame = frame.copy()
    
    for detection in detections:
        x1, y1, x2, y2 = detection['bbox']
        confidence = detection['confidence']
        label = detection['label']
        
        # Draw bounding box
        cv2.rectangle(result_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
        # Draw label
        label_text = f"{label}: {confidence:.2f}"
        cv2.putText(result_frame, label_text, (x1, y1 - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    
    return result_frame