# 🐳 Docker Setup cho TingRandom
## Domain: random.tingnect.com

## 📋 Yêu cầu
- Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux)
- Docker Compose v2.0+
- Git

---

## 🚀 Setup Local (Máy tính của bạn)

### Bước 1: Cài đặt Docker Desktop
1. Tải Docker Desktop: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Kiểm tra cài đặt:
```powershell
docker --version
docker-compose --version
```

### Bước 2: Clone project
```powershell
git clone https://github.com/PhuccNguyen/randomapp.git
cd tingrandom
```

### Bước 3: Tạo file .env
```powershell
# Copy file mẫu
copy .env.example .env

# Mở .env và điền thông tin (dùng notepad hoặc VS Code)
notepad .env
```

**Nội dung .env tối thiểu:**
```env
MONGODB_URI=mongodb://admin:changeme@mongodb:27017/tingrandom?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long
NODE_ENV=production
PORT=3000
```

### Bước 4: Build và chạy Docker
```powershell
# Build image
docker-compose build

# Chạy containers
docker-compose up -d

# Xem logs
docker-compose logs -f app
```

### Bước 5: Kiểm tra
- Mở trình duyệt: http://localhost:3000
- Health check: http://localhost:3000/api/health
- MongoDB: mongodb://localhost:27017

### Các lệnh Docker hữu ích

```powershell
# Dừng containers
docker-compose down

# Xóa volumes (reset database)
docker-compose down -v

# Rebuild khi có thay đổi code
docker-compose up -d --build

# Xem logs real-time
docker-compose logs -f

# Xem logs của app
docker-compose logs -f app

# Xem logs của MongoDB
docker-compose logs -f mongodb

# Vào bên trong container app
docker exec -it tingrandom-app sh

# Vào MongoDB shell
docker exec -it tingrandom-mongodb mongosh -u admin -p changeme
```

---

## 🌍 Deploy lên VPS (Production)

### Bước 1: Chuẩn bị VPS
```bash
# SSH vào VPS
ssh root@your-vps-ip

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cài Docker Compose
apt install docker-compose-plugin

# Kiểm tra
docker --version
docker compose version
```

### Bước 2: Clone project trên VPS
```bash
cd /opt
git clone https://github.com/PhuccNguyen/randomapp.git tingrandom
cd tingrandom
```

### Bước 3: Tạo .env cho production
```bash
nano .env
```

**Nội dung .env production:**
```env
MONGODB_URI=mongodb://admin:STRONG_PASSWORD_HERE@mongodb:27017/tingrandom?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=STRONG_PASSWORD_HERE
NEXTAUTH_URL=https://random.tingnect.com
NEXTAUTH_SECRET=GENERATE_STRONG_SECRET_KEY_HERE
NODE_ENV=production
PORT=3000
DOMAIN=random.tingnect.com
```

**Generate secret key:**
```bash
openssl rand -base64 32
```

### Bước 4: Cấu hình domain
1. Trỏ domain `random.tingnect.com` về IP VPS (DNS A record)
2. Đợi DNS propagate (~5-30 phút)

### Bước 5: Chạy với Nginx (HTTP)
```bash
# Build và chạy
docker compose up -d

# Chạy với Nginx
docker compose --profile production up -d
```

### Bước 6: Cài SSL (HTTPS) với Let's Encrypt
```bash
# Cài Certbot
apt install certbot

# Generate SSL certificate
certbot certonly --standalone -d random.tingnect.com -d www.random.tingnect.com

# Copy certificates
mkdir -p ssl
cp /etc/letsencrypt/live/random.tingnect.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/random.tingnect.com/privkey.pem ssl/

# Uncomment HTTPS server trong nginx.conf
nano nginx.conf

# Restart Nginx
docker compose restart nginx
```

### Bước 7: Auto-renew SSL
```bash
# Tạo cron job
crontab -e

# Thêm dòng này (chạy mỗi ngày 3h sáng)
0 3 * * * certbot renew --quiet && docker compose -f /opt/tingrandom/docker-compose.yml restart nginx
```

---

## 🔧 Troubleshooting

### Lỗi: Port 3000 đã được sử dụng
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Linux
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Lỗi: MongoDB connection failed
```bash
# Kiểm tra MongoDB logs
docker-compose logs mongodb

# Kiểm tra MONGODB_URI trong .env
# Phải match với MONGO_ROOT_USERNAME và MONGO_ROOT_PASSWORD
```

### Lỗi: Build failed
```bash
# Xóa cache và rebuild
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Reset toàn bộ
```bash
# Dừng và xóa tất cả
docker-compose down -v
docker system prune -a -f

# Rebuild từ đầu
docker-compose up -d --build
```

---

## 📊 Monitoring

### Xem resource usage
```bash
docker stats
```

### Xem logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
docker-compose logs -f nginx
```

### Backup MongoDB
```bash
# Backup
docker exec tingrandom-mongodb mongodump -u admin -p changeme --authenticationDatabase admin -o /backup

# Copy backup ra ngoài
docker cp tingrandom-mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore MongoDB
```bash
# Copy backup vào container
docker cp ./mongodb-backup tingrandom-mongodb:/backup

# Restore
docker exec tingrandom-mongodb mongorestore -u admin -p changeme --authenticationDatabase admin /backup
```

---

## 🔒 Security Checklist

- [ ] Đổi `MONGO_ROOT_PASSWORD` thành mật khẩu mạnh
- [ ] Generate `NEXTAUTH_SECRET` mới (ít nhất 32 ký tự)
- [ ] Enable firewall trên VPS (chỉ mở port 80, 443, 22)
- [ ] Cài SSL certificate (HTTPS)
- [ ] Disable MongoDB port 27017 từ bên ngoài (chỉ internal)
- [ ] Backup database định kỳ
- [ ] Monitor logs thường xuyên

---

## 📞 Support

Nếu gặp vấn đề, liên hệ:
- Email: support@tingnect.com
- GitHub Issues: https://github.com/PhuccNguyen/randomapp/issues
