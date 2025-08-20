// Lightweight ONNX Runtime Web integration with graceful fallback
// This module attempts to load a model and perform object detection inference.
// If loading/inference fails, callers should fallback to a simple heuristic.

import * as ort from 'onnxruntime-web';

export async function initWasmDetector({
  modelUrl = '/models/model.onnx',
  inputSize = 320,
  numThreads = 1,
  wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/',
} = {}) {
  try {
    // Configure ORT WASM
    ort.env.wasm.numThreads = numThreads;
    // Suggest CDN path for WASM assets (works in dev and Docker builds)
    ort.env.wasm.wasmPaths = wasmPaths;

    const session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });

    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];

    async function detectFromCanvas(offCanvas) {
      try {
        // Preprocess: resize to square inputSize, CHW, float /255
        const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
        const inW = inputSize;
        const inH = inputSize;
        // Reuse canvas to avoid memory allocation overhead
        if (!this.resizeCanvas) {
          this.resizeCanvas = document.createElement('canvas');
        }
        this.resizeCanvas.width = inW; 
        this.resizeCanvas.height = inH;
        const tctx = this.resizeCanvas.getContext('2d');
        tctx.drawImage(offCanvas, 0, 0, inW, inH);
        const img = tctx.getImageData(0, 0, inW, inH).data;

      const data = new Float32Array(inW * inH * 3);
      // HWC -> CHW normalized
      for (let y = 0; y < inH; y++) {
        for (let x = 0; x < inW; x++) {
          const i = (y * inW + x) * 4;
          const r = img[i] / 255;
          const g = img[i + 1] / 255;
          const b = img[i + 2] / 255;
          const idx = y * inW + x;
          data[idx] = r;                    // R
          data[inW * inH + idx] = g;        // G
          data[2 * inW * inH + idx] = b;    // B
        }
      }

      const tensor = new ort.Tensor('float32', data, [1, 3, inH, inW]);
      const outputs = await session.run({ [inputName]: tensor });
      const out = outputs[outputName];

      // Attempt generic parsing of detection output
      // Expecting shape [1, N, 6] or [N, 6]: [x1,y1,x2,y2,score,class]
      let detections = [];
      let arr = out.data || out; // TypedArray
      let shape = out.dims || out.shape || [];

      // Flatten heuristics
      if (arr && shape && shape.length >= 2) {
        let N, stride;
        if (shape.length === 3 && shape[0] === 1) {
          N = shape[1];
          stride = shape[2];
        } else if (shape.length === 2) {
          N = shape[0];
          stride = shape[1];
        }
        if (stride >= 6) {
          for (let i = 0; i < N; i++) {
            const base = i * stride;
            const x1 = arr[base + 0];
            const y1 = arr[base + 1];
            const x2 = arr[base + 2];
            const y2 = arr[base + 3];
            const score = arr[base + 4];
            const cls = arr[base + 5] | 0;
            if (score >= 0.35 && x2 > x1 && y2 > y1) {
              // Assume coordinates are in pixels of inputSize; normalize to [0,1]
              detections.push({
                label: `obj_${cls}`,
                score: Number(score),
                xmin: Math.max(0, Math.min(1, x1 / inW)),
                ymin: Math.max(0, Math.min(1, y1 / inH)),
                xmax: Math.max(0, Math.min(1, x2 / inW)),
                ymax: Math.max(0, Math.min(1, y2 / inH)),
              });
            }
          }
        }
      }

        return detections;
      } catch (error) {
        console.error('Error during WASM detection:', error);
        return [];
      }
    }

    return {
      ready: true,
      detect: detectFromCanvas,
      inputSize,
    };
  } catch (e) {
    console.warn('WASM detector initialization failed; fallback will be used.', e);
    return { ready: false, detect: async () => [], inputSize };
  }
}
