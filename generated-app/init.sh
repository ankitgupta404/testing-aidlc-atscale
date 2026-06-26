#!/bin/bash
# Init script for AWS News Hub - starts both backend API and frontend dev servers
# Usage: ./init.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 AWS News Hub - Starting development servers..."

# Kill any existing processes on ports 4001 and 6174
echo "Cleaning up existing processes..."
lsof -ti:4001 2>/dev/null | xargs kill 2>/dev/null || true
lsof -ti:6174 2>/dev/null | xargs kill 2>/dev/null || true
sleep 1

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

# Start the backend API server (local dev with in-memory store)
echo "Starting backend API server on port 4001..."
cd "$SCRIPT_DIR" && npx tsx backend/src/local-server.ts > "$SCRIPT_DIR/logs/api.log" 2>&1 &
API_PID=$!

# Wait for backend to be ready
sleep 1
if curl -s http://localhost:4001/services > /dev/null 2>&1; then
  echo "  ✓ Backend API running at http://localhost:4001"
else
  echo "  ✗ Backend API failed to start. Check logs/api.log"
  cat "$SCRIPT_DIR/logs/api.log"
  exit 1
fi

# Ensure frontend .env is set
echo "VITE_API_URL=http://localhost:4001" > "$SCRIPT_DIR/frontend/.env"

# Start the frontend dev server
echo "Starting frontend dev server on port 6174..."
cd "$SCRIPT_DIR/frontend" && npx vite --port 6174 > "$SCRIPT_DIR/logs/vite.log" 2>&1 &
VITE_PID=$!

# Wait for frontend to be ready
sleep 1
if curl -s http://localhost:6174 > /dev/null 2>&1; then
  echo "  ✓ Frontend dev server running at http://localhost:6174"
else
  echo "  ⏳ Frontend starting up... (check logs/vite.log)"
fi

echo ""
echo "Development servers started:"
echo "  Frontend: http://localhost:6174"
echo "  Backend API: http://localhost:4001"
echo ""
echo "To run tests:"
echo "  npx playwright test e2e-tests/"
echo ""
echo "To check CDK:"
echo "  cd infrastructure && npx cdk synth"
echo "  cd infrastructure && npm test"
echo ""
echo "Logs:"
echo "  Backend: $SCRIPT_DIR/logs/api.log"
echo "  Frontend: $SCRIPT_DIR/logs/vite.log"
