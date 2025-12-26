'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Play, Monitor, Copy, Check } from 'lucide-react';
import ControlPanel from '@/components/ControlPanel/ControlPanel';
import Header from '@/components/Header/Header';

// --- 1. TYPE DEFINITIONS (Deep Tech) ---
interface CampaignSummary {
  _id: string;
  name: string;
  mode: 'wheel' | 'reel' | 'battle' | 'mystery';
  items: any[];
  director_script?: any[];
  isActive: boolean;
  createdAt: string;
}

function ControlContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get('id');
  const { data: session, status } = useSession();
  
  // State Management
  const [campaign, setCampaign] = useState<any>(null); // Detail campaign
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]); // List
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- 2. AUTH CHECK - Redirect if not authenticated ---
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/control');
    }
  }, [status, router]);

  // --- 3. DATA FETCHING ---
  useEffect(() => {
    // Chỉ fetch khi đã xác thực
    if (status !== 'authenticated') return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      try {
        if (!campaignId) {
          // A. Load List Campaigns
          const res = await fetch('/api/campaigns', { headers });
          if (!res.ok) throw new Error('Failed to fetch campaigns');
          
          const data = await res.json();
          if (data.success && Array.isArray(data.campaigns)) {
            setCampaigns(data.campaigns);
          }
        } else {
          // B. Load Single Campaign Detail
          const res = await fetch(`/api/campaigns/${campaignId}`, { headers });
          if (res.status === 404) throw new Error('Campaign not found');
          if (!res.ok) throw new Error('Failed to fetch campaign detail');
          
          const data = await res.json();
          if (data.success && data.campaign) {
            setCampaign(data.campaign);
          } else {
            throw new Error('Invalid campaign data');
          }
        }
      } catch (err: any) {
        console.error('Data Error:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId, status]);

  // --- 4. UTILITY FUNCTIONS ---
  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/display?id=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- 5. RENDER STATES ---

  // State: Authenticating
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Đang kiểm tra xác thực...</p>
      </div>
    );
  }

  // State: Not authenticated (should redirect but show just in case)
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-xl font-bold">⚠️ Bạn chưa đăng nhập</div>
        <button 
          onClick={() => router.push('/auth/login?redirect=/control')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Đăng Nhập
        </button>
      </div>
    );
  }

  // State: Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  // State: Detail View (Control Panel)
  if (campaignId && campaign) {
    return (
      <ControlPanel 
        campaignId={campaignId}
        items={campaign.items || []}
        script={campaign.director_script || []}
      />
    );
  }

  // State: Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-red-500 text-xl font-bold">⚠️ {error}</div>
        <button 
          onClick={() => router.push('/campaign')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tạo Campaign Mới
        </button>
      </div>
    );
  }

  // State: List View (Dashboard)
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Trung Tâm Điều Khiển</h1>
        <p className="text-gray-600">Chọn chiến dịch để bắt đầu vận hành sự kiện</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">Chưa có chiến dịch nào được tạo.</p>
            <button 
              onClick={() => router.push('/campaign')}
              className="text-blue-600 font-medium hover:underline"
            >
              + Tạo chiến dịch đầu tiên ngay
            </button>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div 
              key={camp._id} 
              onClick={() => router.push(`/control?id=${camp._id}`)}
              className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {camp.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${camp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {camp.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">• {camp.mode} Mode</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-sm text-gray-500 mb-6">
                <p>Số lượng: <strong>{camp.items?.length || 0}</strong> phần tử</p>
                <p>Kịch bản: <strong>{camp.director_script?.length || 0}</strong> bước</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/control?id=${camp._id}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play size={16} /> Điều Khiển
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/display?id=${camp._id}`, '_blank');
                  }}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors tooltip"
                  title="Mở màn hình hiển thị"
                >
                  <Monitor size={18} />
                </button>

                <button
                  onClick={(e) => handleCopyLink(e, camp._id)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Copy link hiển thị"
                >
                  {copiedId === camp._id ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- 5. MAIN PAGE COMPONENT ---
export default function ControlPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
        </div>
      }>
        <ControlContent />
      </Suspense>
    </div>
  );
}