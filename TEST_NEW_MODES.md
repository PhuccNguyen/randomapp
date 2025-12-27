# 🎯 HƯỚNG DẪN TEST CÁC VÒNG QUAY MỚI

## ✅ ĐÃ HOÀN THÀNH

### 1. **InfiniteHorizon** 🌊 (Dải Ngang Panorama)
- ✅ Physics acceleration/deceleration như Wheel gốc
- ✅ Wobble effect khi dừng
- ✅ Flip animation khi winner
- ✅ Responsive design
- **Animation:** Cards trượt ngang, scale & opacity theo khoảng cách từ center

### 2. **GlassCylinder** 🔮 (3D Cylinder Đẳng Cấp)
- ✅ Physics easing easeOutQuart
- ✅ 3D rotation với rotateX
- ✅ Wobble bounce effect
- ✅ Focus indicator với arrows
- **Animation:** Items quay trong cylinder 3D, focused item highlight

### 3. **CyberDecode** 💻 (Matrix Scramble)
- ✅ Audio context tối ưu (không tạo quá nhiều contexts)
- ✅ Progressive decode: Start fast → slow down
- ✅ Scramble animation với typing sound
- ✅ CRT monitor effects (scanlines, grid, glitch)
- **Animation:** Text scramble → Decode từng ký tự với progress bar

---

## 🚀 CÁCH TEST

### **Bước 1: Access localhost**
```
http://localhost:3000
```

### **Bước 2: Tạo Campaign mới**
1. Đăng nhập vào hệ thống
2. Vào `/campaign` để tạo campaign mới
3. **Chọn Mode:**
   - `wheel` - Classic Wheel (vòng quay tròn gốc)
   - `glass-cylinder` - Glass Cylinder 🔮
   - `infinite-horizon` - Infinite Horizon 🌊
   - `cyber-decode` - Cyber Decode 💻

### **Bước 3: Test Control Panel**
```
http://localhost:3000/control?id=YOUR_CAMPAIGN_ID
```
- Click **"Quay"** → Component bắt đầu spin
- Click **"Dừng"** → Component dừng tại target (random hoặc từ script)
- Kiểm tra physics mượt mà, không giật

### **Bước 4: Test Display Guest**
```
http://localhost:3000/display/guest?id=YOUR_CAMPAIGN_ID
```
- Mở 2 tabs: 1 Control Panel, 1 Display Guest
- Trigger spin từ Control Panel
- Xem animation trên Display Guest
- Verify winner hiển thị đúng

---

## 📱 TEST RESPONSIVE

### Desktop (1920x1080):
- ✅ InfiniteHorizon: Cards 280px, smooth scroll
- ✅ GlassCylinder: 600px wide, 3D depth
- ✅ CyberDecode: Terminal 900px max-width

### Mobile (768px):
- ✅ InfiniteHorizon: Cards 220px, smaller font
- ✅ GlassCylinder: 90% width, adjusted 3D
- ✅ CyberDecode: Font 48px, padding 20px

---

## 🎨 PHYSICS COMPARISON

| Component | Acceleration | Max Speed | Deceleration | Duration | Wobble |
|-----------|--------------|-----------|--------------|----------|--------|
| **Wheel** (gốc) | 0.4/frame → 25 | 25 deg/frame | easeOutQuart | 4-6s | Yes (5px) |
| **InfiniteHorizon** | 0.8/frame → 50 | 50 px/frame | easeOutQuart | 4.5-6s | Yes (15px) |
| **GlassCylinder** | 0.6/frame → 40 | 40 px/frame | easeOutQuart | 4-6s | Yes (8px) |
| **CyberDecode** | N/A (scramble) | 50ms interval | Progressive | 3-5s | N/A |

---

## 🐛 CHECKLIST DEBUG

- [ ] Wheel gốc vẫn hoạt động bình thường
- [ ] InfiniteHorizon: Cards không bị glitch khi loop
- [ ] GlassCylinder: 3D perspective không bị méo
- [ ] CyberDecode: Audio không bị lag hay nhiều contexts
- [ ] Socket.IO: State sync giữa Control ↔ Display
- [ ] Winner popup hiển thị đúng thông tin
- [ ] History sidebar cập nhật real-time
- [ ] Mobile responsive không bị overflow

---

## 🎯 NEXT STEPS

### Campaign Setup Integration:
```tsx
// components/CampaignSetup/sections/BasicInfoSection.tsx
<select value={mode} onChange={(e) => setMode(e.target.value)}>
  <option value="wheel">🎡 Classic Wheel</option>
  <option value="glass-cylinder">🔮 Glass Cylinder</option>
  <option value="infinite-horizon">🌊 Infinite Horizon</option>
  <option value="cyber-decode">💻 Cyber Decode</option>
</select>
```

### Display Guest Dynamic Loading:
```tsx
// app/display/guest/page.tsx
{campaign.mode === 'glass-cylinder' && <GlassCylinder {...props} />}
{campaign.mode === 'infinite-horizon' && <InfiniteHorizon {...props} />}
{campaign.mode === 'cyber-decode' && <CyberDecode {...props} />}
{(!campaign.mode || campaign.mode === 'wheel') && <Wheel {...props} />}
```

---

## 💡 TIPS

1. **Nếu animation giật:** Kiểm tra `requestAnimationFrame` và `deltaTime`
2. **Nếu không dừng đúng target:** Check `targetId` prop và `findIndex()`
3. **Nếu CSS không load:** Verify `.module.css` files exist
4. **Nếu audio lỗi:** Check browser console, có thể cần user interaction trước

---

## 🎉 DEMO LINKS

- **Home:** http://localhost:3000
- **Campaign Setup:** http://localhost:3000/campaign
- **Control Panel:** http://localhost:3000/control?id=YOUR_ID
- **Display Guest:** http://localhost:3000/display/guest?id=YOUR_ID

---

**Chúc bạn test thành công! 🚀**
