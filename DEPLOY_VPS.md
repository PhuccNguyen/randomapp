# 🚀 Hướng dẫn Deploy TingRandom lên VPS

## 📋 Checklist trước khi deploy

- ✅ Docker đã build thành công
- ✅ App chạy tốt trên local (`http://localhost:3000`)
- ✅ MongoDB Atlas đã kết nối thành công
- ✅ File `.env` đã được bảo mật (không commit vào Git)
- ✅ Domain đã trỏ DNS về VPS

---

## 🖥️ Yêu cầu VPS

- **OS**: Ubuntu 20.04+ hoặc CentOS 7+
- **RAM**: Tối thiểu 2GB (khuyên dùng 4GB+)
- **CPU**: 2 cores trở lên
- **Storage**: 20GB+
- **Cài đặt sẵn**:
  - Docker
  - Docker Compose
  - Git
  - Nginx (nếu muốn dùng SSL)

---

## 📦 Bước 1: Chuẩn bị VPS

### SSH vào VPS

```bash
ssh root@your-vps-ip
# hoặc
ssh username@your-vps-ip
```

### Cài đặt Docker & Docker Compose

```bash
# Update hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra
docker --version
docker-compose --version
```

### Cài Git

```bash
sudo apt install git -y
```

---

## 📥 Bước 2: Clone Project

```bash
# Tạo thư mục cho app
mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/PhuccNguyen/randomapp.git tingrandom
cd tingrandom

# Hoặc nếu private repo
git clone https://YOUR_TOKEN@github.com/PhuccNguyen/randomapp.git tingrandom
```

---

## ⚙️ Bước 3: Cấu hình Environment

### Tạo file `.env` từ máy local

**Trên máy local của bạn**, copy nội dung file `.env`:

```powershell
# Windows
Get-Content .env | Set-Clipboard
```

**Trên VPS**, tạo file `.env`:

```bash
cd /var/www/tingrandom
nano .env
```

Paste nội dung vừa copy và **SỬA CÁC GIÁ TRỊ SAU**:

```bash
# ==================== DATABASE ====================
MONGODB_URI=mongodb+srv://tingrandom:VrjZPZ%40j.7w%40NZ8@randomdata.v7od9ri.mongodb.net/tingrandom?retryWrites=true&w=majority&appName=RandomData

# ==================== NEXTAUTH ====================
NEXTAUTH_URL=https://random.tingnect.com  # ← Đổi thành domain của bạn
NEXTAUTH_SECRET=YOUR_PRODUCTION_SECRET_KEY_HERE  # ← Đổi thành secret mới
NEXTAUTH_JWT_SECRET=YOUR_JWT_SECRET_KEY_HERE  # ← Đổi thành secret mới
JWT_SECRET=YOUR_JWT_SECRET_KEY_HERE  # ← Giống NEXTAUTH_JWT_SECRET
JWT_EXPIRES_IN=7d

# ==================== GOOGLE OAUTH ====================
GOOGLE_CLIENT_ID=27102539616-ajg7flin384kh9ds0drsaq1193eot9gg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true

# ==================== APP CONFIG ====================
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://random.tingnect.com  # ← Đổi thành domain của bạn

# ==================== PRODUCTION DOMAIN ====================
DOMAIN=random.tingnect.com  # ← Đổi thành domain của bạn
```

**Tạo secret keys mới:**

```bash
# Tạo NEXTAUTH_SECRET
openssl rand -base64 32

# Tạo JWT_SECRET
openssl rand -base64 32
```

Lưu file: `Ctrl + X` → `Y` → `Enter`

---

## 🔒 Bước 4: Cấu hình SSL với Nginx (Khuyên dùng)

### Cài Nginx

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Tạo config Nginx

```bash
sudo nano /etc/nginx/sites-available/tingrandom
```

Paste nội dung:

```nginx
server {
    listen 80;
    server_name random.tingnect.com www.random.tingnect.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name random.tingnect.com www.random.tingnect.com;

    # SSL certificates (sẽ được tạo bởi Certbot)
    ssl_certificate /etc/letsencrypt/live/random.tingnect.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/random.tingnect.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/tingrandom-access.log;
    error_log /var/log/nginx/tingrandom-error.log;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Tăng timeout cho Socket.IO
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
        proxy_send_timeout 90;
    }

    # WebSocket support cho Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Max upload size
    client_max_body_size 20M;
}
```

