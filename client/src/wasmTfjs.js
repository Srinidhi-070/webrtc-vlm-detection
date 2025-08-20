// TFJS WASM + coco-ssd inference utility
// Loads tfjs-wasm backend and coco-ssd, then provides a detect(offscreenCanvas) function

import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-wasm'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

export async function initTfjsWasmCoco({ inputWidth = 320, inputHeight = 240 } = {}) {
  // Set WASM backend path (TFJS hosts wasm binaries via CDN); can be overridden by setting TFJS_WASM_PATH env if needed
  // In modern tfjs, wasm binaries are auto-resolved; no manual path needed unless offline.

  await tf.setBackend('wasm')
  await tf.ready()

  const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' })

  async function detect(offCanvas) {
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true })
    const resizeCanvas = document.createElement('canvas')
    resizeCanvas.width = inputWidth
    resizeCanvas.height = inputHeight
    const resizeCtx = resizeCanvas.getContext('2d')
    resizeCtx.drawImage(offCanvas, 0, 0, inputWidth, inputHeight)

    const predictions = await model.detect(resizeCanvas)

    const detections = []
    for (const p of predictions) {
      const [x, y, w, h] = p.bbox // pixel bbox on inputWidth x inputHeight
      const xmin = Math.max(0, Math.min(1, x / inputWidth))
      const ymin = Math.max(0, Math.min(1, y / inputHeight))
      const xmax = Math.max(0, Math.min(1, (x + w) / inputWidth))
      const ymax = Math.max(0, Math.min(1, (y + h) / inputHeight))
      detections.push({
        label: p.class,
        score: p.score,
        xmin, ymin, xmax, ymax,
      })
    }
    return detections
  }

  return { ready: true, detect, inputWidth, inputHeight }
}
