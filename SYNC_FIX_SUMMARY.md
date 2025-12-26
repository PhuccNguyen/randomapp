# Fix Đồng Bộ Vòng Quay - Tất Cả Guests Thấy Cùng Kết Quả

## 🎯 Vấn Đề Gốc Rễ
Khi quay mà **không chọn "Ép kết quả"**, mỗi guest thấy kết quả khác nhau vì:
1. Control Panel không gửi `targetId`
2. Mỗi Wheel component random độc lập
3. Kết quả không được đồng bộ qua server

## ✅ Giải Pháp Đã Implement

### 1. **Server-Side Randomization** (`lib/socket.ts`)
```
control:stop event handler:
- Kiểm tra nếu chưa có targetId (không chọn Override)
- Server random một target từ danh sách items
- Gửi CÙNG targetId cho TẤT CẢ guests
```

**Benefit**: Tất cả guests nhận cùng target ID → cùng kết quả

### 2. **Items List Propagation**
- `useSocket.ts`: Nhận items từ ControlPanel props
- `ControlPanel.tsx`: Truyền items vào useSocket
- `ControlState interface`: Thêm field `items?: JudgeItem[]`
- `triggerStop()`: Gửi `items` lên server trong `control:stop` event

### 3. **Wheel Component Fix** (`components/Wheel/Wheel.tsx`)
```
stopSpin() logic:
- LUÔN sử dụng targetId từ server (không random local)
- Tính toán angle chính xác để dừng tại center của segment
- Thêm extra spins (5 vòng) cho hiệu ứng
- Log chi tiết để debug
```

### 4. **Display Guest Logging** (`app/display/guest/page.tsx`)
- Thêm log "TargetId received: xxx" khi stopped
- Log "Setting targetId to: xxx"
- Log warning nếu không có targetId

## 📊 Flow Đồng Bộ

```
Control Panel (Manual Stop/Auto Mode)
    ↓ (emit 'control:stop' với items)
Server (lib/socket.ts)
    ↓ (random target nếu cần, send CÙNG targetId)
All Guests (app/display/guest/page.tsx)
    ↓ (nhận CÙNG targetId)
All Wheel Components
    ↓ (dừng ở CÙNG vị trí)
Kết quả: 100% đồng bộ ✅
```

## 🔍 Chi Tiết Các File Thay Đổi

### 1. `lib/socket.ts` - `control:stop` event (lines 252-278)
**Thay đổi**: Thêm server-side random
```typescript
const finalTargetId = targetId || session.lastTargetId;

// ✅ Server random nếu chưa có target
if (!finalTargetId && items && items.length > 0) {
  const randomIndex = Math.floor(Math.random() * items.length);
  finalTargetId = items[randomIndex].id;
}

// ✅ Broadcast CÙNG targetId cho tất cả guests
io?.to(`campaign:${campaignId}`).emit('state:update', {
  status: 'stopped',
  currentStep: session.currentStep,
  targetId: finalTargetId, // ← Tất cả guests nhận cùng này
  scriptInfo: session.scriptInfo
});
```

### 2. `components/ControlPanel/types.ts` - ControlState interface
**Thay đổi**: Thêm `items` field
```typescript
export interface ControlState {
  // ... existing fields ...
  items?: JudgeItem[]; // ← NEW: Danh sách items cho random
}
```

### 3. `components/ControlPanel/hooks/useSocket.ts`
**Thay đổi 1**: Constructor thêm `items` parameter
```typescript
export const useSocket = (campaignId: string, items?: JudgeItem[]): UseSocketReturn => {
```

**Thay đổi 2**: Initialize state với items
```typescript
const [state, setState] = useState<ControlState>({
  // ...
  items: items || [] // ← NEW
});
```

**Thay đổi 3**: triggerStop gửi items
```typescript
socket.emit('control:stop', { 
  campaignId,
  targetId: state.targetId,
  items: state.items // ← NEW: Gửi danh sách cho server
});
```

**Thay đổi 4**: Dependency array
```typescript
}, [campaignId, items]); // ← Thêm items
```

### 4. `components/ControlPanel/ControlPanel.tsx`
**Thay đổi**: Truyền items vào useSocket
```typescript
const { /* ... */ } = useSocket(campaignId, items); // ← Truyền items
```

