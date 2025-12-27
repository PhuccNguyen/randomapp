// app/api/campaigns/route.ts - SIMPLIFIED
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import AuthService from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 POST /api/campaigns - Start');
    await connectDB();
    
    const token = AuthService.extractTokenFromRequest(request);
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để tạo campaign' },
        { status: 401 }
      );
    }

    console.log('🔑 Token found, verifying...');
    let payload;
    try {
      payload = AuthService.verifyToken(token);
      console.log('✅ Token verified:', payload);
    } catch (error) {
      console.log('❌ Token verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' },
        { status: 401 }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive:', payload.userId);
      return NextResponse.json(
        { success: false, error: 'Tài khoản không tồn tại hoặc đã bị khóa' },
        { status: 401 }
      );
    }

    console.log('👤 User found:', { email: user.email, tier: user.tier });

    // 🔥 REMOVED: Subscription check (too strict for dev)
    
    // Check tier permission - Only Enterprise
    if (user.tier !== 'ENTERPRISE') {
      console.log('❌ Insufficient tier:', user.tier);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tính năng Campaign chỉ dành cho gói Enterprise (Sự kiện lớn). Vui lòng nâng cấp tài khoản.',
          requiredTier: 'ENTERPRISE',
          currentTier: user.tier
        },
        { status: 403 }
      );
    }

    // Check campaign limits
    if (!user.canCreateCampaign()) {
      const tierLimits = user.tierLimits;
      console.log('❌ Campaign limit reached:', { current: user.campaignsCount, max: tierLimits.maxCampaigns });
      return NextResponse.json(
        { 
          success: false, 
          error: `Bạn đã đạt giới hạn ${tierLimits.maxCampaigns} campaigns. Vui lòng xóa campaign cũ hoặc liên hệ support.`,
          currentCount: user.campaignsCount,
          maxAllowed: tierLimits.maxCampaigns
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('📦 Request body:', body);

    // Validation
    if (!body.name || !body.name.trim()) {
      console.log('❌ Missing campaign name');
      return NextResponse.json(
        { success: false, error: 'Tên campaign là bắt buộc' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      console.log('❌ No items provided');
      return NextResponse.json(
        { success: false, error: 'Campaign phải có ít nhất 1 giám khảo' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    // Note: Director script validation is removed here.
    // Director script can be added later in Control Panel.
    // Validation will happen when campaign is activated/played, not during creation.

    // Create campaign
    const campaignData = {
      ...body,
      owner: user._id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Creating campaign with data:', campaignData);

    const campaign = new Campaign(campaignData);
    const savedCampaign = await campaign.save();

    console.log('✅ Campaign saved:', savedCampaign._id);

    // Update user's campaign count
    await user.upgradeUsage();
    console.log('✅ User campaign count updated');

    return NextResponse.json({ 
      success: true, 
      id: savedCampaign._id.toString(),
      campaign: {
        _id: savedCampaign._id,
        name: savedCampaign.name,
        mode: savedCampaign.mode,
        displayMode: savedCampaign.displayMode,
        itemsCount: savedCampaign.items.length,
        scriptLength: savedCampaign.director_script?.length || 0
      },
      message: 'Campaign đã được tạo thành công!' 
    });

  } catch (error: any) {
    console.error('Error creating campaign:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ: ' + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = AuthService.extractTokenFromRequest(request);
    let campaigns: any[] = [];
    
    if (token) {
      try {
        const payload = AuthService.verifyToken(token);
        // Chỉ show campaigns của user đang login
        campaigns = await Campaign.find({
          owner: payload.userId
        })
        .populate('owner', 'name email tier')
        .sort({ createdAt: -1 })
        .select('-__v')
        .lean();
      } catch {
        // Token không hợp lệ - return empty list
        campaigns = [];
      }
    } else {
      // Không có token - return empty list (user phải login để see campaigns)
      campaigns = [];
    }
    
    return NextResponse.json({
      success: true,
      campaigns,
      count: campaigns.length
    });

  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách campaigns' },
      { status: 500 }
    );
  }
}
