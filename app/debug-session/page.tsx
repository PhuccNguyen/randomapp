'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionDebugPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('=== SESSION DEBUG ===');
    console.log('Status:', status);
    console.log('Session:', session);
    console.log('User:', session?.user);
    console.log('===================');
  }, [session, status]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🔍 Session Debug</h1>
      
      <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h3>Status: {status}</h3>
      </div>
      
      {session ? (
        <div style={{ background: '#e6f7ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>✅ Logged In</h3>
          <pre>{JSON.stringify(session, null, 2)}</pre>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ 
              background: '#ff4d4f', 
              color: 'white', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px',
              marginTop: '1rem',
              cursor: 'pointer'
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff2e8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>❌ Not Logged In</h3>
          <p>Status: {status}</p>
        </div>
      )}
      
      <div style={{ background: '#f6ffed', padding: '1rem', borderRadius: '8px' }}>
        <h3>🧪 Test Actions</h3>
        <a href="/auth/login" style={{ 
          display: 'inline-block', 
          background: '#1890ff', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px', 
          textDecoration: 'none',
          marginRight: '0.5rem'
        }}>
          Login Page
        </a>
        <a href="/auth/register" style={{ 
          display: 'inline-block', 
          background: '#52c41a', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px', 
          textDecoration: 'none'
        }}>
          Register Page
        </a>
      </div>
    </div>
  );
}