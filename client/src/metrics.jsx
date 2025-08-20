import React, { useRef, useState } from 'react'

export function useFpsMeter() {
  const [fps, setFps] = useState(0)
  const last = useRef({ t: performance.now(), frames: 0 })

  const tick = () => {
    const now = performance.now()
    const elapsed = now - last.current.t
    last.current.frames++
    if (elapsed >= 1000) {
      setFps(Math.round((last.current.frames * 1000) / elapsed))
      last.current.t = now
      last.current.frames = 0
    }
  }

  return { fps, tick }
}

export function MetricsPane({ fps }) {
  return (
    <div className="metrics">
      <div><strong>FPS:</strong> {fps}</div>
    </div>
  )
}
