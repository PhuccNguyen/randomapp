# 🔧 FIX: Campaign Setup Logic & Preview

## ❌ VẤN ĐỀ BAN ĐẦU

### 1. **Naming Logic Lẫn Lộn:**
- "Chế độ hiển thị" → đang dùng cho `mode` (wheel/reel/battle/mystery)
- "Kiểu quay" → đang dùng cho `displayMode` (random/director)
- ❌ **Confusing!** Người dùng không hiểu rõ sự khác biệt

### 2. **Thiếu 3 Modes Mới:**
- ❌ Không có `glass-cylinder`, `infinite-horizon`, `cyber-decode` trong dropdown
- ❌ Preview không hiển thị các modes mới

### 3. **Preview Không Hoạt Động:**
- ❌ Chỉ render `SimpleWheel`, không dynamic theo `mode`
- ❌ Không thấy vòng quay nào khi chọn mode khác

---

## ✅ GIẢI PHÁP ĐÃ FIX

### 1. **Redesign Naming Convention:**

#### **Trước:**
```tsx
<label>Chế độ hiển thị</label>  // ← Confusing!
<select value={mode}>
  <option value="wheel">Vòng tròn (Wheel)</option>
</select>

<label>Kiểu quay</label>  // ← Confusing!
<select value={displayMode}>
  <option value="random">Ngẫu nhiên (Random)</option>
</select>
```

#### **Sau:**
```tsx
<label>
  Hình dạng vòng quay <span className={styles.required}>*</span>
</label>
<select value={mode}>
  <optgroup label="🎯 Vòng Quay Cơ Bản">
    <option value="wheel">🎡 Vòng tròn (Classic Wheel)</option>
  </optgroup>
  <optgroup label="✨ Vòng Quay Nâng Cao">
    <option value="glass-cylinder">🔮 Trụ kính 3D</option>
    <option value="infinite-horizon">🌊 Dải ngang panorama</option>
    <option value="cyber-decode">💻 Giải mã Matrix</option>
  </optgroup>
  <optgroup label="🎮 Đang Phát Triển">
    <option disabled>🎰 Trục ngang - Coming Soon</option>
  </optgroup>
</select>

<label>
  Chế độ random <span className={styles.required}>*</span>
</label>
<select value={displayMode}>
  <option value="random">🎲 Ngẫu nhiên (Random)</option>
  <option value="director">🎬 Đạo diễn (Director Script)</option>
</select>
<span className={styles.hint}>
  💡 Hệ thống tự động random kết quả công bằng
</span>
```

---

### 2. **Update PreviewSection - Dynamic Component Loading:**

#### **Trước:**
```tsx
const PreviewSection = ({ prizes, design }) => {
  return (
    <SimpleWheel segments={segments} />  // ❌ Always SimpleWheel
  );
};
```

#### **Sau:**
```tsx
import dynamic from 'next/dynamic';

const Wheel = dynamic(() => import('@/components/Wheel/Wheel'), { ssr: false });
const GlassCylinder = dynamic(() => import('@/components/Wheel/GlassCylinder'), { ssr: false });
const InfiniteHorizon = dynamic(() => import('@/components/Wheel/InfiniteHorizon'), { ssr: false });
const CyberDecode = dynamic(() => import('@/components/Wheel/CyberDecode'), { ssr: false });

const PreviewSection = ({ prizes, design, mode }) => {
  const items = prizes.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    imageUrl: p.image,
    hasQuestion: p.hasQuestion
  }));

  return (
    <>
      {mode === 'wheel' && <SimpleWheel segments={segments} />}
      {mode === 'glass-cylinder' && <GlassCylinder items={items} />}
      {mode === 'infinite-horizon' && <InfiniteHorizon items={items} />}
      {mode === 'cyber-decode' && <CyberDecode items={items} />}
      {(mode === 'reel' || mode === 'battle') && (
        <div>🚧 Coming Soon</div>
      )}
    </>
  );
};
```

---

### 3. **Update TypeScript Interfaces:**

```typescript
// components/CampaignSetup/types.ts
export interface CampaignFormData {
  mode: 'wheel' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode' | 'reel' | 'battle' | 'mystery';
  // ...
}

// components/CampaignSetup/sections/BasicInfoSection.tsx
interface BasicInfoSectionProps {
  mode: 'wheel' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode' | 'reel' | 'battle' | 'mystery';
  onModeChange: (value: ...) => void;
}

// components/CampaignSetup/sections/PreviewSection.tsx
interface PreviewSectionProps {
  prizes: Prize[];
  design: WheelDesign;
  mode: 'wheel' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode' | 'reel' | 'battle' | 'mystery';
}
```

---

### 4. **Pass `mode` Prop:**

```tsx
// CampaignSetup.tsx
<PreviewSection 
  prizes={formData.prizes} 
  design={formData.design}
  mode={formData.mode}  // ✅ Pass mode prop
/>
```

---

## 📊 LOGIC MỚI RÕ RÀNG HƠN

| Field | Ý Nghĩa | Values | Ví Dụ |
|-------|---------|--------|-------|
| **Hình dạng vòng quay** | Kiểu hiển thị UI cho khán giả | wheel, glass-cylinder, infinite-horizon, cyber-decode | 🎡 Vòng tròn, 🔮 Trụ kính 3D |
| **Chế độ random** | Cách chọn kết quả | random, director | 🎲 Ngẫu nhiên, 🎬 Đạo diễn theo script |

---

## 🎯 KẾT QUẢ

### ✅ **Trước:**
- ❌ User confused giữa "Chế độ hiển thị" vs "Kiểu quay"
- ❌ Preview không hiển thị vòng quay mới
- ❌ Chỉ có 4 modes cũ (wheel/reel/battle/mystery)

### ✅ **Sau:**
- ✅ Naming rõ ràng: "Hình dạng vòng quay" vs "Chế độ random"
- ✅ Preview dynamic loading theo mode
- ✅ Đầy đủ 7 modes (4 cũ + 3 mới)
- ✅ Grouping options với icons
- ✅ Disabled coming soon modes
- ✅ Hints explain từng option

---

## 🚀 TEST NGAY

1. **Access:** `http://localhost:3000/campaign`
2. **Chọn "Hình dạng vòng quay":**
   - 🎡 Vòng tròn → Preview SimpleWheel
   - 🔮 Trụ kính 3D → Preview GlassCylinder
   - 🌊 Dải ngang → Preview InfiniteHorizon
   - 💻 Giải mã Matrix → Preview CyberDecode
3. **Xem Preview** bên phải tự động update theo mode
4. **Save campaign** → Redirect to Control Panel

---

## 📝 FILES MODIFIED

1. ✅ `components/CampaignSetup/sections/BasicInfoSection.tsx`
   - Updated interface
   - Redesigned dropdown với optgroups
   - Added hints cho mỗi option

2. ✅ `components/CampaignSetup/sections/PreviewSection.tsx`
   - Added dynamic imports
   - Conditional rendering theo mode
   - Added "Coming Soon" placeholder

3. ✅ `components/CampaignSetup/types.ts`
   - Updated `CampaignFormData` interface
   - Added new mode types

4. ✅ `components/CampaignSetup/CampaignSetup.tsx`
   - Pass `mode` prop to PreviewSection

---

**Fix hoàn tất! Preview giờ đã hiển thị đúng vòng quay theo mode.** 🎉
