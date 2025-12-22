import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Campaign from '@/models/Campaign';

export async function POST() {
  try {
    await connectDB();
    
    const demoCampaign = {
      name: 'Demo Campaign - Hoa Hậu 2025',
      items: [
        { id: 'BGK_01', name: 'Giám khảo Phương Mai', hasQuestion: true },
        { id: 'BGK_02', name: 'Giám khảo Thu Minh', hasQuestion: true },
        { id: 'BGK_03', name: 'Giám khảo Đức Phúc', hasQuestion: false },
        { id: 'BGK_04', name: 'Giám khảo Hương Giang', hasQuestion: true },
        { id: 'BGK_05', name: 'Giám khảo Thanh Hằng', hasQuestion: false },
        { id: 'BGK_06', name: 'Giám khảo Võ Hoàng Yến', hasQuestion: true },
      ],
      director_script: [
        {
          step: 1,
          contestant: 'Thí sinh 01 (SBD 085)',
          target_judge_id: 'BGK_01',
          question_content: 'Theo bạn, phụ nữ hiện đại cần có những phẩm chất gì để thành công?'
        },
        {
          step: 2,
          contestant: 'Thí sinh 02 (SBD 123)',
          target_judge_id: 'BGK_04',
          question_content: 'Làm thế nào để cân bằng giữa sự nghiệp và cuộc sống cá nhân?'
        }
      ],
      mode: 'wheel',
      displayMode: 'director'
    };
    
    const campaign = new Campaign(demoCampaign);
    const savedCampaign = await campaign.save();
    
    return NextResponse.json({ 
      success: true, 
      id: savedCampaign._id,
      campaign: savedCampaign,
      message: 'Demo campaign created successfully!' 
    });
  } catch (error) {
    console.error('Error creating demo campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create demo campaign' },
      { status: 500 }
    );
  }
}