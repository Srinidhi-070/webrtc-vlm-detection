#!/usr/bin/env python3
import subprocess
import time
import requests
import json

def setup_cloudflared():
    """Setup Cloudflare Tunnel (free, no signup needed)"""
    try:
        # Start cloudflared tunnel for frontend
        frontend_process = subprocess.Popen([
            'cloudflared', 'tunnel', '--url', 'http://localhost:5173'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Start cloudflared tunnel for backend  
        backend_process = subprocess.Popen([
            'cloudflared', 'tunnel', '--url', 'http://localhost:8000'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print("✅ Cloudflare tunnels started")
        print("Frontend and backend will be accessible via public URLs")
        return frontend_process, backend_process
        
    except FileNotFoundError:
        print("❌ Cloudflared not found. Install from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/")
        return None, None

def setup_localtunnel():
    """Setup LocalTunnel (free, no signup needed)"""
    try:
        # Start localtunnel for frontend
        frontend_process = subprocess.Popen([
            'npx', 'localtunnel', '--port', '5173', '--subdomain', 'webrtc-vlm-frontend'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Start localtunnel for backend
        backend_process = subprocess.Popen([
            'npx', 'localtunnel', '--port', '8000', '--subdomain', 'webrtc-vlm-backend'  
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print("✅ LocalTunnel started")
        print("Frontend: https://webrtc-vlm-frontend.loca.lt")
        print("Backend: https://webrtc-vlm-backend.loca.lt")
        return frontend_process, backend_process
        
    except Exception as e:
        print(f"❌ LocalTunnel failed: {e}")
        return None, None

if __name__ == "__main__":
    print("Choose tunneling service:")
    print("1. Cloudflare Tunnel (recommended)")
    print("2. LocalTunnel")
    
    choice = input("Enter choice (1-2): ").strip()
    
    if choice == "1":
        setup_cloudflared()
    elif choice == "2":
        setup_localtunnel()
    else:
        print("Invalid choice")