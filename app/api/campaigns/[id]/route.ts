import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import AuthService from '@/lib/auth';
import User from '@/models/User';
import { isValidObjectId } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }
    
    const campaign = await Campaign.findById(id).populate('owner', 'name email tier');
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // ✅ AUTHORIZATION CHECK
    const token = AuthService.extractTokenFromRequest(request);
    
    // If campaign is PUBLIC - allow anyone to view
    if (campaign.isPublic) {
      return NextResponse.json({
        success: true,
        campaign
      });
    }

    // If campaign is PRIVATE - require authentication
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const payload = AuthService.verifyToken(token);
      
      // Check if user is the owner - MUST be owner to view private campaign
      if (campaign.owner._id.toString() !== payload.userId) {
        return NextResponse.json(
          { error: 'Bạn không có quyền truy cập chiến dịch này' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        campaign
      });
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // ✅ AUTHENTICATION REQUIRED
    const token = AuthService.extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = AuthService.verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // ✅ AUTHORIZATION CHECK - Only owner can update
    if (campaign.owner.toString() !== payload.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this campaign' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // ✅ AUTHENTICATION REQUIRED
    const token = AuthService.extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = AuthService.verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // ✅ AUTHORIZATION CHECK - Only owner can delete
    if (campaign.owner.toString() !== payload.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this campaign' },
        { status: 403 }
      );
    }

    await Campaign.findByIdAndDelete(id);
    
    // Update user's campaign count
    await User.findByIdAndUpdate(payload.userId, {
      $inc: { campaignsCount: -1 }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
