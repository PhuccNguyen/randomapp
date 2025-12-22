import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserTier, SubscriptionStatus } from '@/lib/user-types';

export async function POST() {
  try {
    await connectDB();
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'Test user already exists',
        user: {
          email: existingUser.email,
          username: existingUser.username
        }
      });
    }
    
    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: '123456', // This will be hashed by the pre-save hook
      name: 'Test User',
      phone: '0123456789',
      tier: UserTier.PERSONAL,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      isActive: true,
      isEmailVerified: true
    });
    
    await testUser.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test user created successfully',
      user: {
        email: testUser.email,
        username: testUser.username,
        name: testUser.name,
        phone: testUser.phone,
        tier: testUser.tier
      }
    });
    
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test user',
        details: error.message 
      },
      { status: 500 }
    );
  }
}