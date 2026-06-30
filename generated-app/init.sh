#!/bin/bash
# init.sh - Quick setup script for AWS News Hub development
# Usage: ./init.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== AWS News Hub - Development Setup ==="

# Kill any existing processes on our ports
echo "[1/5] Cleaning up existing processes..."
kill $(lsof -t -i:6174 2>/dev/null) 2>/dev/null || true

# Install dependencies
echo "[2/5] Installing dependencies..."
cd "$SCRIPT_DIR" && npm install --silent 2>/dev/null

# Verify shared compiles
echo "[3/5] Verifying shared schemas..."
cd "$SCRIPT_DIR/shared" && npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "ERROR: Shared schemas failed to compile!"
  exit 1
fi
echo "  ✓ Shared schemas compile"

# Check if API URL is configured
if [ -f "$SCRIPT_DIR/frontend/.env" ]; then
  echo "  ✓ Frontend .env exists"
  cat "$SCRIPT_DIR/frontend/.env"
else
  echo "  ⚠ No frontend/.env found - checking SSM for API URL..."
  API_URL=$(aws ssm get-parameter --name "/claude-code/infra/deploy-state" --region us-east-1 --query 'Parameter.Value' --output text 2>/dev/null | jq -r '.apiUrl' 2>/dev/null)
  if [ -n "$API_URL" ] && [ "$API_URL" != "null" ] && [ "$API_URL" != "" ]; then
    echo "VITE_API_URL=$API_URL" > "$SCRIPT_DIR/frontend/.env"
    echo "  ✓ Created frontend/.env with API_URL=$API_URL"
  else
    echo "  ⚠ Could not get API URL from SSM, frontend will show error state"
  fi
fi

# Start frontend dev server
echo "[4/5] Starting frontend dev server on port 6174..."
cd "$SCRIPT_DIR/frontend" && npx vite --port 6174 --host 0.0.0.0 > "$SCRIPT_DIR/frontend-dev.log" 2>&1 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

# Wait for server
sleep 1
if curl -s http://localhost:6174 > /dev/null 2>&1; then
  echo "  ✓ Frontend running at http://localhost:6174"
else
  echo "  ⚠ Frontend may still be starting..."
fi

# Run quick tests
echo "[5/5] Running verification..."
echo "  - Shared: $(cd "$SCRIPT_DIR/shared" && npx tsc --noEmit 2>&1 && echo "PASS" || echo "FAIL")"
echo "  - Infrastructure: $(cd "$SCRIPT_DIR/infrastructure" && npm test --silent 2>&1 | tail -1)"
echo ""
echo "=== Setup Complete ==="
echo "Frontend: http://localhost:6174"
echo "Logs: $SCRIPT_DIR/frontend-dev.log"
echo ""
echo "To stop: kill $FRONTEND_PID"
