import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get all users (without passwords)
    const users = await User.find({}).select('-password -emailVerificationToken -resetPasswordToken').limit(10);
    
    return NextResponse.json({ 
      success: true, 
      count: users.length,
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        tier: user.tier,
        isActive: user.isActive,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        details: error.message 
      },
      { status: 500 }
    );
  }
}