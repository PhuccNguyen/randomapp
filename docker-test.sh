#!/bin/bash
# 🧪 Test Docker Setup Script

echo "🧪 Testing Docker Setup for TingRandom"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo -e "\n${YELLOW}1. Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    docker --version
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${RED}✗ Docker not installed${NC}"
    exit 1
fi

# Check Docker Compose
echo -e "\n${YELLOW}2. Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    docker-compose --version
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${RED}✗ Docker Compose not installed${NC}"
    exit 1
fi

# Check .env file
echo -e "\n${YELLOW}3. Checking .env file...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
fi

# Build images
echo -e "\n${YELLOW}4. Building Docker images...${NC}"
docker-compose build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Start containers
echo -e "\n${YELLOW}5. Starting containers...${NC}"
docker-compose up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Containers started${NC}"
else
    echo -e "${RED}✗ Failed to start containers${NC}"
    exit 1
fi

# Wait for services
echo -e "\n${YELLOW}6. Waiting for services to be ready...${NC}"
sleep 15

# Check container status
echo -e "\n${YELLOW}7. Checking container status...${NC}"
docker-compose ps

# Test MongoDB
echo -e "\n${YELLOW}8. Testing MongoDB connection...${NC}"
if docker exec tingrandom-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB is healthy${NC}"
else
    echo -e "${RED}✗ MongoDB connection failed${NC}"
fi

# Test App
echo -e "\n${YELLOW}9. Testing App health check...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ App is healthy (HTTP $HTTP_CODE)${NC}"
    curl -s http://localhost:3000/api/health | jq '.'
else
    echo -e "${RED}✗ App health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Showing app logs:"
    docker-compose logs --tail=20 app
fi

# Test Socket.IO
echo -e "\n${YELLOW}10. Testing Socket.IO endpoint...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/socket.io/)
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Socket.IO endpoint responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠ Socket.IO response: HTTP $HTTP_CODE${NC}"
fi

# Summary
echo -e "\n${GREEN}========================================="
echo "✅ Docker Setup Test Complete!"
echo "=========================================${NC}"
echo ""
echo "Access the app at:"
echo "  - Main: http://localhost:3000"
echo "  - Health: http://localhost:3000/api/health"
echo "  - Control: http://localhost:3000/control"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop containers:"
echo "  docker-compose down"
