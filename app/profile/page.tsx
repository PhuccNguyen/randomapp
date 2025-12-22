// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header/Header';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import SecuritySection from './components/SecuritySection';
import TierSection from './components/TierSection';
import ActivitySection from './components/ActivitySection';
import styles from './page.module.css';

interface UserData {
  id: string;
  username?: string;
  name: string;
  email: string;
  tier: string;
  avatar?: string;
  createdAt?: string;
  phone?: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
  campaignsCount?: number;
  lastLoginAt?: string;
}

type TabType = 'personal' | 'security' | 'tier' | 'activity';

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check NextAuth session first
        if (session?.user) {
          const userData: UserData = {
            id: session.user.id || '',
            name: session.user.name || '',
            email: session.user.email || '',
            tier: (session.user as any)?.tier || 'PERSONAL',
            avatar: session.user.image,
            createdAt: (session.user as any)?.createdAt
          };
          setUser(userData);
          setLoading(false);
          return;
        }

        // Check localStorage for custom auth
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!storedUser || !token) {
          router.push('/auth/login?returnTo=/profile');
          return;
        }

        // Fetch full profile from API
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        setUser(data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ' });
        
        // Fallback to localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            router.push('/auth/login');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchUserProfile();
    }
  }, [session, status, router]);

  const handleUpdateProfile = async (updates: Partial<UserData>) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(prev => prev ? { ...prev, ...data.user } : null);
      
      // Update localStorage
      if (!session) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...data.user }));
        window.dispatchEvent(new Event('userChanged'));
      }

      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Cập nhật thất bại' });
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        {/* Message Alert */}
        {message && (
          <div className={`${styles.alert} ${styles[message.type]}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Layout */}
        <div className={styles.profileLayout}>
          {/* Left Sidebar - Profile Header & Navigation */}
          <aside className={styles.sidebar}>
            <ProfileHeader user={user} />
            
            <nav className={styles.tabNav}>
              <button
                className={`${styles.tabButton} ${activeTab === 'personal' ? styles.active : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                👤 Thông tin cá nhân
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
                onClick={() => setActiveTab('security')}
              >
                🔒 Bảo mật
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'tier' ? styles.active : ''}`}
                onClick={() => setActiveTab('tier')}
              >
                👑 Gói dịch vụ
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'activity' ? styles.active : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                📊 Hoạt động
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className={styles.contentArea}>
            {activeTab === 'personal' && (
              <PersonalInfoSection 
                user={user} 
                onUpdate={handleUpdateProfile}
              />
            )}
            
            {activeTab === 'security' && (
              <SecuritySection 
                user={user}
                onUpdate={handleUpdateProfile}
              />
            )}
            
            {activeTab === 'tier' && (
              <TierSection user={user} />
            )}
            
            {activeTab === 'activity' && (
              <ActivitySection user={user} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
