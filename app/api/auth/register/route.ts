// app/api/auth/register/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserTier, SubscriptionStatus } from '@/lib/user-types';
import AuthService from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, password, tier } = body; // ✅ Accept tier from request

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username và password là bắt buộc' },
        { status: 400 }
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username) || username.length < 3) {
      return NextResponse.json(
        { error: 'Username không hợp lệ (ít nhất 3 ký tự, chỉ chữ, số và dấu gạch dưới)' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username đã được sử dụng' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    const defaultEmail = `${username.toLowerCase()}@temp.local`;
    const defaultName = username;

    // ✅ Allow tier to be set from request (for testing)
    const userTier = tier || UserTier.PERSONAL;

    const userData: Record<string, unknown> = {
      email: defaultEmail,
      username: username.toLowerCase(),
      password,
      name: defaultName,
      tier: userTier, // ✅ Use provided tier or default to PERSONAL
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      needsProfileCompletion: true
    };

    const user = new User(userData);
    await user.save();

    const token = AuthService.generateToken({
      userId: user._id.toString(),
      email: user.email,
      tier: user.tier
    });

    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      tier: user.tier,
      needsProfile: true,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndsAt: user.subscriptionEndsAt,
      tierLimits: user.tierLimits,
      isSubscriptionActive: user.isSubscriptionActive,
      companyName: user.companyName
    };

    const response = NextResponse.json({
      message: 'Đăng ký thành công',
      user: userResponse,
      token
    }, { status: 201 });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: 'Email hoặc username đã được sử dụng' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Lỗi server, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
