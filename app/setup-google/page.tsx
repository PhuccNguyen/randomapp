'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, AlertCircle, Settings } from 'lucide-react';
import Header from '@/components/Header/Header';
import styles from './setup.module.css';

export default function GoogleOAuthSetupPage() {
  const [copiedSteps, setCopiedSteps] = useState<{ [key: string]: boolean }>({});
  
  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSteps({ ...copiedSteps, [stepId]: true });
    setTimeout(() => {
      setCopiedSteps({ ...copiedSteps, [stepId]: false });
    }, 2000);
  };

  const redirectUri = 'http://localhost:3000/api/auth/callback/google';
  
  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.icon}>
              <Settings size={32} />
            </div>
            <h1>🔑 Setup Google OAuth</h1>
            <p>Hướng dẫn từng bước để kích hoạt đăng nhập Google</p>
          </div>

          <div className={styles.steps}>
            {/* Step 1 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Tạo Google Cloud Project</h3>
                <p>Vào Google Cloud Console và tạo project mới</p>
                <a 
                  href="https://console.cloud.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <ExternalLink size={16} />
                  Mở Google Cloud Console
                </a>
                
                <div className={styles.substeps}>
                  <div className={styles.substep}>• Click "Select a project" → "New Project"</div>
                  <div className={styles.substep}>• Đặt tên: <code>TingRandom</code></div>
                  <div className={styles.substep}>• Click "Create"</div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Enable Google+ API</h3>
                <p>Kích hoạt APIs cần thiết cho OAuth</p>
                
                <div className={styles.substeps}>
                  <div className={styles.substep}>• Vào "APIs & Services" → "Library"</div>
                  <div className={styles.substep}>• Tìm "Google+ API"</div>
                  <div className={styles.substep}>• Click "Enable"</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Tạo OAuth 2.0 Credentials</h3>
                <p>Tạo Client ID và Secret</p>
                
                <div className={styles.substeps}>
                  <div className={styles.substep}>• Vào "APIs & Services" → "Credentials"</div>
                  <div className={styles.substep}>• Click "Create Credentials" → "OAuth 2.0 Client IDs"</div>
                  <div className={styles.substep}>• Application type: "Web application"</div>
                  <div className={styles.substep}>• Name: <code>TingRandom OAuth</code></div>
                </div>

                <div className={styles.important}>
                  <AlertCircle size={20} />
                  <div>
                    <strong>Authorized redirect URIs:</strong>
                    <div className={styles.copyBox}>
                      <code>{redirectUri}</code>
                      <button 
                        onClick={() => copyToClipboard(redirectUri, 'redirect')}
                        className={styles.copyButton}
                      >
                        {copiedSteps.redirect ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Copy Credentials</h3>
                <p>Lấy Client ID và Client Secret</p>
                
                <div className={styles.warning}>
                  <AlertCircle size={20} />
                  Sau khi tạo OAuth client, bạn sẽ thấy popup với credentials
                </div>

                <div className={styles.credentials}>
                  <div className={styles.credentialItem}>
                    <label>Client ID:</label>
                    <div className={styles.placeholder}>123456789-abc123def456.googleusercontent.com</div>
                  </div>
                  
                  <div className={styles.credentialItem}>
                    <label>Client Secret:</label>
                    <div className={styles.placeholder}>GOCSPX-abc123def456ghi789</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Cập nhật Environment Variables</h3>
                <p>Thay thế credentials trong file <code>.env.local</code></p>
                
                <div className={styles.envFile}>
                  <div className={styles.envHeader}>
                    <span>.env.local</span>
                    <button 
                      onClick={() => copyToClipboard(
                        'GOOGLE_CLIENT_ID=your-actual-client-id-here\nGOOGLE_CLIENT_SECRET=your-actual-client-secret-here', 
                        'env'
                      )}
                      className={styles.copyButton}
                    >
                      {copiedSteps.env ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <pre className={styles.envContent}>
{`GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Restart Server</h3>
                <p>Khởi động lại development server</p>
                
                <div className={styles.command}>
                  <code>npm run dev</code>
                  <button 
                    onClick={() => copyToClipboard('npm run dev', 'command')}
                    className={styles.copyButton}
                  >
                    {copiedSteps.command ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test Section */}
          <div className={styles.testSection}>
            <h2>🧪 Test Google OAuth</h2>
            <p>Sau khi setup xong, test tại:</p>
            
            <div className={styles.testLinks}>
              <a href="/auth/login" className={styles.testButton}>
                Test Login
              </a>
              <a href="/auth/register" className={styles.testButton}>
                Test Register
              </a>
            </div>
          </div>

          {/* Current Status */}
          <div className={styles.statusSection}>
            <h3>📊 Trạng thái hiện tại:</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span>Google OAuth:</span>
                <span className={styles.statusEnabled}>
                  {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}