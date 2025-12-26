// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AuthService from '@/lib/auth';
import { authOptions } from '@/lib/auth-config';
import bcrypt from 'bcryptjs';

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = AuthService.extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = AuthService.verifyToken(token);
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        tier: user.tier,
        phone: user.phone,
        companyName: user.companyName,
        companySize: user.companySize,
        industry: user.industry,
        campaignsCount: user.campaignsCount,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        subscriptionStatus: user.subscriptionStatus
      }
    });

  } catch (error: any) {
    console.error('❌ Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Complete profile setup (for OAuth users or new registration)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get session từ NextAuth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name, username, password, phone, address, city, country, profileComplete } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Họ và tên là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' },
          { status: 400 }
        );
      }
    }

    // Validate username if provided
    if (username) {
      if (username.length < 3) {
        return NextResponse.json(
          { success: false, error: 'Username phải có ít nhất 3 ký tự' },
          { status: 400 }
        );
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Update profile fields
    if (name) user.name = name;
    
    if (username) {
      // Check if username is already taken
      if (username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'Tên đăng nhập đã được sử dụng' },
            { status: 400 }
          );
        }
      }
      user.username = username;
    }

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    
    // Mark profile as complete
    if (profileComplete === true) {
      user.profileComplete = true;
    }

    await user.save();
    console.log('✅ Profile updated for user:', user.email);

    // Return updated user (without password)
    const updatedUser = await User.findById(user._id).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thành công',
      user: {
        id: updatedUser._id.toString(),
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        country: updatedUser.country,
        tier: updatedUser.tier,
        profileComplete: updatedUser.profileComplete,
        campaignsCount: updatedUser.campaignsCount,
        createdAt: updatedUser.createdAt,
      }
    });

  } catch (error: any) {
    console.error('❌ Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Extract token
    const token = AuthService.extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Token required' },
        { status: 401 }
      );
    }

    // Verify token
    let payload;
    try {
      payload = AuthService.verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, username, phone, address, city, country, companyName, companySize, industry } = body;

    // Find user
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update allowed fields only
    if (name !== undefined) user.name = name;
    if (username !== undefined) {
      // Check if username is already taken
      if (username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'Tên đăng nhập đã được sử dụng' },
            { status: 400 }
          );
        }
        user.username = username;
      }
    }
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (companyName !== undefined) user.companyName = companyName;
    if (companySize !== undefined) user.companySize = companySize;
    if (industry !== undefined) user.industry = industry;
    
    // Mark profile as complete
    user.profileComplete = true;

    await user.save();

    // Return updated user (without password)
    const updatedUser = await User.findById(user._id).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thành công',
      user: {
        id: updatedUser._id.toString(),
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        country: updatedUser.country,
        tier: updatedUser.tier,
        companyName: updatedUser.companyName,
        companySize: updatedUser.companySize,
        industry: updatedUser.industry,
        profileComplete: updatedUser.profileComplete,
        campaignsCount: updatedUser.campaignsCount,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt
      }
    });

  } catch (error: any) {
    console.error('❌ Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi: ' + error.message },
      { status: 500 }
    );
  }
}
