#!/bin/bash
# 🚀 Quick Start Script for Linux/Mac

echo "🐳 Building Docker image..."
docker-compose build

echo "✅ Starting containers..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🏥 Checking health status..."
curl -s http://localhost:3000/api/health | jq

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "📝 Showing app logs (Ctrl+C to stop):"
docker-compose logs -f app
