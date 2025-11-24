#!/bin/sh
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${BLUE}Starting JustFlow...${NC}"

# Start backend in background
echo "${YELLOW}Starting backend...${NC}"
./justflow-backend --config /etc/justflow/config.yaml &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Start frontend in background
echo "${YELLOW}Starting frontend...${NC}"
node /app/server.js &
FRONTEND_PID=$!

echo "${GREEN}✓ JustFlow is running${NC}"
echo "  Backend: http://localhost:8080"
echo "  Frontend: http://localhost:3000"
echo "  Setup page: http://localhost:3000/setup"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

echo "${YELLOW}JustFlow shutting down...${NC}"
