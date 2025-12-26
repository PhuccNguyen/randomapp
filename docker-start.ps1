# 🚀 Quick Start Scripts

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker-compose build

# Start containers
Write-Host "Starting containers..." -ForegroundColor Green
docker-compose up -d

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check health
Write-Host "`nChecking health status..." -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
$health = $response.Content | ConvertFrom-Json

Write-Host "`nService Status:" -ForegroundColor Green
Write-Host "  Status: $($health.status)"
Write-Host "  Database: $($health.database)"
Write-Host "  Service: $($health.service)"

# Show logs
Write-Host "`nShowing app logs (Ctrl+C to stop):" -ForegroundColor Cyan
docker-compose logs -f app
