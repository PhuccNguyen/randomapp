// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { identifier, password, email } = body;

    // Support both legacy 'email' and new 'identifier' fields
    const loginField = identifier || email;

    // ✅ Validation
    if (!loginField || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Username/Phone và password là bắt buộc' },
        { status: 400 }
      );
    }

    // ✅ Trim inputs
    const trimmedIdentifier = loginField.trim();
    const trimmedPassword = password.trim();

    // ✅ Determine login method and build query
    let query: any = {};
    
    // Check if it's an email
    if (trimmedIdentifier.includes('@')) {
      query.email = trimmedIdentifier.toLowerCase();
    }
    // Check if it's a phone number (starts with + or contains only digits)
    else if (/^[\+]?[0-9]+$/.test(trimmedIdentifier)) {
      query.phone = trimmedIdentifier;
    }
    // Otherwise, assume it's a username
    else {
      query.username = trimmedIdentifier;
    }

    console.log('🔍 Login attempt with query:', query);

    // ✅ Find user with select password explicitly
    const user = await User.findOne(query).select('+password');

    if (!user) {
      console.log('❌ User not found with query:', query);
      return NextResponse.json(
        { success: false, error: 'Thông tin đăng nhập không đúng' },
        { status: 401 }
      );
    }

    // ✅ Check if password exists on user object
    if (!user.password) {
      console.error('❌ User password is undefined:', user.email);
      return NextResponse.json(
        { success: false, error: 'Lỗi hệ thống. Vui lòng liên hệ admin.' },
        { status: 500 }
      );
    }

    // ✅ Compare password
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(trimmedPassword);
    } catch (compareError) {
      console.error('❌ Password comparison error:', compareError);
      return NextResponse.json(
        { success: false, error: 'Lỗi xác thực mật khẩu' },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.email);
      return NextResponse.json(
        { success: false, error: 'Thông tin đăng nhập không đúng' },
        { status: 401 }
      );
    }

    // ✅ Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản đã bị khóa' },
        { status: 403 }
      );
    }

    // ✅ Update last login
    user.lastLoginAt = new Date();
    await user.save();

    console.log('✅ Login successful for:', user.email);

    // ✅ Create NextAuth JWT token
    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        name: user.name,
        provider: user.provider || 'email',
        googleId: user.googleId,
        profileComplete: user.profileComplete || false,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      },
      process.env.NEXTAUTH_SECRET || 'secret'
    );

    // ✅ Return user data with token
    const userData = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      tier: user.tier,
      subscriptionStatus: user.subscriptionStatus,
      campaignsCount: user.campaignsCount,
      isEmailVerified: user.isEmailVerified,
      provider: user.provider || 'email',
      profileComplete: user.profileComplete || false,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: userData
    });

    // ✅ Set NextAuth JWT cookie (httpOnly, secure)
    response.cookies.set({
      name: 'next-auth.jwt',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi đăng nhập: ' + error.message },
      { status: 500 }
    );
  }
}
