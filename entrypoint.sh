#!/bin/sh
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "${BLUE}Starting JustFlow...${NC}"

# ============================================================
# BACKEND DETECTION & STARTUP
# ============================================================

BACKEND_PORT=${BACKEND_PORT:-8080}
BACKEND_HOST=${BACKEND_HOST:-localhost}
MAX_RETRIES=30
RETRY_COUNT=0

echo "${YELLOW}Starting backend on port ${BACKEND_PORT}...${NC}"

# Start backend in background
./justflow-backend --config /etc/justflow/config.yaml &
BACKEND_PID=$!

# Wait for backend to be ready using /dev/tcp (no curl needed)
echo "${YELLOW}Waiting for backend to be ready...${NC}"
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if (echo >/dev/tcp/localhost/${BACKEND_PORT}) 2>/dev/null; then
    echo "${GREEN}✓ Backend is ready${NC}"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Attempt $RETRY_COUNT/$MAX_RETRIES..."
  sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "${RED}✗ Backend failed to start${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

# ============================================================
# FRONTEND STARTUP
# ============================================================

echo "${YELLOW}Starting frontend...${NC}"

# If BACKEND_URL is not set, default to localhost
if [ -z "$BACKEND_URL" ]; then
  export BACKEND_URL="http://localhost:${BACKEND_PORT}"
fi

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  export NEXT_PUBLIC_API_URL="http://localhost:${BACKEND_PORT}"
fi

echo "${GREEN}Configuration:${NC}"
echo "  Backend URL: ${BACKEND_URL}"
echo "  API URL: ${NEXT_PUBLIC_API_URL}"

# Start frontend
node /app/server.js &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

echo "${YELLOW}JustFlow shutting down...${NC}"
