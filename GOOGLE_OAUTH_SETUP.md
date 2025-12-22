# 🔐 Setup Google OAuth cho TingRandom

## 📋 Hướng dẫn cấu hình Google OAuth

### 1️⃣ **Tạo Google Cloud Project**
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện tại
3. Enable **Google+ API** và **Google Identity API**

### 2️⃣ **Cấu hình OAuth 2.0**
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Chọn **Web application**
4. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   
### 3️⃣ **Cập nhật Environment Variables**
Mở file `.env.local` và cập nhật:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

### 4️⃣ **Production Setup**
Khi deploy production, thêm domain thật:
```
https://yourdomain.com/api/auth/callback/google
```

## ✅ **Tính năng đã implement**

### 📝 **Đăng ký bằng Google**
- ✅ User click "Đăng ký bằng Google"
- ✅ Redirect đến Google OAuth
- ✅ Tự động tạo user với tier PERSONAL
- ✅ Redirect đến `/pricing?welcome=true`

### 🔑 **Đăng nhập bằng Google**  
- ✅ User click "Đăng nhập bằng Google"
- ✅ Redirect đến Google OAuth
- ✅ Đăng nhập với tài khoản existing
- ✅ Redirect đến trang chủ `/`

### 🎨 **UI/UX**
- ✅ Google button với icon chính thức
- ✅ Divider "Hoặc" giữa Google và form thường
- ✅ Responsive design
- ✅ Error handling

## 🔧 **Test mà không cần Google OAuth**
Nếu chưa setup Google OAuth, vẫn có thể:
1. Sử dụng form đăng ký/đăng nhập thường
2. Google buttons sẽ show error friendly
3. Tất cả tính năng khác hoạt động bình thường

## 📱 **User Flow**

### **Flow đăng ký mới:**
1. Trang `/auth/register`
2. Click "Đăng ký bằng Google" 
3. Google OAuth popup
4. Tự động tạo account với tier PERSONAL
5. Redirect đến `/pricing?welcome=true`
6. User chọn gói dịch vụ

### **Flow đăng nhập:**
1. Trang `/auth/login`
2. Click "Đăng nhập bằng Google"
3. Google OAuth popup  
4. Redirect đến trang chủ `/`

## 🚀 **Next Steps**
- [ ] Setup Google Cloud Console
- [ ] Update environment variables
- [ ] Test Google OAuth flow
- [ ] Configure production domain