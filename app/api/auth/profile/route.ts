// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AuthService from '@/lib/auth';

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
