let currentStream = null;
let captureCanvas = null;

export async function startLocalCamera(videoEl, onFrame) {
  try {
    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
  videoEl.srcObject = currentStream;

  const rVFC = videoEl.requestVideoFrameCallback?.bind(videoEl);
  let rafId;

  if (rVFC) {
    const onVfc = () => {
      onFrame && onFrame();
      rVFC(onVfc);
    };
    rVFC(onVfc);
  } else {
    const tick = () => {
      onFrame && onFrame();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  videoEl._cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
  };

    // ✅ Return the stream so App.jsx can use it for WebRTC
    return currentStream;
  } catch (error) {
    console.error('Camera access failed:', error);
    throw new Error('Failed to access camera. Please check permissions.');
  }
}

export function stopLocalCamera(videoEl) {
  if (videoEl?._cleanup) videoEl._cleanup();
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop());
    currentStream = null;
  }
  if (videoEl) {
    videoEl.srcObject = null;
  }
}

export function captureFrame(videoEl, targetW, targetH) {
  try {
    if (!videoEl) return null;

    const vw = videoEl.videoWidth || 0;
    const vh = videoEl.videoHeight || 0;
    const w = targetW && targetH ? targetW : vw;
    const h = targetW && targetH ? targetH : vh;
    if (!w || !h) return null;

    // Reuse canvas to avoid memory allocation overhead
    if (!captureCanvas) {
      captureCanvas = document.createElement('canvas');
    }
    captureCanvas.width = w;
    captureCanvas.height = h;

    const ctx = captureCanvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, w, h);

    return captureCanvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('Frame capture failed:', error);
    return null;
  }
}
