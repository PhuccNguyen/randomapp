// lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import { JwtPayload } from 'jsonwebtoken';

// Định nghĩa kiểu trả về để dễ dàng sử dụng trong các API Routes
type AuthSuccess = {
  user: any; // Bạn có thể thay 'any' bằng interface IUser nếu đã định nghĩa
  payload: string | JwtPayload;
};

/**
 * Middleware bắt buộc đăng nhập (Strict Auth)
 * Sử dụng cho các API nhạy cảm (Profile, Payment, Settings...)
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | AuthSuccess> {
  // 1. Extract Token
  const token = AuthService.extractTokenFromRequest(request);
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Authentication token is missing' },
      { status: 401 }
    );
  }

  try {
    // 2. Verify Token & Connect DB
    const payload = AuthService.verifyToken(token);
    await connectDB();
    
    // 3. Find User & Check Active Status
    const user = await User.findById(payload.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: User not found or account inactive' },
        { status: 401 }
      );
    }

    // 4. Return Success Data
    return { user, payload };

  } catch (error: any) {
    // Deep Tech: Log lỗi nội bộ để Dev biết tại sao token sai (hết hạn hay chữ ký sai)
    console.error('[AuthMiddleware] Token Verification Failed:', error.message);

    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid or expired token' },
      { status: 401 }
    );
  }
}

/**
 * Middleware đăng nhập tùy chọn (Optional Auth)
 * Dùng cho các trang public nhưng có tính năng thêm nếu đã login (Ví dụ: Trang chủ, Vòng quay Demo)
 */
export async function optionalAuth(request: NextRequest): Promise<AuthSuccess | null> {
  const token = AuthService.extractTokenFromRequest(request);
  
  if (!token) return null;

  try {
    const payload = AuthService.verifyToken(token);
    await connectDB();
    
    const user = await User.findById(payload.userId);
    // Chỉ trả về user nếu tài khoản còn hoạt động
    return (user && user.isActive) ? { user, payload } : null;
  } catch (error) {
    // Token lỗi thì coi như là khách (Guest), không cần báo lỗi
    return null;
  }
}

/**
 * Middleware kiểm tra phân quyền (Tier Guard)
 * AUTOMATION: Tự động chuẩn hóa chữ hoa/thường để so sánh chính xác
 */
export function requireTier(user: any, allowedTiers: string[]) {
  // 1. Data Normalization (Chuẩn hóa dữ liệu đầu vào)
  const userTier = (user.tier || 'personal').toString().toLowerCase();
  const normalizedAllowedTiers = allowedTiers.map(t => t.toLowerCase());

  // 2. Security Check
  if (!normalizedAllowedTiers.includes(userTier)) {
    return NextResponse.json(
      { 
        success: false, 
        error: `Access denied. Your tier (${userTier.toUpperCase()}) does not have permission.`,
        requiredTiers: normalizedAllowedTiers.map(t => t.toUpperCase()),
        upgradeLink: '/pricing' // Growth Hacking: Gợi ý nâng cấp ngay khi chặn
      },
      { status: 403 }
    );
  }
  
  return null; // Null nghĩa là OK, cho phép đi tiếp
}