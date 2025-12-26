// app/campaign/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Monitor } from 'lucide-react';
import CampaignSetup from '@/components/CampaignSetup/CampaignSetup';
import Header from '@/components/Header/Header';

export default function CampaignPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setCheckingAuth(false);
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Checking authentication
  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Đang kiểm tra xác thực...</p>
        </div>
      </main>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            {/* Animated Icon */}
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="text-6xl relative z-10">🎯</div>
            </div>
            
            {/* Heading */}
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              🔐 Đăng Nhập Để Tạo Chiến Dịch
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 text-lg mb-2">Thiết lập vòng quay may mắn cho sự kiện của bạn</p>
            <p className="text-gray-500 text-base mb-8">Quản lý phần thưởng, kịch bản và quay thưởng trực tiếp</p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/auth/login')}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                🔑 Đăng Nhập Ngay
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="px-8 py-3.5 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-bold text-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                📝 Tạo Tài Khoản
              </button>
            </div>
            
            {/* Features List */}
            <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                ✨ Tạo chiến dịch, tùy chỉnh phần thưởng, quản lý thống kê
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated - Show campaign setup
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <CampaignSetup />
    </main>
  );
}