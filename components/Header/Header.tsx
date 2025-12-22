// components/Header/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, X, Sparkles, Monitor, Gamepad2, Settings, 
  User, LogOut, Crown, Zap, ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styles from './Header.module.css';

interface UserData {
  id: string;
  username?: string;
  name: string;
  email: string;
  tier: string;
  avatar?: string;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [localUser, setLocalUser] = useState<UserData | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Check localStorage for user data (for custom auth)
  useEffect(() => {
    const checkLocalUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setLocalUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          setLocalUser(null);
        }
      } else {
        setLocalUser(null);
      }
    };

    checkLocalUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        checkLocalUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const handleUserChange = () => checkLocalUser();
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);
  
  const user: UserData | null = session ? {
    id: session.user?.id || '',
    name: session.user?.name || '',
    email: session.user?.email || '',
    tier: (session.user as any)?.tier || 'PERSONAL',
    avatar: session.user?.image
  } : localUser;

  const handleLogout = async () => {
    try {
      if (session) {
        await signOut({ redirect: false });
      }
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setLocalUser(null);
      
      window.dispatchEvent(new Event('userChanged'));
      
      setShowUserMenu(false);
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    setMobileMenuOpen(false);
    router.push('/auth/login');
  };

  const handleRegister = () => {
    setMobileMenuOpen(false);
    router.push('/auth/register');
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'BUSINESS': return styles.tierBusiness;
      case 'ENTERPRISE': return styles.tierEnterprise;
      default: return styles.tierPersonal;
    }
  };

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'PERSONAL': return 'Cá nhân';
      case 'BUSINESS': return 'Doanh nghiệp';
      case 'ENTERPRISE': return 'Sự kiện lớn';
      default: return 'Khách';
    }
  };

  // Check if user can access control page
  const canAccessControl = user?.tier === 'ENTERPRISE';

  // Check active link
  const isActive = (path: string) => pathname === path;
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <Link href="/" className={styles.logoSection}>
          <Image 
            src="/images/PreviewSeo/tingnecticon.png"
            alt="TingNect Icon"
            width={40}
            height={40}
            className={styles.logoIcon}
          />
          <div className={styles.logoText}>
            <span className={styles.brandName}>TingRandom</span>
            <span className={styles.brandTagline}>by TingNect</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          {/* 1. VÒNG QUAY - Luôn hiển thị đầu tiên */}
          <Link 
            href="/" 
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            <Sparkles size={18} />
            <span>Vòng Quay</span>
          </Link>

          {/* 2. XEM SỰ KIỆN - Public, có badge LIVE */}
          <Link 
            href="/display" 
            className={`${styles.navLink} ${isActive('/display') ? styles.active : ''}`}
          >
            <Monitor size={18} />
            <span>Xem Sự Kiện</span>
            <span className={styles.liveBadge}>LIVE</span>
          </Link>

          {/* 3. ĐIỀU KHIỂN - Chỉ Enterprise */}
          {canAccessControl && (
            <Link 
              href="/control" 
              className={`${styles.navLink} ${styles.navLinkPremium} ${isActive('/control') ? styles.active : ''}`}
            >
              <Gamepad2 size={18} />
              <span>Điều Khiển</span>
              <span className={styles.proBadge}>PRO</span>
            </Link>
          )}

          {/* 4. QUẢN LÝ - Cần login (hoặc temporary) */}
          {user && (
            <Link 
              href="/campaign" 
              className={`${styles.navLink} ${isActive('/campaign') ? styles.active : ''}`}
            >
              <Settings size={18} />
              <span>Quản Lý</span>
            </Link>
          )}
        </nav>
        
        {/* Actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.userSection}>
              <button 
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name}
                    width={32}
                    height={32}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <User size={18} />
                  </div>
                )}
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={`${styles.userTier} ${getTierBadgeClass(user.tier)}`}>
                    {getTierDisplayName(user.tier)}
                  </span>
                </div>
                <ChevronDown size={16} className={styles.chevron} />
              </button>
              
              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <Link href="/dashboard" className={styles.dropdownItem}>
                    <Settings size={16} />
                    Dashboard
                  </Link>
                  <Link href="/profile" className={styles.dropdownItem}>
                    <User size={16} />
                    Hồ sơ
                  </Link>
                  
                  {/* Upgrade CTA nếu không phải Enterprise */}
                  {user.tier !== 'ENTERPRISE' && (
                    <>
                      <div className={styles.dropdownDivider}></div>
                      <Link href="/pricing" className={`${styles.dropdownItem} ${styles.upgradeItem}`}>
                        <Crown size={16} />
                        <div>
                          <div className={styles.upgradeLabel}>Nâng cấp gói</div>
                          <div className={styles.upgradeDesc}>
                            {user.tier === 'PERSONAL' ? 'Mở khóa Business' : 'Mở khóa Enterprise'}
                          </div>
                        </div>
                      </Link>
                    </>
                  )}
                  
                  <div className={styles.dropdownDivider}></div>
                  <button 
                    onClick={handleLogout}
                    className={styles.dropdownItem}
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className={styles.btnLogin} onClick={handleLogin}>
                Đăng Nhập
              </button>
              <button className={styles.btnPrimary} onClick={handleRegister}>
                <Zap size={16} className={styles.upgradeIcon} />
                Dùng Thử Miễn Phí
              </button>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {/* Navigation Links */}
          <Link 
            href="/" 
            className={`${styles.mobileNavLink} ${isActive('/') ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles size={20} />
            <span>Vòng Quay</span>
          </Link>

          <Link 
            href="/display" 
            className={`${styles.mobileNavLink} ${isActive('/display') ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Monitor size={20} />
            <span>Xem Sự Kiện</span>
            <span className={styles.liveBadge}>LIVE</span>
          </Link>

          {canAccessControl && (
            <Link 
              href="/control" 
              className={`${styles.mobileNavLink} ${isActive('/control') ? styles.active : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Gamepad2 size={20} />
              <span>Điều Khiển</span>
              <span className={styles.proBadge}>PRO</span>
            </Link>
          )}

          {user && (
            <Link 
              href="/campaign" 
              className={`${styles.mobileNavLink} ${isActive('/campaign') ? styles.active : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings size={20} />
              Quản Lý
            </Link>
          )}

          <div className={styles.mobileDivider}></div>

          {/* User Info or Auth Buttons */}
          {user ? (
            <>
              <div className={styles.mobileUserInfo}>
                <div className={styles.mobileAvatar}>
                  {user.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name}
                      width={40}
                      height={40}
                      className={styles.avatar}
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div>
                  <div className={styles.mobileUserName}>{user.name}</div>
                  <div className={`${styles.mobileUserTier} ${getTierBadgeClass(user.tier)}`}>
                    {getTierDisplayName(user.tier)}
                  </div>
                </div>
              </div>

              <Link 
                href="/dashboard" 
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings size={20} />
                Dashboard
              </Link>

              <Link 
                href="/profile" 
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={20} />
                Hồ sơ
              </Link>

              {user.tier !== 'ENTERPRISE' && (
                <Link 
                  href="/pricing" 
                  className={`${styles.mobileNavLink} ${styles.upgradeLink}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Crown size={20} />
                  Nâng cấp gói
                </Link>
              )}

              <button 
                onClick={handleLogout} 
                className={styles.mobileBtn}
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button className={styles.mobileBtn} onClick={handleLogin}>
                Đăng Nhập
              </button>
              <button className={styles.mobileBtnPrimary} onClick={handleRegister}>
                <Zap size={16} />
                Dùng Thử Miễn Phí
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
