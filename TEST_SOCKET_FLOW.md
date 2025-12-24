# Test Socket.IO Flow - TingRandom

## 🔧 Bước 1: Restart Server (BẮT BUỘC)

```powershell
# Stop server hiện tại: Ctrl+C
# Chạy lại:
npm run dev
```

Đợi thấy logs:
```
> Ready on http://localhost:3000
> Socket.IO server running
🚀 Socket.IO server configured on path: /socket.io
```

---

## 🧪 Bước 2: Test Socket Connection

### A. Mở trang test:
```
http://localhost:3000/test-socket
```

**Expected logs trong Console (F12):**
- ✅ Socket connected! ID: xxx
- 📌 Sent join event for test-campaign-123

**Expected logs trong Terminal server:**
- ✅ Client connected: xxx
- 📌 Socket xxx joined campaign:test-campaign-123

### B. Click "Test Spin" và "Test Stop"

**Expected logs trong Terminal server:**
- 🔄 Spin triggered for campaign:test-campaign-123
- 📊 Clients in room: 1
- ✅ Emitted state:update to campaign:test-campaign-123

---

## 🎮 Bước 3: Test Control → Display Flow

### Setup:
1. Tạo một campaign mới hoặc dùng campaign có sẵn
2. Lấy Campaign ID (VD: `694a34a6e9558ffd45492442`)

### Mở 2 tabs:

**Tab 1 - Control Panel:**
```
http://localhost:3000/control?id=694a34a6e9558ffd45492442
```

**Tab 2 - Display (từ Control Panel):**
- Click button "📺 Xem màn hình" 
- Hoặc mở trực tiếp: `http://localhost:3000/display/guest?id=694a34a6e9558ffd45492442`

---

## 📊 Bước 4: Verify Logs

### Tab 1 Console (Control Panel):
```
🔧 Control Panel: Initializing socket for campaign: 694a34a6e9558ffd45492442
✅ Control Panel: Socket connected: abc123
📌 Control Panel: Joining room: 694a34a6e9558ffd45492442
```

### Tab 2 Console (Display):
```
🔌 Attempting to connect socket for campaign: 694a34a6e9558ffd45492442
✅ Display: Socket connected: def456
📌 Display: Joining room with campaign ID: 694a34a6e9558ffd45492442
✅ Display: Join event emitted
```

### Terminal Server:
```
✅ Client connected: abc123
📌 Socket abc123 joined campaign:694a34a6e9558ffd45492442

✅ Client connected: def456
📌 Socket def456 joined campaign:694a34a6e9558ffd45492442
```

---

## 🎯 Bước 5: Test Control Actions

### Trong Control Panel (Tab 1):

1. **Click "QUAY"**
   
   **Control Console:**
   ```
   🔄 Control Panel: Triggering spin for campaign: 694a34a6e9558ffd45492442
   ✅ Control Panel: Spin event emitted
   ```
   
   **Display Console:**
   ```
   📡 Display: State update received: {status: 'spinning', currentStep: 1}
   🎲 Display: Starting spin...
   ```
   
   **Server Terminal:**
   ```
   🔄 Spin triggered for campaign:694a34a6e9558ffd45492442
   📊 Clients in room: 2
   ✅ Emitted state:update to campaign:694a34a6e9558ffd45492442
   ```

2. **Click "STOP"**
   
   **Control Console:**
   ```
   ⏹️ Control Panel: Triggering stop for campaign: 694a34a6e9558ffd45492442
   ✅ Control Panel: Stop event emitted
   ```
   
   **Display Console:**
   ```
   📡 Display: State update received: {status: 'stopped'}
   🛑 Display: Stopping spin...
   ```
   
   **Server Terminal:**
   ```
   ⏹️ Stop triggered for campaign:694a34a6e9558ffd45492442
   📊 Clients in room: 2
   ✅ Emitted state:update to campaign:694a34a6e9558ffd45492442
   ```

---

## ❌ Troubleshooting

### Problem: "Mất kết nối" / "🔴 Mất kết nối"

**Check 1: Server đang chạy đúng?**
```powershell
# Verify trong terminal thấy:
> Ready on http://localhost:3000
🚀 Socket.IO server configured on path: /socket.io
```

**Check 2: Campaign ID có đúng?**
- So sánh Campaign ID trong Control URL vs Display URL
- Phải giống HOÀN TOÀN

**Check 3: Console có lỗi?**
- Mở F12 trong cả 2 tabs
- Tìm lỗi màu đỏ
- Copy log và check

**Check 4: Server logs có "Clients in room: 0"?**
- Nếu 0 → Client không join được room
- Restart server và thử lại

**Check 5: Port 3000 có bị conflict?**
```powershell
netstat -ano | findstr :3000
# Nếu có nhiều processes → kill và restart
```

---

## ✅ Success Indicators

1. ✅ Status badge "🟢 Kết nối" trong Control Panel
2. ✅ Status badge "Trực tiếp" trong Display  
3. ✅ Click Quay → Wheel quay trong Display
4. ✅ Server logs show "Clients in room: 2"
5. ✅ No errors in Console

---

## 🆘 Nếu vẫn lỗi

Chụp màn hình:
1. Console của Control Panel (F12)
2. Console của Display (F12)
3. Terminal server logs
4. URL của cả 2 tabs

Và gửi cho dev để debug tiếp!