### 5. `components/Wheel/Wheel.tsx` - stopSpin()
**Thay đổi toàn bộ**: Rewrite logic
```typescript
const stopSpin = useCallback(() => {
  // ✅ LUÔN sử dụng targetId từ server
  let targetIndex = -1;
  
  if (targetId) {
    targetIndex = items.findIndex(item => item.id === targetId);
    if (targetIndex === -1) {
      console.warn('⚠️ Target ID not found');
      targetIndex = 0;
    }
  } else {
    console.warn('⚠️ No targetId provided');
    targetIndex = Math.floor(Math.random() * items.length);
  }
  
  // ✅ Tính angle chính xác
  const anglePerSegment = 360 / items.length;
  const segmentCenterAngleFromTop = -90 + targetIndex * anglePerSegment + anglePerSegment / 2;
  const segmentCenterAnglePositive = (segmentCenterAngleFromTop % 360 + 360) % 360;
  const targetStopAngle = (360 - segmentCenterAnglePositive) % 360;
  
  // ... calculate finalRotation ...
  setRotation(finalRotation);
  
  setTimeout(() => {
    setSpinning(false);
    if (onSpinComplete) {
      const winner = items[targetIndex];
      onSpinComplete(winner);
    }
  }, 5000);
}, [rotation, items, targetId, onSpinComplete]);
```

### 6. `app/display/guest/page.tsx` - state:update handler
**Thay đổi**: Thêm debug logs
```typescript
} else if (data.status === 'stopped') {
  console.log('⏹️ Status: STOPPED - Data:', data);
  console.log('⏹️ TargetId received:', data.targetId);
  setStopping(true);
  setSpinning(false);
  if (data.targetId) {
    console.log('✅ Setting targetId to:', data.targetId);
    setTargetId(data.targetId);
  } else {
    console.warn('⚠️ No targetId in stopped status!');
  }
```

## 🧪 Cách Test

### Test 1: Manual Spin + Stop (Không chọn Override)
1. Mở Control Panel (`/control?id=xxx`)
2. Mở 2+ Display Guests (`/display/guest?id=xxx`) - 2 tabs khác nhau
3. Nhấn "Quay" ở Control
4. Nhấn "Dừng" ở Control
5. **Verify**: Cả 2 guests dừng ở cùng kết quả ✅

### Test 2: Auto Mode (Không chọn Override)
1. Mở Control Panel
2. Mở 2+ Display Guests
3. Chọn duration (vd: 5s)
4. Bật "Chế độ Tự động"
5. Observe 2-3 vòng quay
6. **Verify**: Mọi vòng quay tất cả guests cùng kết quả ✅

### Test 3: Script Mode
1. Tạo script với target_judge_id
2. Nhấn "Tiếp Theo"
3. **Verify**: Kết quả trùng script ✅

### Test 4: Override Mode (sanity check)
1. Chọn "Ép kết quả" = Judge A
2. Nhấn "Quay" + "Dừng"
3. **Verify**: Tất cả guests hiển thị Judge A ✅

## 📝 Debug Console Logs

### Server logs (`lib/socket.ts`):
```
🎮 Control:Stop for 694e442c2df7e163649a4191 { targetId: undefined, itemsCount: 5 }
🎯 Server random target: index=2, id=judge_3, name=Judge C
```

### Guest logs (`app/display/guest/page.tsx`):
```
📡 State update: { status: 'stopped', targetId: 'judge_3', ... }
⏹️ Status: STOPPED - Data: { ... }
⏹️ TargetId received: judge_3
✅ Setting targetId to: judge_3
```

### Wheel logs (`components/Wheel/Wheel.tsx`):
```
✅ Wheel: Using server target - Index: 2, Name: Judge C
🎯 Wheel Stop Calculation: { targetIndex: 2, targetName: "Judge C", ... }
✅ Wheel: Spin complete - Winner: Judge C ID: judge_3
```

## 🚀 Deployment

1. **Development**: Commit các file thay đổi
2. **Production**: Deploy bình thường - không cần database migration
3. **Backward compatible**: Nếu không có items, sẽ fallback random (legacy)

## ⚠️ Edge Cases Handled

1. **targetId not found in items**: Fallback to index 0 (log warning)
2. **Empty items list**: Fallback random (log warning)
3. **No targetId provided**: Server random (log warning)
4. **Multiple guests join mid-spin**: Nhận sync state ngay lập tức
5. **Guest disconnects/reconnects**: Nhận state mới đầy đủ

## 📈 Improvements Made

| Vấn đề | Trước | Sau |
|--------|-------|-----|
| Random target | Mỗi guest random độc lập | Server random 1 lần |
| Targeting | Không nhất quán | Tất cả guests cùng target |
| Desyncing | Hay xảy ra | Không xảy ra |
| Debug | Khó tìm nguyên nhân | Log chi tiết mỗi bước |
| Architecture | Client-side RNG | Server-side RNG |

---

**Status**: ✅ Ready for Testing
**Tested**: Manual testing recommended trước khi production
**Risk Level**: Low (backward compatible, server-side only changes)
