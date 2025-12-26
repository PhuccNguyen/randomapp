# 🐳 TingRandom - Docker Quick Start

## Chạy Local (Máy của bạn)

### Windows (PowerShell):
```powershell
# 1. Copy và tạo file .env
copy .env.example .env

# 2. Chạy script
.\docker-start.ps1
```

### Linux/Mac (Terminal):
```bash
# 1. Copy và tạo file .env
cp .env.example .env

# 2. Chạy script
chmod +x docker-start.sh
./docker-start.sh
```

### Hoặc chạy thủ công:
```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

## Truy cập

- **App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **MongoDB**: mongodb://localhost:27017

## Lệnh hữu ích

```bash
# Xem logs
docker-compose logs -f app

# Stop
docker-compose down

# Reset (xóa database)
docker-compose down -v

# Rebuild
docker-compose up -d --build
```

## Deploy lên VPS

Xem file **DOCKER_SETUP.md** để biết chi tiết cách deploy lên VPS với domain **random.tingnect.com**

## Cần help?

- Đọc: `DOCKER_SETUP.md`
- Check health: `curl http://localhost:3000/api/health`
- Logs: `docker-compose logs -f`
