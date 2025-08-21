import React, { useEffect, useRef, useState } from "react";
import { startLocalCamera, stopLocalCamera, captureFrame } from "./webrtc.js";
import { useFpsMeter } from "./metrics.jsx";

export default function App() {
  // Local and Remote video + canvases
  const localVideoRef = useRef(null);
  const localCanvasRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteCanvasRef = useRef(null);

  // State
  const [stream, setStream] = useState(null);
  const [running, setRunning] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detections, setDetections] = useState([]);
  const { fps, tick } = useFpsMeter();
  const [qrSrc, setQrSrc] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // Signaling + detection sockets
  const signalingRef = useRef(null);
  const detectionWsRef = useRef(null);
  const peerRef = useRef(null);
  const inFlightRef = useRef(false);

  // Helper: resolve WS base for same-origin WebSocket
  const wsBase = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

  // Fetch QR (server returns HTML with <img src='data:...'>)
  const fetchQr = async () => {
    try {
      const res = await fetch(`/api/qr`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (!res.ok) return;
      const html = await res.text();
      const m = html.match(/src='([^']+)'/);
      if (m) setQrSrc(m[1]);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchQr();
    const id = setInterval(fetchQr, 60000); // refresh QR every minute
    return () => clearInterval(id);
  }, []);

  // Start/Stop local camera + overlay loop
  useEffect(() => {
    if (running && localVideoRef.current) {
      startLocalCamera(localVideoRef.current).then((s) => {
        setStream(s);

        // draw overlay each frame (crosshair when not detecting)
        const ctx = localCanvasRef.current.getContext("2d");
        const drawOverlay = () => {
          if (!running) return;
          if (!detecting) {
            ctx.clearRect(0, 0, localCanvasRef.current.width, localCanvasRef.current.height);
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(localCanvasRef.current.width / 2, 0);
            ctx.lineTo(localCanvasRef.current.width / 2, localCanvasRef.current.height);
            ctx.moveTo(0, localCanvasRef.current.height / 2);
            ctx.lineTo(localCanvasRef.current.width, localCanvasRef.current.height / 2);
            ctx.stroke();
          }
          tick();
          requestAnimationFrame(drawOverlay);
        };
        requestAnimationFrame(drawOverlay);
      });
    }
    return () => stopLocalCamera(localVideoRef.current);
  }, [running, detecting]);

  // Draw detection overlays only on remote canvas
  useEffect(() => {
    const canvas = remoteCanvasRef.current;
    const video = remoteVideoRef.current;
    if (!canvas || !video) return;
    
    const updateCanvas = () => {
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (detections.length > 0) {
        detections.forEach((d) => {
          const x1 = Math.round((d.xmin || 0) * canvas.width);
          const y1 = Math.round((d.ymin || 0) * canvas.height);
          const x2 = Math.round((d.xmax || 0) * canvas.width);
          const y2 = Math.round((d.ymax || 0) * canvas.height);
          
          ctx.strokeStyle = "#ff0000";
          ctx.lineWidth = 3;
          ctx.strokeRect(x1, y1, Math.max(1, x2 - x1), Math.max(1, y2 - y1));
          
          const text = `${d.label || "obj"}: ${(d.score || 0).toFixed(2)}`;
          ctx.font = "16px Arial";
          ctx.fillStyle = "#ff0000";
          const tw = ctx.measureText(text).width;
          ctx.fillRect(x1, Math.max(0, y1 - 22), tw + 10, 22);
          ctx.fillStyle = "white";
          ctx.fillText(text, x1 + 5, Math.max(14, y1 - 5));
        });
      }
    };
    
    updateCanvas();
    const resizeObserver = new ResizeObserver(updateCanvas);
    resizeObserver.observe(video);
    
    return () => resizeObserver.disconnect();
  }, [detections]);

  // Auto-start for phone
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("peer") === "1") {
      console.log('📱 Phone mode detected, starting camera...');
      setRunning(true);
    }
  }, []);

  // Auto-connect when stream is ready
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("peer") === "1" && stream && !peerRef.current) {
      console.log('📱 Phone stream ready, connecting...');
      setTimeout(() => {
        connect();
      }, 1000);
    }
  }, [stream]);

  // Signaling + WebRTC connect
  const connect = async () => {
    if (!stream) {
      alert("Start camera first!");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const isPhone = params.get("peer") === "1";

    // Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    peerRef.current = pc;

    // Add local stream
    stream.getTracks().forEach(track => {
      console.log('Adding track:', track.kind);
      pc.addTrack(track, stream);
    });
    console.log('✅ Local stream added to peer connection');

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('✅ Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        console.log('✅ Setting remote stream');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.onloadedmetadata = () => {
            console.log('✅ Remote video metadata loaded');
            remoteVideoRef.current.play().catch(console.error);
          };
        }
      }
    };

    // Connect to signaling server
    signalingRef.current = new WebSocket(`${wsBase}/ws`);
    
    const send = (message) => {
      if (signalingRef.current.readyState === WebSocket.OPEN) {
        signalingRef.current.send(JSON.stringify(message));
        console.log('Sent:', message);
      } else {
        console.log('WebSocket not ready, queuing message');
        signalingRef.current.addEventListener('open', () => {
          signalingRef.current.send(JSON.stringify(message));
          console.log('Sent queued:', message);
        }, { once: true });
      }
    };

    signalingRef.current.onopen = () => {
      console.log('Signaling WebSocket connected');
    };

    signalingRef.current.onerror = (error) => {
      console.error('Signaling WebSocket error:', error);
    };

    signalingRef.current.onclose = () => {
      console.log('Signaling WebSocket closed');
    };

    // Handle signaling messages
    signalingRef.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received signaling message:', message);

        if (message.offer && isPhone) {
          console.log('Phone processing offer');
          await pc.setRemoteDescription(message.offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          send({ answer });
        }

        if (message.answer && !isPhone) {
          console.log('PC processing answer');
          await pc.setRemoteDescription(message.answer);
        }

        if (message.candidate) {
          console.log('Adding ICE candidate');
          await pc.addIceCandidate(message.candidate);
        }
      } catch (error) {
        console.error('Error processing signaling message:', error);
      }
    };

    // Send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send({ candidate: event.candidate });
      }
    };

    // Monitor connection
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setConnectionStatus(pc.connectionState);
    };

    // Wait for WebSocket connection, then start signaling
    signalingRef.current.addEventListener('open', async () => {
      if (!isPhone) {
        console.log('PC creating and sending offer');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        send({ offer });
      }
    }, { once: true });

    console.log(`${isPhone ? 'Phone' : 'PC'} WebRTC setup complete`);
  };

  // Detection WS (listen for results) and frame POST loop
  useEffect(() => {
    let loopId = 0;
    const params = new URLSearchParams(window.location.search);
    const isPhone = params.get("peer") === "1";

    if (detecting) {
      // Open detection WebSocket - only on PC
      if (!isPhone) {
        detectionWsRef.current = new WebSocket(`${wsBase}/ws/detection`);
        
        detectionWsRef.current.onerror = (error) => {
          console.error('Detection WebSocket error:', error);
        };
        
        detectionWsRef.current.onclose = () => {
          console.log('Detection WebSocket closed');
        };
        
        detectionWsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const arr = data.detections || data?.payload?.detections || [];
            if (Array.isArray(arr)) setDetections(arr);
          } catch (e) { /* ignore */ }
        };
      }
      


      // Frame capture loop - detect only on remote camera
      const tickDetect = async () => {
        if (!inFlightRef.current && remoteVideoRef.current && remoteVideoRef.current.readyState >= 2 && connectionStatus === 'connected') {
          const frame = captureFrame(remoteVideoRef.current, 224, 224);
          if (frame) {
            inFlightRef.current = true;
            fetch(`/api/detect`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
              },
              body: JSON.stringify({ 
                image: frame, 
                frame_id: String(Date.now()), 
                capture_ts: Date.now()
              })
            }).finally(() => { inFlightRef.current = false; });
          }
        }
        loopId = window.setTimeout(tickDetect, 200);
      };
      tickDetect();
    }

    return () => {
      if (loopId) window.clearTimeout(loopId);
      try { detectionWsRef.current && detectionWsRef.current.close(); } catch {}
    };
  }, [detecting, wsBase]);

  const params = new URLSearchParams(window.location.search);
  const isPhone = params.get("peer") === "1";

  return (
    <div className="container">
      <header>
        <h1>WebRTC VLM Detection</h1>
        <p className="subtitle">{isPhone ? "📱 Phone Camera" : "💻 PC + Detection"}</p>
      </header>

      <div className="controls">
        {!running ? (
          <button className="primary" onClick={() => setRunning(true)}>
            {isPhone ? "Start Phone Camera" : "Start Camera"}
          </button>
        ) : (
          <button className="primary" onClick={() => setRunning(false)}>Stop Camera</button>
        )}
        {!isPhone && (
          <>
            <button className="primary" onClick={connect} disabled={!running}>Connect Phone</button>
            <button className={detecting ? "primary active" : "primary"} onClick={() => setDetecting(!detecting)} disabled={!running || connectionStatus !== 'connected'}>
              {detecting ? "Stop Detection" : "Start Detection"}
            </button>
          </>
        )}
        {isPhone && (
          <button className="primary" onClick={connect} disabled={!running}>Connect to PC</button>
        )}
      </div>

      {/* QR for phone join - only show on PC */}
      {!isPhone && (
        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <h3>Join from your Phone</h3>
          {qrSrc ? (
            <>
              <img src={qrSrc} alt="QR Code" style={{ width: 200, height: 200 }} />
              <p style={{ fontSize: "0.8rem", color: "#666" }}>Scan with phone to connect as remote camera</p>
            </>
          ) : (
            <p>Loading QR...</p>
          )}
        </div>
      )}

      <div className="stage">
        {isPhone ? (
          <div className="panel">
            <h3>Phone Camera</h3>
            <div className="media-stack">
              <video ref={localVideoRef} autoPlay playsInline muted />
              <canvas ref={localCanvasRef} />
            </div>
          </div>
        ) : (
          <>
            <div className="panel">
              <h3>PC Camera</h3>
              <div className="media-stack">
                <video ref={localVideoRef} autoPlay playsInline muted />
                <canvas ref={localCanvasRef} width="640" height="480" />
              </div>
            </div>
            <div className="panel">
              <h3>Phone Camera (Remote) {connectionStatus === 'connected' ? '✅' : '❌'}</h3>
              <div className="media-frame">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{
                    width: '100%',
                    height: 'auto',
                    minHeight: '240px',
                    background: connectionStatus === 'connected' ? 'transparent' : '#333',
                    borderRadius: '10px'
                  }}
                />
                <canvas ref={remoteCanvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }} />
                {connectionStatus !== 'connected' && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#999',
                    fontSize: '1.1rem',
                    textAlign: 'center'
                  }}>
                    Waiting for phone connection...
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="metrics-pane">
        <span className="fps-label">FPS: {fps}</span>
        {!isPhone && detecting && (
          <span className="fps-label" style={{ marginLeft: "1rem" }}>
            Detections: {detections.length}
          </span>
        )}
        <span className="fps-label" style={{ marginLeft: "1rem", backgroundColor: connectionStatus === 'connected' ? '#4CAF50' : '#f44336' }}>
          {isPhone ? "Phone" : "PC"} Status: {connectionStatus}
        </span>
      </div>
    </div>
  );
}
