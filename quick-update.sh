#!/bin/bash

# Quick update script - Pull code and restart without rebuilding
# Use this when you only change code, not dependencies

set -e

echo "🔄 Quick updating TingRandom..."

cd /var/www/tingrandom

echo "📥 Pulling latest code..."
git pull origin main

echo "🔄 Restarting containers..."
docker-compose restart app

echo "⏳ Waiting for app to start..."
sleep 5

echo "✅ Update completed!"
echo "View logs: docker-compose logs -f app"
