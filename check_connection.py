#!/usr/bin/env python3
import socket
import subprocess
import sys

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return None

def check_port(ip, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((ip, port))
        sock.close()
        return result == 0
    except:
        return False

if __name__ == "__main__":
    ip = get_local_ip()
    if not ip:
        print("❌ Could not get local IP")
        sys.exit(1)
    
    print(f"🌐 Your PC IP: {ip}")
    print(f"📱 Phone URL: http://{ip}:5173/?peer=1")
    
    if check_port(ip, 5173):
        print("✅ Frontend port 5173 is accessible")
    else:
        print("❌ Frontend port 5173 is not accessible")
    
    if check_port(ip, 8000):
        print("✅ Backend port 8000 is accessible")
    else:
        print("❌ Backend port 8000 is not accessible")
    
    print("\n🔧 If ports are not accessible:")
    print("1. Check Windows Firewall")
    print("2. Make sure both devices are on same WiFi")
    print("3. Try manually opening: http://{ip}:5173/?peer=1 on phone")