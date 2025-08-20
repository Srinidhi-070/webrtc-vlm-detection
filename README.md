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

*Stream live video from your phone to PC via WebRTC and watch AI detect objects in real-time with beautiful bounding box overlays.*

</div>

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

## 🎬 Demo

```mermaid
graph LR
    A[📱 Phone Camera] -->|WebRTC Stream| B[💻 PC Browser]
    B --> C[🤖 AI Detection]
    C --> D[📊 Bounding Boxes]
    D --> E[🎯 Real-time Overlay]
    
    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
    style D fill:#96ceb4
    style E fill:#feca57
```

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
# 🪟 Windows
start.bat

# 🐧 Linux/macOS
chmod +x ./start.sh && ./start.sh

# 🌍 With remote access
./start.sh --ngrok
```

### 📱 **Usage Steps**

1. **🖥️ PC**: Open http://localhost:8000
2. **📷 Start Camera** → **🔗 Connect Phone** → **🎯 Start Detection**
3. **📱 Phone**: Scan QR code → Auto-connects as remote camera
4. **🎉 Enjoy**: Watch real-time detection on both camera feeds!

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

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | AI/CV | DevOps |
|----------|---------|-------|--------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) | ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | ![OpenCV](https://img.shields.io/badge/-OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white) | ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white) |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | ![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white) | ![NumPy](https://img.shields.io/badge/-NumPy-013243?style=flat-square&logo=numpy&logoColor=white) | ![ngrok](https://img.shields.io/badge/-ngrok-1F1E37?style=flat-square&logo=ngrok&logoColor=white) |
| ![WebRTC](https://img.shields.io/badge/-WebRTC-333333?style=flat-square&logo=webrtc&logoColor=white) | ![WebSocket](https://img.shields.io/badge/-WebSocket-010101?style=flat-square&logo=socketdotio&logoColor=white) | ![ONNX](https://img.shields.io/badge/-ONNX-005CED?style=flat-square&logo=onnx&logoColor=white) | ![Compose](https://img.shields.io/badge/-Compose-2496ED?style=flat-square&logo=docker&logoColor=white) |

</div>

## 📊 Performance

- **🚀 Latency**: < 200ms end-to-end
- **📹 FPS**: 5-10 FPS real-time detection
- **🎯 Detection**: Multi-color object recognition
- **📱 Mobile**: Optimized for phone cameras
- **🌐 Network**: Efficient WebRTC streaming

## 🔧 Configuration

### 🎨 **Detection Colors**
- 🔴 **Red Objects** - Primary detection
- 🔵 **Blue Objects** - Secondary detection  
- 🟢 **Green Objects** - Tertiary detection
- 🟡 **Yellow Objects** - Quaternary detection

### ⚙️ **Environment Variables**
```bash
SERVE_BUILT=true          # Production mode
FRONTEND_URL=http://...   # Frontend URL
BACKEND_URL=http://...    # Backend URL
NGROK_AUTHTOKEN=...       # Remote access token
```

## 🐛 Troubleshooting

<details>
<summary>📱 <strong>Phone Connection Issues</strong></summary>

- ✅ Ensure both devices on same WiFi
- ✅ Check camera permissions in browser
- ✅ Try different browsers (Chrome recommended)
- ✅ Use ngrok for remote access

</details>

<details>
<summary>🎥 <strong>Video Stream Problems</strong></summary>

- ✅ Check WebRTC connection in console
- ✅ Verify STUN server connectivity
- ✅ Test with `chrome://webrtc-internals`
- ✅ Restart both applications

</details>

<details>
<summary>🐳 <strong>Docker Issues</strong></summary>

- ✅ Ensure Docker Desktop is running
- ✅ Check port 8000 availability
- ✅ Clear Docker cache: `docker system prune`
- ✅ Run as administrator if needed

</details>

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- 🐛 **Bug Reports** - Found an issue? Let us know!
- ✨ **Feature Requests** - Have an idea? Share it!
- 🔧 **Pull Requests** - Code improvements welcome!
- 📖 **Documentation** - Help improve our docs!

## 📄 License

<div align="center">

**MIT License** - Feel free to use this project for anything!

---

### 🌟 **Star this repo if you found it helpful!** 🌟

*Made with ❤️ for the computer vision community*

</div>