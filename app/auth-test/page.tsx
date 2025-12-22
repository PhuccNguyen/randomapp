'use client';

import { useEffect, useState } from 'react';
import { User, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header/Header';
import styles from './auth-test.module.css';

interface UserData {
  id: string;
  name: string;
  email: string;
  tier: string;
}

export default function AuthTestPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock authentication states for testing
  const [mockAuthState, setMockAuthState] = useState<'guest' | 'personal' | 'business' | 'enterprise'>('guest');

  useEffect(() => {
    // Check real auth status
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      setToken(storedToken);
      if (storedToken && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const simulateLogin = (tier: 'personal' | 'business' | 'enterprise') => {
    const mockUser = {
      id: 'test-123',
      name: 'Test User',
      email: 'test@example.com',
      tier: tier.toUpperCase()
    };
    
    const mockToken = 'mock-jwt-token';
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    setUser(mockUser);
    setToken(mockToken);
    setMockAuthState(tier);
  };

  const simulateLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setUser(null);
    setToken(null);
    setMockAuthState('guest');
  };

  const getFeatureAccess = () => {
    if (!user) {
      return {
        canAccessCampaigns: false,
        canAccessDisplay: false,
        canAccessControl: false,
        canAccessDashboard: false,
        visibleFeatures: ['Cá nhân (quay vui)'],
        hiddenFeatures: ['Chiến Dịch', 'Màn Hình', 'Điều Khiển', 'Dashboard']
      };
    }

    return {
      canAccessCampaigns: true,
      canAccessDisplay: true,
      canAccessControl: true,
      canAccessDashboard: true,
      visibleFeatures: ['Cá nhân (quay vui)', 'Chiến Dịch', 'Màn Hình', 'Điều Khiển', 'Dashboard'],
      hiddenFeatures: []
    };
  };

  const access = getFeatureAccess();

  if (loading) {
    return <div className={styles.loading}>Checking authentication...</div>;
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>🔐 Test Authentication Logic</h1>
            <p>Kiểm tra logic hiển thị tính năng dựa trên trạng thái đăng nhập</p>
          </div>

          <div className={styles.grid}>
            {/* Current Status */}
            <div className={styles.card}>
              <h2>📊 Trạng thái hiện tại</h2>
              
              <div className={styles.status}>
                <div className={styles.statusItem}>
                  <strong>Đăng nhập:</strong>
                  <span className={user ? styles.success : styles.error}>
                    {user ? (
                      <>
                        <Unlock size={16} />
                        Đã đăng nhập
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Chưa đăng nhập
                      </>
                    )}
                  </span>
                </div>
                
                {user && (
                  <>
                    <div className={styles.statusItem}>
                      <strong>User:</strong>
                      <span>{user.name} ({user.email})</span>
                    </div>
                    <div className={styles.statusItem}>
                      <strong>Tier:</strong>
                      <span className={styles.tier}>{user.tier}</span>
                    </div>
                  </>
                )}
                
                <div className={styles.statusItem}>
                  <strong>Token:</strong>
                  <span className={token ? styles.success : styles.error}>
                    {token ? 'Có' : 'Không'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Access */}
            <div className={styles.card}>
              <h2>🎯 Quyền truy cập tính năng</h2>
              
              <div className={styles.features}>
                <h3>✅ Tính năng hiển thị:</h3>
                <ul className={styles.featureList}>
                  {access.visibleFeatures.map((feature, index) => (
                    <li key={index} className={styles.visibleFeature}>
                      <Eye size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {access.hiddenFeatures.length > 0 && (
                  <>
                    <h3>❌ Tính năng ẩn:</h3>
                    <ul className={styles.featureList}>
                      {access.hiddenFeatures.map((feature, index) => (
                        <li key={index} className={styles.hiddenFeature}>
                          <EyeOff size={16} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Test Controls */}
            <div className={styles.card}>
              <h2>🧪 Test Controls</h2>
              
              <div className={styles.testControls}>
                <h3>Giả lập trạng thái:</h3>
                
                <button 
                  onClick={() => simulateLogout()}
                  className={`${styles.testButton} ${!user ? styles.active : ''}`}
                >
                  <User size={16} />
                  Guest (Chưa đăng nhập)
                </button>
                
                <button 
                  onClick={() => simulateLogin('personal')}
                  className={`${styles.testButton} ${user?.tier === 'PERSONAL' ? styles.active : ''}`}
                >
                  <User size={16} />
                  Personal User
                </button>
                
                <button 
                  onClick={() => simulateLogin('business')}
                  className={`${styles.testButton} ${user?.tier === 'BUSINESS' ? styles.active : ''}`}
                >
                  <User size={16} />
                  Business User  
                </button>
                
                <button 
                  onClick={() => simulateLogin('enterprise')}
                  className={`${styles.testButton} ${user?.tier === 'ENTERPRISE' ? styles.active : ''}`}
                >
                  <User size={16} />
                  Enterprise User
                </button>
              </div>
            </div>

            {/* Header Logic Test */}
            <div className={styles.card}>
              <h2>📋 Header Logic Test</h2>
              
              <div className={styles.headerTest}>
                <h3>Trạng thái Header hiện tại:</h3>
                
                <div className={styles.mockHeader}>
                  <div className={styles.mockLogo}>🎲 TingRandom</div>
                  
                  <div className={styles.mockNav}>
                    {user ? (
                      // Logged in: Show all nav
                      <>
                        <span className={styles.mockNavItem}>Chiến Dịch</span>
                        <span className={styles.mockNavItem}>Màn Hình</span>
                        <span className={styles.mockNavItem}>Điều Khiển</span>
                      </>
                    ) : (
                      // Not logged in: Only show Personal
                      <span className={styles.mockNavItem}>Cá nhân (quay vui)</span>
                    )}
                  </div>
                  
                  <div className={styles.mockActions}>
                    {user ? (
                      <span className={styles.mockUser}>
                        👤 {user.name} ({user.tier})
                      </span>
                    ) : (
                      <>
                        <span className={styles.mockBtn}>Đăng Nhập</span>
                        <span className={styles.mockBtnPrimary}>⭐ Nâng Cấp</span>
                      </>
                    )}
                  </div>
                </div>
                
                <p className={styles.explanation}>
                  {user 
                    ? "✅ User đã đăng nhập → Hiện tất cả navigation và user info"
                    : "❌ User chưa đăng nhập → Chỉ hiện 'Cá nhân (quay vui)' + buttons đăng nhập"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}