### Enable site và reload Nginx

```bash
sudo ln -s /etc/nginx/sites-available/tingrandom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Cài SSL Certificate với Let's Encrypt

```bash
sudo certbot --nginx -d random.tingnect.com -d www.random.tingnect.com
```

Làm theo hướng dẫn:
1. Nhập email
2. Đồng ý Terms of Service: `Y`
3. Chọn `2` (Redirect HTTP to HTTPS)

---

## 🐳 Bước 5: Build và Chạy Docker

```bash
cd /var/www/tingrandom

# Build Docker image (mất 5-10 phút)
docker-compose build

# Chạy containers
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f app
```

**Chờ khoảng 30-60 giây** để app khởi động hoàn toàn.

### Kiểm tra containers

```bash
docker ps
```

Bạn sẽ thấy:
```
CONTAINER ID   IMAGE            STATUS         PORTS                    NAMES
xxxx           tingrandom-app   Up 2 minutes   0.0.0.0:3000->3000/tcp   tingrandom-app
```

---

## ✅ Bước 6: Kiểm tra

### Test health check

```bash
curl http://localhost:3000/api/health
```

Kết quả:
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "tingrandom"
}
```

### Truy cập website

Mở browser:
```
https://random.tingnect.com
```

---

## 🔄 Bước 7: Cập nhật Code (Deploy lại)

Khi có code mới:

```bash
cd /var/www/tingrandom

# Pull code mới
git pull origin main

# Rebuild và restart
docker-compose down
docker-compose build
docker-compose up -d

# Xem logs
docker-compose logs -f app
```

---

## 🛡️ Bước 8: Bảo mật

### Firewall

```bash
# Chỉ mở port cần thiết
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### Tự động gia hạn SSL

```bash
# Certbot tự động gia hạn, kiểm tra:
sudo certbot renew --dry-run
```

### Backup MongoDB

Tạo script backup:

```bash
nano /root/backup-mongodb.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

# Backup từ MongoDB Atlas
mongodump --uri="YOUR_MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Xóa backup cũ hơn 7 ngày
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/backup_$DATE"
```

```bash
chmod +x /root/backup-mongodb.sh

# Cron job: backup mỗi ngày 2AM
crontab -e
# Thêm dòng:
0 2 * * * /root/backup-mongodb.sh
```

---

## 📊 Giám sát

### Xem logs realtime

```bash
docker-compose logs -f app
```

### Xem resource usage

```bash
docker stats tingrandom-app
```

### Restart app

```bash
docker-compose restart app
```

### Stop app

```bash
docker-compose down
```

---

## 🐛 Troubleshooting

### App không start

```bash
# Xem logs chi tiết
docker logs tingrandom-app --tail 100

# Kiểm tra biến môi trường
docker exec tingrandom-app printenv | grep MONGODB
```

### MongoDB connection failed

- Kiểm tra `MONGODB_URI` trong `.env`
- Kiểm tra MongoDB Atlas IP Whitelist (thêm IP VPS)
- Test connection:
  ```bash
  docker exec -it tingrandom-app sh
  npm run test-db
  ```

### Nginx 502 Bad Gateway

```bash
# Kiểm tra app đang chạy
docker ps

# Kiểm tra port 3000
curl http://localhost:3000/api/health

# Restart nginx
sudo systemctl restart nginx
```

### SSL Certificate issues

```bash
# Renew SSL
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## 📝 Lệnh hữu ích

```bash
# Xem tất cả containers
docker ps -a

# Xem logs
docker logs tingrandom-app

# Vào trong container
docker exec -it tingrandom-app sh

# Xóa tất cả và build lại
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d

# Kiểm tra disk space
df -h
docker system df

# Dọn dẹp Docker
docker system prune -a --volumes
```

---

## 🎉 Hoàn tất!

Website của bạn giờ đã chạy ở:
- 🌐 **Production**: https://random.tingnect.com
- 🔒 **SSL**: Enabled (Let's Encrypt)
- 📦 **Docker**: Running
- 💾 **Database**: MongoDB Atlas

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Logs: `docker logs tingrandom-app`
2. Health: `curl http://localhost:3000/api/health`
3. Nginx: `sudo nginx -t && sudo systemctl status nginx`
