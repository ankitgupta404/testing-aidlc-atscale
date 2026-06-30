#!/bin/bash
# Canopy - Quick start script
# Usage: ./init.sh
# Starts the frontend dev server after verifying all phase gates pass

set -e

cd "$(dirname "$0")"

echo "🌿 Canopy Project Management — Init"
echo "====================================="

# Kill any existing process on port 6174
echo "→ Cleaning up ports..."
kill $(lsof -t -i:6174) 2>/dev/null || true

# Run phase gate checks
echo ""
echo "→ Phase Gate Checks:"

echo -n "  shared/ compiles... "
(cd shared && npx tsc --noEmit 2>/dev/null) && echo "✓" || { echo "✗"; exit 1; }

echo -n "  backend/ compiles... "
(cd backend && npx tsc --noEmit 2>/dev/null) && echo "✓" || { echo "✗"; exit 1; }

echo -n "  frontend/ builds... "
(cd frontend && npx vite build > /dev/null 2>&1) && echo "✓" || { echo "✗"; exit 1; }

echo -n "  infrastructure/ synths... "
(cd infrastructure && npx cdk synth > /dev/null 2>&1) && echo "✓" || echo "⚠ (non-blocking)"

# Start frontend dev server
echo ""
echo "→ Starting frontend on http://localhost:6174..."
cd frontend
npx vite --port 6174 > /tmp/vite-canopy.log 2>&1 &
VITE_PID=$!

# Wait for server
sleep 2
if curl -s http://localhost:6174 > /dev/null 2>&1; then
  echo "  ✓ Frontend ready (PID: $VITE_PID)"
else
  echo "  ⚠ Server starting... check /tmp/vite-canopy.log"
fi

echo ""
echo "✅ Canopy is running!"
echo "   Frontend: http://localhost:6174"
echo "   API (proxied via Vite): https://xcu2fdrr5f.execute-api.us-east-1.amazonaws.com"
echo "   Vite log: /tmp/vite-canopy.log"
echo ""
