'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestCampaignPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleUpdateTier = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/debug/update-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user?.email || 'test@example.com', 
          tier: 'ENTERPRISE' 
        })
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        // Update local storage
        const updatedUser = { ...user, tier: 'ENTERPRISE' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error: any) {
      setResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestCampaign = async () => {
    setLoading(true);
    setResult('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setResult('Error: Please login first');
      setLoading(false);
      return;
    }
    
    const payload = {
      name: 'Test Campaign ' + new Date().getTime(),
      description: 'This is a test campaign',
      mode: 'wheel',
      displayMode: 'random',
      isPublic: false,
      items: [
        { id: '1', name: 'Giám khảo 1', hasQuestion: true, color: '#FF6B6B' },
        { id: '2', name: 'Giám khảo 2', hasQuestion: true, color: '#4ECDC4' },
        { id: '3', name: 'Giám khảo 3', hasQuestion: true, color: '#45B7D1' }
      ],
      director_script: [],
      settings: {
        spinDuration: 3000,
        soundEnabled: true,
        confettiEnabled: true,
        backgroundColor: '#FFFFFF',
        textColor: '#000000'
      }
    };
    
    try {
      console.log('📤 Creating campaign with payload:', payload);
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('📥 Response:', data);
      
      setResult(JSON.stringify(data, null, 2));
      
      if (response.ok && data.id) {
        setTimeout(() => {
          router.push(`/control?id=${data.id}`);
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      setResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Test Campaign Creation</h1>
      
      {/* User Info */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>User Info</h2>
        {user ? (
          <div>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Tier:</strong> <span style={{ 
              color: user.tier === 'ENTERPRISE' ? 'green' : 'red',
              fontWeight: 'bold'
            }}>{user.tier}</span></p>
            {user.tier !== 'ENTERPRISE' && (
              <p style={{ color: 'red' }}>⚠️ Bạn cần tier ENTERPRISE để tạo campaign!</p>
            )}
          </div>
        ) : (
          <div>
            <p style={{ color: 'red' }}>❌ Chưa đăng nhập</p>
            <button 
              onClick={() => router.push('/auth/login')}
              style={{
                padding: '10px 20px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      {user && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleUpdateTier}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px',
              opacity: loading ? 0.6 : 1
            }}
          >
            1. Update to ENTERPRISE
          </button>
          
          <button
            onClick={handleCreateTestCampaign}
            disabled={loading || user.tier !== 'ENTERPRISE'}
            style={{
              padding: '10px 20px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: (loading || user.tier !== 'ENTERPRISE') ? 'not-allowed' : 'pointer',
              opacity: (loading || user.tier !== 'ENTERPRISE') ? 0.6 : 1
            }}
          >
            2. Create Test Campaign
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          background: result.includes('Error') || result.includes('error') ? '#fee' : '#efe',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3>Result:</h3>
          <pre style={{ 
            overflow: 'auto', 
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}>{result}</pre>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '40px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>📝 Hướng dẫn:</h3>
        <ol>
          <li>Đăng nhập với <code>test@example.com</code> / <code>123456</code></li>
          <li>Click "Update to ENTERPRISE" để nâng cấp tier</li>
          <li>Click "Create Test Campaign" để tạo campaign test</li>
          <li>Kiểm tra browser console để xem logs chi tiết</li>
        </ol>
      </div>
    </div>
  );
}