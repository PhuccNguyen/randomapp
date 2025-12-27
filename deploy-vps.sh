#!/bin/bash

# =============================================================================
# TingRandom VPS Deploy Script
# =============================================================================

set -e  # Exit on error

echo "🚀 Starting TingRandom deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/tingrandom"
REPO_URL="https://github.com/PhuccNguyen/randomapp.git"

# =============================================================================
# Functions
# =============================================================================

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        exit 1
    fi
    print_success "$1 is installed"
}

# =============================================================================
# Main Script
# =============================================================================

echo ""
print_info "Checking dependencies..."
check_command "docker"
check_command "docker-compose"
check_command "git"

echo ""
print_info "Checking if app directory exists..."
if [ ! -d "$APP_DIR" ]; then
    print_info "Creating app directory: $APP_DIR"
    mkdir -p $APP_DIR
fi

echo ""
print_info "Navigating to app directory..."
cd $APP_DIR

echo ""
if [ -d ".git" ]; then
    print_info "Pulling latest code from Git..."
    git pull origin main
else
    print_info "Cloning repository..."
    git clone $REPO_URL .
fi

echo ""
print_info "Checking .env file..."
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo ""
    echo "Please create .env file with your configuration:"
    echo "  nano .env"
    echo ""
    echo "See .env.example for reference"
    exit 1
fi
print_success ".env file exists"

echo ""
print_info "Stopping running containers..."
docker-compose down || true

echo ""
print_info "Building Docker image (this may take 5-10 minutes)..."
docker-compose build

echo ""
print_info "Starting containers..."
docker-compose up -d

echo ""
print_info "Waiting for application to start..."
sleep 10

echo ""
print_info "Checking container status..."
docker-compose ps

echo ""
print_info "Testing health endpoint..."
sleep 5
HEALTH_CHECK=$(curl -s http://localhost:3000/api/health || echo "failed")
if [[ $HEALTH_CHECK == *"healthy"* ]]; then
    print_success "Application is healthy!"
else
    print_error "Health check failed. Check logs with: docker-compose logs -f app"
    exit 1
fi

echo ""
print_success "Deployment completed successfully! 🎉"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f app"
echo "  - Restart: docker-compose restart app"
echo "  - Stop: docker-compose down"
echo "  - Status: docker-compose ps"
echo ""
