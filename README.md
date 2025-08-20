<div align="center">

# 🎥 WebRTC VLM Detection

### *Real-time Multi-Object Detection with Phone-to-PC Video Streaming*

<img src="https://img.shields.io/badge/WebRTC-Enabled-00D4AA?style=for-the-badge&logo=webrtc&logoColor=white" alt="WebRTC">
<img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/OpenCV-Powered-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV">

---

### 📱➡️💻 Turn your phone into a wireless camera with real-time AI detection!

*Stream live video from your phone to PC via WebRTC and watch AI detect objects in real-time with bounding box overlays.*

</div>

---

## ⚠️ Note
This project was built as part of an **academic assignment**.  
During development, there were multiple iterations with redundant files, corrections, and some trial-and-error.  
We apologize for the extra clutter and errors in earlier versions — the current structure reflects a **clean and functional implementation** as per assignment goals.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 **Core Capabilities**
- 📱 **Phone Camera Streaming** - Use your phone as a wireless camera
- 💻 **Dual Camera View** - PC and phone cameras side by side
- 🤖 **Real-time Detection** - Multi-color object detection with bounding boxes
- 🌐 **WebRTC P2P** - Direct peer-to-peer connection
- 📊 **Live Metrics** - FPS, detection count, connection status

</td>
<td width="50%">

### 🚀 **Deployment Options**
- 🐳 **Docker Ready** - One-command containerized deployment
- 🌍 **Remote Access** - ngrok integration for internet access
- ⚡ **Production Build** - Optimized static file serving
- 🔧 **Cross-Platform** - Windows, macOS, Linux support
- 📱 **Mobile Optimized** - Responsive design for all devices

</td>
</tr>
</table>

---

## 🎬 Demo

```mermaid
graph LR
    A[📱 Phone<br>Camera]
    B[💻 PC<br>Browser]
    C[🤖 AI<br>Detection]
    D[📊 Bounding<br>Boxes]
    E[🎯 Real-time<br>Overlay]

    A -->|WebRTC Stream| B
    B --> C
    C --> D
    D --> E

    style A fill:#ff6b6b,color:#000
    style B fill:#4ecdc4,color:#000
    style C fill:#45b7d1,color:#000
    style D fill:#96ceb4,color:#000
    style E fill:#feca57,color:#000
````

---

## 🚀 Quick Start

### 🐳 **Docker (Recommended)**

```bash
# 🎯 One command to rule them all!
docker-compose up --build

# 🌐 With remote access (requires ngrok token)
NGROK_AUTHTOKEN=your_token docker-compose --profile remote up --build
```

### 💻 **Local Development**

```bash
# 🪟 Windows (local)
start.bat

# 🪟 Windows (Remote Access)
quick_remote.bat

# 🐧 Linux/macOS
chmod +x ./start.sh && ./start.sh

# 🌍 With remote access
./start.sh --ngrok
```

### 📱 **Usage Steps**

1. **🖥️ PC**: Open [http://localhost:8000](http://localhost:8000)
2. **📷 Start Camera** → **🔗 Connect Phone** → **🎯 Start Detection**
3. **📱 Phone**: Scan QR code → Auto-connects as remote camera
4. **🎉 Enjoy**: Watch real-time detection on both camera feeds!

---

## 🏗️ Architecture

<div align="center">

```ascii
┌─────────────────┐    WebRTC P2P     ┌─────────────────┐
│   📱 Phone      │◄─────────────────►│   💻 PC         │
│                 │                   │                 │
│ • Camera Stream │                   │ • Dual Display  │
│ • Auto Connect  │                   │ • AI Detection  │
│ • Touch UI      │                   │ • Metrics       │
└─────────────────┘                   └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  🤖 Detection   │
                                    │                 │
                                    │ • Multi-Color   │
                                    │ • Real-time     │
                                    │ • Bounding Box  │
                                    └─────────────────┘
```

</div>

---

## 🛠️ Tech Stack

<div align="center">

| Frontend     | Backend   | AI/CV       | DevOps           |
| ------------ | --------- | ----------- | ---------------- |
| React + Vite | FastAPI   | OpenCV      | Docker + Compose |
| WebRTC       | WebSocket | NumPy, ONNX | ngrok            |

</div>

---

## 📊 Performance

* **🚀 Latency**: < 200ms end-to-end
* **📹 FPS**: 5–10 FPS real-time detection
* **🎯 Detection**: Multi-color object recognition
* **📱 Mobile**: Optimized for phone cameras
* **🌐 Network**: Efficient WebRTC streaming

---

## 🐛 Troubleshooting

<details>
<summary>📱 <strong>Phone Connection Issues</strong></summary>

* ✅ Ensure both devices are on same WiFi
* ✅ Check camera permissions in browser
* ✅ Try different browsers (Chrome recommended)
* ✅ Use ngrok for remote access

</details>

<details>
<summary>🎥 <strong>Video Stream Problems</strong></summary>

* ✅ Check WebRTC connection in console
* ✅ Verify STUN server connectivity
* ✅ Test with `chrome://webrtc-internals`
* ✅ Restart both applications

</details>

---

## 🤝 Contributing

This is primarily an **assignment project**, but contributions for cleanup, improvements, and extended features are welcome:

* 🐛 Bug Reports
* ✨ Feature Requests
* 🔧 Pull Requests
* 📖 Documentation

---

## 📄 License

<div align="center">

**MIT License** - Free to use for learning & development

---

### 🌟 *Star this repo if you found it helpful!* 🌟

*Made with ❤️ as part of an academic assignment in Computer Vision*

</div>
