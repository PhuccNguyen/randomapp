// app/campaign/page.tsx
import { Metadata } from 'next';
import CampaignSetup from '@/components/CampaignSetup/CampaignSetup';
import Header from '@/components/Header/Header';

// Growth Hacking: Cấu hình SEO chuẩn chỉnh
export const metadata: Metadata = {
  title: 'Tạo Chiến Dịch | TingRandom Enterprise',
  description: 'Thiết lập chiến dịch quay thưởng chuyên nghiệp, quản lý giải thưởng và kịch bản sự kiện với TingRandom.',
  openGraph: {
    title: 'Tạo Chiến Dịch - TingRandom',
    description: 'Công cụ tổ chức sự kiện quay số ngẫu nhiên chuyên nghiệp.',
  }
};

export default function CampaignPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header điều hướng chung */}
      <Header />
      
      {/* Component chính: Form thiết lập chiến dịch */}
      <CampaignSetup />
    </main>
  );
}