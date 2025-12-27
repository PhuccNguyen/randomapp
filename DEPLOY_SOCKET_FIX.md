# 🚀 HƯỚNG DẪN DEPLOY FIX SOCKET.IO LÊN VPS

## ⚠️ VẤN ĐỀ ĐÃ FIX
- Control Panel không kết nối được từ mobile/máy khác
- Display Guest không đồng bộ được từ thiết bị khác
- Socket.IO hardcoded `localhost:3000` → không hoạt động trên production

## ✅ GIẢI PHÁP
1. **Tạo `lib/socket-client.ts`**: Tự động phát hiện localhost vs production domain
2. **Update tất cả Socket clients**: useSocket, display/guest, Reel, test-socket
3. **CORS production-ready**: Accept `random.tingnect.com` và subdomains
4. **WebSocket optimization**: Ping timeout, transport priority

---

## 📋 BƯỚC DEPLOY TRÊN VPS

### 1️⃣ SSH vào VPS
```bash
ssh ubuntu@36.50.176.73
# Hoặc: ssh ubuntu@tingvote
```

### 2️⃣ Đi đến thư mục project
```bash
cd ~/tingrandom
```

### 3️⃣ Pull code mới từ GitHub
```bash
git pull origin main
```

### 4️⃣ **QUAN TRỌNG**: Cập nhật file `.env` trên VPS
```bash
nano .env
```

Thêm/sửa các dòng này:
```env
# APP CONFIG - PRODUCTION
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://random.tingnect.com
NEXT_PUBLIC_SOCKET_URL=https://random.tingnect.com

# NEXTAUTH
NEXTAUTH_URL=https://random.tingnect.com
```

**Lưu file**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 5️⃣ Rebuild Docker image
```bash
docker-compose build --no-cache
```

### 6️⃣ Restart container
```bash
docker-compose down
docker-compose up -d
```

### 7️⃣ Kiểm tra container đang chạy
```bash
docker-compose ps
docker-compose logs -f app
```

Nhấn `Ctrl + C` để thoát logs.

### 8️⃣ **KIỂM TRA NGINX** (nếu cần)
Mở Nginx config:
```bash
sudo nano /etc/nginx/sites-available/random
```

Đảm bảo có **map directive** cho WebSocket (thêm vào đầu file, trước `server {`):
```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name random.tingnect.com;

    # Cloudflare Real IP
    set_real_ip_from 0.0.0.0/0;
    real_ip_header X-Forwarded-For;

    # Main location
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # WebSocket/Socket.IO optimization
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

Test và reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 9️⃣ **KIỂM TRA CLOUDFLARE**
Vào Cloudflare Dashboard:
1. Chọn domain `tingnect.com`
2. Vào tab **Network**
3. Bật **WebSockets** = ON
4. Vào tab **Caching** → **Purge Everything** (xóa cache cũ)

---

## 🧪 CÁCH TEST

### Test 1: Kiểm tra Health từ VPS
```bash
curl http://localhost:3001/api/health
```
✅ Kết quả mong đợi:
```json
{"status":"healthy","timestamp":"...","database":"connected","version":"0.1.0"}
```

### Test 2: Kiểm tra từ Browser (máy tính của bạn)
1. Mở: `https://random.tingnect.com/control?id=694e442c2df7e163649a4191`
2. Mở DevTools Console (F12)
3. Xem log: Phải có `🔌 Control Panel connecting to: https://random.tingnect.com`
4. Phải có: `✅ Socket connected: <socket-id>`

### Test 3: Kiểm tra từ Mobile
1. Mở trên điện thoại: `https://random.tingnect.com/display/guest?id=694e442c2df7e163649a4191`
2. Phải thấy màn hình vòng quay
3. Status phải hiển thị **Connected** (màu xanh)

### Test 4: Kiểm tra đồng bộ Control + Display
1. **Máy tính**: Mở Control Panel
2. **Điện thoại**: Mở Display Guest (cùng ID campaign)
3. **Máy tính**: Click SPIN
4. **Điện thoại**: Vòng quay phải quay ngay lập tức

---

## 🔍 TROUBLESHOOTING

### ❌ Nếu vẫn báo "Mất kết nối"
```bash
# Xem logs container
docker-compose logs -f app

# Xem Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Kiểm tra firewall
sudo ufw status
```

### ❌ Nếu báo CORS error
Kiểm tra `server.mjs` có đúng CORS config:
```bash
nano ~/tingrandom/server.mjs
```
Tìm dòng:
```javascript
origin: [
  'http://localhost:3000',
  'https://random.tingnect.com',
  'http://random.tingnect.com',
  /^https?:\/\/.*\.tingnect\.com$/
],
```

### ❌ Nếu WebSocket không upgrade
Kiểm tra Cloudflare Network settings:
- WebSockets = ON
- Purge cache đã làm chưa?

---

## 📊 KẾT QUẢ MONG ĐỢI
✅ Control Panel kết nối được từ bất kỳ thiết bị nào  
✅ Display Guest hiển thị đồng bộ trên mobile  
✅ Wheel quay mượt mà khi click SPIN từ control  
✅ History cập nhật real-time trên tất cả devices  

---

## 📞 LIÊN HỆ HỖ TRỢ
Nếu gặp lỗi:
1. Chụp screenshot lỗi trong Browser Console (F12)
2. Copy logs từ: `docker-compose logs -f app`
3. Gửi cho developer để hỗ trợ

---

**Version**: 2024-12-27  
**Author**: GitHub Copilot AI  
**Status**: ✅ Tested & Ready to Deploy
