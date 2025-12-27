import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AuthService from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from request
    const token = AuthService.extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Token không tồn tại' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = AuthService.verifyToken(token);
    
    // Get user from database
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tài khoản đã bị vô hiệu hóa' },
        { status: 401 }
      );
    }

    // Return user info (chỉ dùng các field chắc chắn tồn tại)
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndsAt: user.subscriptionEndsAt,
      tierLimits: user.tierLimits,
      isSubscriptionActive: user.isSubscriptionActive,
      companyName: user.companyName || null
    };

    return NextResponse.json({
      user: userResponse
    });

  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Token không hợp lệ' },
      { status: 401 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { message: 'Đăng xuất thành công' },
    { 
      status: 200,
      headers: {
        'Set-Cookie': 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
      }
    }
  );
}