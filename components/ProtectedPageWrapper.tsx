'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Lock } from 'lucide-react';

type UserTier = 'FREE' | 'PERSONAL' | 'BUSINESS' | 'ENTERPRISE';

interface ProtectedPageWrapperProps {
  children: ReactNode;
  requiredTier?: UserTier;
  requireAuth?: boolean;
}

const tierHierarchy: Record<UserTier, number> = {
  FREE: 0,
  PERSONAL: 1,
  BUSINESS: 2,
  ENTERPRISE: 3
};

export default function ProtectedPageWrapper({ 
  children, 
  requiredTier,
  requireAuth = true 
}: ProtectedPageWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Check localStorage for custom auth
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLocalUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        setLocalUser(null);
      }
    }
  }, []);

  // Check authentication and tier access
  useEffect(() => {
    const checkAccess = () => {
      // If not requiring auth, allow access
      if (!requireAuth) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Wait for session status to be determined
      if (status === 'loading') {
        return;
      }

      // Check if user is authenticated (NextAuth or localStorage)
      const isAuthenticated = status === 'authenticated' || localUser;
      
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // If no tier requirement, allow access
      if (!requiredTier) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Check tier access
      const userTier = (session?.user as any)?.tier || localUser?.tier || 'FREE';
      const userTierLevel = tierHierarchy[userTier as UserTier] || 0;
      const requiredTierLevel = tierHierarchy[requiredTier];

      if (userTierLevel >= requiredTierLevel) {
        setHasAccess(true);
      } else {
        // Redirect to pricing if tier insufficient
        router.push('/pricing');
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [status, session, localUser, requiredTier, requireAuth, router]);

  // Loading state
  if (isChecking || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Access denied state
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Lock size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-6">Bạn cần nâng cấp tài khoản để sử dụng tính năng này.</p>
        <button
          onClick={() => router.push('/pricing')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xem gói nâng cấp
        </button>
      </div>
    );
  }

  // Render children if access granted
  return <>{children}</>;
}
