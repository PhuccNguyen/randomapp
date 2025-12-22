'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Sparkles, Zap, Palette, BarChart3, Users, Building2, Award, ArrowRight, Check } from 'lucide-react';
import Header from '@/components/Header/Header';
import HeroSection from '@/components/HeroSection/HeroSection';
import styles from './page.module.css';

interface UserData {
  id: string;
  name: string;
  email: string;
  tier: string;
}

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  tier?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const { data: session } = useSession();

  // Check authentication status
  useEffect(() => {
    // Check NextAuth session first
    if (session?.user) {
      const sessionUser = session.user as ExtendedUser;
      setUser({
        id: sessionUser.id || '',
        name: sessionUser.name || '',
        email: sessionUser.email || '',
        tier: sessionUser.tier || 'PERSONAL'
      });
      return;
    }

    // Check localStorage as fallback
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, [session]);

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        {/* HERO SECTION - SEPARATED FOR ADVANCED FEATURES */}
        <HeroSection user={user} />
        
        {!user && (
          <>
            
            {/* FEATURES SECTION - ONLY FOR GUESTS */}
            <section className={styles.features}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Tính Năng Vượt Trội</h2>
                <p className={styles.sectionDescription}>
                  Công nghệ hiện đại, trải nghiệm hoàn hảo
                </p>
              </div>
              
              <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Sparkles size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>Director Mode</h3>
                  <p className={styles.featureDescription}>
                    Kiểm soát 100% kết quả theo kịch bản được sắp đặt trước. 
                    Phù hợp cho sự kiện Hoa Hậu, Gameshow.
                  </p>
                  <ul className={styles.featureList}>
                    <li><Check size={16} /> Sắp đặt kết quả từng lượt</li>
                    <li><Check size={16} /> Override khẩn cấp</li>
                    <li><Check size={16} /> Lưu kịch bản chi tiết</li>
                  </ul>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Zap size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>Real-time Control</h3>
                  <p className={styles.featureDescription}>
                    Điều khiển từ xa qua điện thoại/tablet với độ trễ {'<'}0.1s. 
                    Đồng bộ hoàn hảo với màn hình LED.
                  </p>
                  <ul className={styles.featureList}>
                    <li><Check size={16} /> Socket.io Real-time</li>
                    <li><Check size={16} /> Multi-device Sync</li>
                    <li><Check size={16} /> Zero lag guarantee</li>
                  </ul>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Palette size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>Brand Customization</h3>
                  <p className={styles.featureDescription}>
                    Tùy biến màu sắc, logo, âm thanh 100%. 
                    Tạo trải nghiệm thương hiệu độc nhất.
                  </p>
                  <ul className={styles.featureList}>
                    <li><Check size={16} /> Upload Logo riêng</li>
                    <li><Check size={16} /> Custom Color Palette</li>
                    <li><Check size={16} /> Background Music</li>
                  </ul>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <BarChart3 size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>Adaptive Display</h3>
                  <p className={styles.featureDescription}>
                    Tự động chuyển đổi giữa Wheel/Reel dựa trên số lượng. 
                    Hỗ trợ từ 2 đến 10,000+ phần tử.
                  </p>
                  <ul className={styles.featureList}>
                    <li><Check size={16} /> Classic Wheel (≤24)</li>
                    <li><Check size={16} /> Digital Reel ({'>'}24)</li>
                    <li><Check size={16} /> Auto-switch Smart</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* USE CASES SECTION - ONLY FOR GUESTS */}
            <section className={styles.useCases}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Phù Hợp Mọi Đối Tượng</h2>
                <p className={styles.sectionDescription}>
                  Từ cá nhân đến doanh nghiệp, sự kiện lớn
                </p>
              </div>
              
              <div className={styles.useCaseGrid}>
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}>
                    <Users size={40} />
                  </div>
                  <h3 className={styles.useCaseTitle}>Cá Nhân</h3>
                  <p className={styles.useCaseDescription}>
                    Quay vui, chọn món ăn, Truth or Dare, minigame bạn bè
                  </p>
                  <div className={styles.useCasePrice}>Miễn Phí</div>
                </div>
                
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}>
                    <Building2 size={40} />
                  </div>
                  <h3 className={styles.useCaseTitle}>Doanh Nghiệp</h3>
                  <p className={styles.useCaseDescription}>
                    Quay thưởng nhân viên, team building, sự kiện công ty
                  </p>
                  <div className={styles.useCasePrice}>$19/tháng</div>
                </div>
                
                <div className={`${styles.useCaseCard} ${styles.featured}`}>
                  <div className={styles.featuredBadge}>Ưu Tiên</div>
                  <div className={styles.useCaseIcon}>
                    <Award size={40} />
                  </div>
                  <h3 className={styles.useCaseTitle}>Sự Kiện Lớn</h3>
                  <p className={styles.useCaseDescription}>
                    Hoa Hậu, Gameshow, Lễ trao giải với Director Mode
                  </p>
                  <div className={styles.useCasePrice}>Custom</div>
                </div>
              </div>
            </section>
            
            {/* CTA SECTION - ONLY FOR GUESTS */}
            <section className={styles.ctaSection}>
              <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>
                  Sẵn Sàng Tạo Sự Kiện Đầu Tiên?
                </h2>
                <p className={styles.ctaDescription}>
                  Bắt đầu miễn phí, không cần thẻ tín dụng
                </p>
                <Link href="/campaign" className={styles.ctaButton}>
                  <Sparkles size={20} />
                  Tạo Chiến Dịch Ngay
                  <ArrowRight size={18} />
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
      
      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerGrid}>
            {/* Brand Column */}
            <div className={styles.footerBrandSection}>
              <h3 className={styles.footerProductName}>TINGRANDOM</h3>
              <p className={styles.footerTagline}>Nền Tảng Quay Số Trực Tiếp Chuyên Nghiệp</p>
              <p className={styles.footerSubtagline}>The Digital Stage Director Platform</p>
              
              <div className={styles.footerSocial}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links Column */}
            <div className={styles.footerLinksColumn}>
              <h4 className={styles.footerColumnTitle}>Sản Phẩm</h4>
              <ul className={styles.footerLinksList}>
                <li><Link href="/campaign">Tạo Chiến Dịch</Link></li>
                <li><Link href="/display">Xem Trực Tiếp</Link></li>
                <li><Link href="/control">Điều Khiển</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            
            {/* Resources Column */}
            <div className={styles.footerLinksColumn}>
              <h4 className={styles.footerColumnTitle}>Tài Nguyên</h4>
              <ul className={styles.footerLinksList}>
                <li><Link href="/pricing">Bảng Giá</Link></li>
                <li><Link href="/docs">Tài Liệu</Link></li>
                <li><Link href="/api">API</Link></li>
                <li><Link href="/support">Hỗ Trợ</Link></li>
              </ul>
            </div>
            
            {/* Company Column */}
            <div className={styles.footerLinksColumn}>
              <h4 className={styles.footerColumnTitle}>Công Ty</h4>
              <ul className={styles.footerLinksList}>
                <li><Link href="/about">Giới Thiệu</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Liên Hệ</Link></li>
                <li><Link href="/careers">Tuyển Dụng</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            <div className={styles.footerEcosystem}>
              <div className={styles.ecosystemBadge}>
                <Image 
                  src="/images/logo/tingnect-logo.png"
                  alt="Tingnect"
                  width={80}
                  height={26}
                  className={styles.ecosystemLogo}
                />
                <span className={styles.ecosystemLabel}>Hệ Sinh Thái</span>
              </div>
              
              <span className={styles.ecosystemDivider}>×</span>
              
              <div className={styles.developedByBadge}>
                <span className={styles.developedLabel}>Phát Triển Bởi</span>
                <Image 
                  src="/images/logo/trustlabs-logos.png"
                  alt="TrustLabs"
                  width={100}
                  height={32}
                  className={styles.trustLabsLogo}
                />
              </div>
            </div>
            
            <div className={styles.footerCopyright}>
              <p>© 2025 TingRandom. All rights reserved.</p>
              <div className={styles.footerLegal}>
                <Link href="/privacy">Chính Sách Bảo Mật</Link>
                <span className={styles.legalDivider}>•</span>
                <Link href="/terms">Điều Khoản Sử Dụng</Link>
                <span className={styles.legalDivider}>•</span>
                <Link href="/cookies">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
