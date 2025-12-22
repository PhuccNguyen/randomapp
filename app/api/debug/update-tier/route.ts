import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserTier } from '@/lib/user-types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, tier } = body;
    
    if (!email || !tier) {
      return NextResponse.json(
        { success: false, error: 'Email và tier là bắt buộc' },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User không tồn tại' },
        { status: 404 }
      );
    }
    
    user.tier = tier;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: `Đã cập nhật tier cho ${user.email} thành ${tier}`,
      user: {
        email: user.email,
        username: user.username,
        tier: user.tier
      }
    });
    
  } catch (error: any) {
    console.error('Error updating user tier:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật tier: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to update user tier',
    example: {
      email: 'test@example.com',
      tier: 'ENTERPRISE'
    },
    availableTiers: Object.values(UserTier)
  });
}