'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async (identifier: string, password: string, testName: string) => {
    addResult(`🧪 Testing ${testName}...`);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        addResult(`✅ ${testName} SUCCESS: ${data.message}`);
        addResult(`   User: ${data.user.name} (${data.user.email})`);
        addResult(`   Tier: ${data.user.tier}`);
      } else {
        addResult(`❌ ${testName} FAILED: ${data.error}`);
      }
    } catch (error) {
      addResult(`💥 ${testName} ERROR: ${error}`);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    // Test with different identifier types
    await testLogin('admin@test.com', 'admin123', 'Email Login');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLogin('admin', 'admin123', 'Username Login');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLogin('0123456789', 'admin123', 'Phone Login');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLogin('invalid@email.com', 'wrongpass', 'Invalid Login Test');
    
    setIsLoading(false);
  };

  const createTestUser = async () => {
    addResult('🔧 Creating test user...');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'test123',
          confirmPassword: 'test123'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addResult(`✅ Test user created: ${data.user.username}`);
        addResult(`   Email: ${data.user.email}`);
        addResult(`   ID: ${data.user.id}`);
      } else {
        addResult(`❌ Failed to create test user: ${data.error}`);
      }
    } catch (error) {
      addResult(`💥 Error creating test user: ${error}`);
    }
  };

  const testFlexibleLogin = async () => {
    setIsLoading(true);
    
    // Test login with the created user
    await testLogin('testuser', 'test123', 'New User - Username Login');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLogin('testuser@temp.local', 'test123', 'New User - Email Login');
    
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Login System Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test Controls</h2>
        <button 
          onClick={createTestUser}
          disabled={isLoading}
          style={{ 
            margin: '5px', 
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Create Test User
        </button>
        
        <button 
          onClick={testFlexibleLogin}
          disabled={isLoading}
          style={{ 
            margin: '5px', 
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Flexible Login
        </button>
        
        <button 
          onClick={runAllTests}
          disabled={isLoading}
          style={{ 
            margin: '5px', 
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Testing...' : 'Run All Tests'}
        </button>
        
        <button 
          onClick={() => setResults([])}
          style={{ 
            margin: '5px', 
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Test Results</h3>
        <div style={{ 
          height: '400px', 
          overflowY: 'auto', 
          backgroundColor: 'white', 
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          {results.length === 0 ? (
            <div style={{ color: '#6c757d' }}>No test results yet. Click a test button to start.</div>
          ) : (
            results.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <h4>Test Information:</h4>
        <ul>
          <li>✅ <strong>Email Login:</strong> Login using email address</li>
          <li>✅ <strong>Username Login:</strong> Login using username only</li>
          <li>✅ <strong>Phone Login:</strong> Login using phone number</li>
          <li>❌ <strong>Invalid Login:</strong> Test error handling</li>
        </ul>
        
        <p><strong>New User Flow:</strong></p>
        <ol>
          <li>Create test user with username only</li>
          <li>System auto-generates temporary email (username@temp.local)</li>
          <li>Test login with both username and temporary email</li>
        </ol>
      </div>
    </div>
  );
}