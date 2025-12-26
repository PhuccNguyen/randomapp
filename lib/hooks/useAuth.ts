import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  tier: string;
  provider?: string;
  profileComplete?: boolean;
}

/**
 * Hook để quản lý session và user auth state
 * Hỗ trợ cả NextAuth session và custom JWT token
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Priority 1: Check NextAuth session
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: (session.user as any).id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image,
        tier: (session.user as any).tier || 'PERSONAL',
        provider: (session.user as any).provider || 'email',
        profileComplete: (session.user as any).profileComplete
      });
      setIsLoading(false);
      return;
    }

    // Priority 2: Check localStorage (custom JWT)
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          image: userData.image,
          tier: userData.tier || 'PERSONAL',
          provider: userData.provider || 'email',
          profileComplete: userData.profileComplete
        });
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        setError('Invalid user data');
      }
    }

    setIsLoading(false);
  }, [session, status]);

  const isAuthenticated = status === 'authenticated' || (!!user && status !== 'unauthenticated');

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || status === 'loading',
    status
  };
}

/**
 * Hook để refresh user profile từ server
 */
export function useRefreshProfile() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh profile');
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userChanged'));
        return data.user;
      }
    } catch (err: any) {
      console.error('Profile refresh error:', err);
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refresh, isRefreshing, error };
}

/**
 * Hook để logout
 */
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('userChanged'));
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
}
