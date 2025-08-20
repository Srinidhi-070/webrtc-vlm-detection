#!/usr/bin/env bash
set -euo pipefail

# Ngrok configuration script
# Usage: ./ngrok_config.sh [auth_token]

if [ $# -eq 0 ]; then
  echo "Usage: $0 <auth_token>"
  echo "Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken"
  exit 1
fi

AUTH_TOKEN="$1"

# Configure ngrok auth token
echo "Configuring ngrok auth token..."
ngrok config add-authtoken "$AUTH_TOKEN"

# Create ngrok.yml if it doesn't exist
if [ ! -f "ngrok.yml" ]; then
  cat > ngrok.yml << EOF
version: "2"
authtoken: $AUTH_TOKEN
tunnels:
  backend:
    proto: http
    addr: 8000
  frontend:
    proto: http
    addr: 5173
EOF
  echo "Created ngrok.yml configuration file"
fi

echo "Ngrok configuration complete!"
echo "Run './start.sh --ngrok' to start with tunnels"
