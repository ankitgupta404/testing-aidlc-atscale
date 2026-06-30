#!/bin/bash
# Canopy - Quick start script
# Usage: ./init.sh

set -e

echo "🌿 Starting Canopy Project Management App..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --prefer-offline 2>/dev/null || npm install

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd frontend && npm install --prefer-offline 2>/dev/null || npm install
cd ..

# Ensure .env exists with proxy config
if [ ! -f frontend/.env ]; then
  echo "VITE_API_URL=" > frontend/.env
fi

# Kill any existing process on port 6174
kill $(lsof -t -i:6174) 2>/dev/null || true

# Start dev server
echo "🚀 Starting Vite dev server on http://localhost:6174..."
cd frontend && npx vite --port 6174 &

echo ""
echo "✅ Canopy is running at http://localhost:6174"
echo "   API proxied to https://xcu2fdrr5f.execute-api.us-east-1.amazonaws.com"
echo ""
