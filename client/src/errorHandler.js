// Global error handling utility
export class ErrorHandler {
  static logError(error, context = '') {
    console.error(`[${context}] Error:`, error);
  }

  static handleWebSocketError(error, wsType = 'WebSocket') {
    console.error(`${wsType} error:`, error);
    return false; // Connection failed
  }

  static handleDetectionError(error) {
    console.error('Detection error:', error);
    return []; // Return empty detections
  }

  static handleCameraError(error) {
    console.error('Camera error:', error);
    alert('Camera access failed. Please check permissions.');
    return null;
  }
}