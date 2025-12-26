# 🔐 Hướng Dẫn Setup Google OAuth cho TingRandom

## 🎯 Mục Tiêu
Kích hoạt đăng nhập bằng Google cho ứng dụng TingRandom.

---

## 📋 Các Bước Setup

### **Bước 1: Tạo Google Cloud Project**

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Đặt tên: `TingRandom`
4. Click "Create"
5. Chờ project được tạo

---

### **Bước 2: Kích Hoạt API**

1. Vào **APIs & Services** → **Library**
2. Tìm **"Google+ API"** (hoặc "Google Identity")
3. Click "Enable"
4. Vào **APIs & Services** → **OAuth consent screen**
5. Chọn "External" → Click "Create"
6. Điền thông tin:
   - **App name**: TingRandom
   - **User support email**: email@example.com
   - Click "Save and Continue"
7. Bỏ qua "Scopes" (để mặc định) → "Save and Continue"
8. Bỏ qua "Test users" → "Save and Continue"

---

### **Bước 3: Tạo OAuth 2.0 Credentials**

1. Vào **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **OAuth 2.0 Client ID**
3. Chọn **Application type**: "Web application"
4. Đặt **Name**: `TingRandom OAuth`
5. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   (Sau này sẽ thêm domain production)
6. Click "Create"
7. Một popup sẽ hiển thị **Client ID** và **Client Secret**
8. Copy hai giá trị này

---

### **Bước 4: Cập Nhật Environment Variables**

Mở file `.env.local` (hoặc tạo mới) và cập nhật:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# NextAuth Setup
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Feature Flag
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

**Để generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

### **Bước 5: Restart Development Server**

```bash
npm run dev
```

---

## 🧪 Test Google OAuth

### Test Login
1. Truy cập `http://localhost:3000/auth/login`
2. Click **"Đăng nhập bằng Google"**
3. Chọn tài khoản Google
4. Bạn sẽ được redirect sang trang điều khiển

### Test Register  
1. Truy cập `http://localhost:3000/auth/register`
2. Click **"Đăng ký bằng Google"**
3. Chọn tài khoản Google
4. Hoàn thiện hồ sơ (nếu cần)

---

## 🚀 Production Setup

Khi deploy lên production (ví dụ: `random.tingnect.com`):

1. Vào Google Cloud Console → **Credentials**
2. Edit OAuth Client
3. Thêm **Authorized redirect URIs**:
   ```
   https://random.tingnect.com/api/auth/callback/google
   ```
4. Cập nhật `.env` trên production:
   ```env
   NEXTAUTH_URL=https://random.tingnect.com
   NEXTAUTH_SECRET=your-production-secret
   ```

---

## 🔍 Troubleshooting

### ❌ "Redirect URI mismatch"
- Đảm bảo URI trong Google Cloud Console khớp chính xác với URL trong `.env`
- Phải restart development server sau khi cập nhật `.env`

### ❌ "Invalid Client ID"
- Kiểm tra lại GOOGLE_CLIENT_ID có hợp lệ không
- Đảm bảo đã copy đúng từ Google Cloud Console

### ❌ "Credential is missing"
- Cập nhật `.env.local` với Client ID và Secret
- Restart server

### ❌ "Provider not configured"
- Đảm bảo `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` trong `.env`
- Restart server

---

## 📊 Kiểm Tra Cấu Hình

Truy cập `/setup-google` để xem status:
```
✅ Google OAuth: Enabled (nếu setup đúng)
❌ Google OAuth: Disabled (nếu chưa setup)
```

---

## 🔐 Best Practices

1. **Never commit credentials** - Luôn dùng `.env.local` (gitignored)
2. **Use strong NEXTAUTH_SECRET** - Generate bằng `openssl rand -base64 32`
3. **Rotate secrets regularly** - Especially trên production
4. **Monitor API usage** - Trên Google Cloud Console
5. **Add test users** - Trên OAuth consent screen (khi còn testing)

---

## 📚 Tài Liệu Tham Khảo

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Google OAuth 2.0 Flow](https://developers.google.com/identity/protocols/oauth2)

---

## 💡 Ghi Chú

- Database strategy: Sử dụng MongoDB với NextAuth adapter
- Session strategy: JWT (JSON Web Tokens)
- Profile completion: User có thể hoàn thiện profile sau khi Google signup
- Auto user creation: User được tự động tạo trong DB khi Google signup lần đầu
