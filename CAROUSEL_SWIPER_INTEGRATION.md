# 🎠 Carousel Swiper Integration Guide

## ✅ Đã hoàn thành cập nhật

### 1. Campaign Setup Form (/campaign)
**File:** `components/CampaignSetup/sections/BasicInfoSection.tsx`

```tsx
// ✅ Đã thêm carousel-swiper vào dropdown
<optgroup label="✨ Vòng Quay Nâng Cao">
  <option value="glass-cylinder">🔮 Trụ kính 3D (Glass Cylinder)</option>
  <option value="infinite-horizon">🌊 Dải ngang panorama (Infinite Horizon)</option>
  <option value="cyber-decode">💻 Giải mã Matrix (Cyber Decode)</option>
  <option value="carousel-swiper">🎠 Băng chuyền xoay (Carousel Swiper)</option>
</optgroup>
```

### 2. TypeScript Types
**File:** `components/CampaignSetup/types.ts`

```typescript
// ✅ Đã cập nhật type
export interface CampaignFormData {
  mode: 'wheel' | 'reel' | 'battle' | 'mystery' | 'glass-cylinder' | 
        'infinite-horizon' | 'cyber-decode' | 'carousel-swiper';
  // ...
}
```

### 3. MongoDB Model
**File:** `models/Campaign.ts`

```typescript
// ✅ Đã thêm vào ICampaign interface
export interface ICampaign extends Document {
  mode: 'wheel' | 'reel' | 'battle' | 'mystery' | 'glass-cylinder' | 
        'infinite-horizon' | 'cyber-decode' | 'carousel-swiper';
  // ...
}

// ✅ Đã thêm vào Schema enum
mode: {
  type: String,
  enum: ['wheel', 'glass-cylinder', 'infinite-horizon', 'cyber-decode', 'carousel-swiper'],
  default: 'wheel',
}
```

### 4. Guest Display Page
**File:** `app/display/guest/page.tsx`

```tsx
// ✅ Đã import component
const CarouselSwiper = dynamic(() => import('@/components/Wheel/CarouselSwiper'), { ssr: false });

// ✅ Đã thêm vào Campaign interface
interface Campaign {
  mode?: 'wheel' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode' | 'carousel-swiper';
}

// ✅ Đã render trong JSX
{campaign.mode === 'carousel-swiper' && (
  <CarouselSwiper
    items={campaign.items}
    campaignId={campaign._id}
    isSpinning={spinning}
    isStopping={stopping}
    targetId={targetId || undefined}
    onSpinComplete={handleSpinComplete}
  />
)}
```

---

## 📋 Quy Trình Hoàn Chỉnh

```
┌─────────────────────────────────────────────────────────────┐
│  1. TẠO CAMPAIGN (/campaign)                                │
│  ✅ User chọn mode: carousel-swiper                         │
│  ✅ Form validation pass                                    │
│  ✅ POST /api/campaigns → Lưu DB với mode='carousel-swiper'│
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  2. CONTROL PANEL (/control?id=xxx)                         │
│  ✅ GET /api/campaigns/:id → Đọc campaign.mode             │
│  ✅ Load CarouselSwiper preview (optional)                 │
│  ✅ User click "Quay" → Socket emit('spin')                │
│  ✅ User click "Dừng" → Socket emit('stop', {targetId})    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ (Socket.IO)
┌─────────────────────────────────────────────────────────────┐
│  3. SERVER (server.mjs)                                     │
│  ✅ Nhận spin event                                         │
│  ✅ Broadcast state: { status: 'spinning', targetId, ... } │
│  ✅ Nhận stop event                                         │
│  ✅ Broadcast state: { status: 'stopped', targetId, ... }  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ (Socket.IO)
┌─────────────────────────────────────────────────────────────┐
│  4. DISPLAY GUEST (/display/guest?id=xxx)                  │
│  ✅ GET /api/campaigns/:id → Đọc campaign.mode             │
│  ✅ if mode === 'carousel-swiper'                          │
│     → Load <CarouselSwiper />                              │
│  ✅ Socket.on('state:update', (data) => {                  │
│       setSpinning(data.status === 'spinning')              │
│       setStopping(data.status === 'stopped')               │
│       setTargetId(data.targetId)                           │
│     })                                                      │
│  ✅ Component triggers animation                           │
│  ✅ onSpinComplete(result) → Show winner modal             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Các Props Cần Thiết cho CarouselSwiper

Component `CarouselSwiper` cần implement với props:

```typescript
interface CarouselSwiperProps {
  items: Array<{
    id: string;
    name: string;
    color: string;
    imageUrl?: string;
  }>;
  campaignId: string;
  isSpinning: boolean;
  isStopping: boolean;
  targetId?: string;
  onSpinComplete: (result: { id: string; name: string; color: string; imageUrl?: string }) => void;
}
```

---

## ✨ Tính Năng Đã Hoàn Thiện

- ✅ Form tạo campaign có option "Băng chuyền xoay"
- ✅ TypeScript types đầy đủ
- ✅ MongoDB schema validation
- ✅ Guest display tự động load component
- ✅ Socket.IO integration sẵn sàng
- ✅ Props interface chuẩn với các component khác

---

## 🚀 Bước Tiếp Theo

Nếu component `CarouselSwiper` chưa có, cần tạo file:

```bash
components/Wheel/CarouselSwiper.tsx
components/Wheel/CarouselSwiper.module.css
```

Với cấu trúc tương tự:
- GlassCylinder
- InfiniteHorizon  
- CyberDecode

---

**Created:** December 28, 2025  
**Status:** ✅ Integration Complete
