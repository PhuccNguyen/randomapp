/**
 * Google OAuth Setup Guide for random.tingnect.com
 * 
 * Domain: random.tingnect.com
 * Callback URLs needed:
 * - https://random.tingnect.com/api/auth/callback/google
 * - http://localhost:3000/api/auth/callback/google (for development)
 */

console.log('🔧 Google OAuth Setup Guide');
console.log('Domain: random.tingnect.com');
console.log('');
console.log('📋 Steps to complete:');
console.log('');
console.log('1. Go to Google Cloud Console:');
console.log('   https://console.cloud.google.com/');
console.log('');
console.log('2. Create/Select Project: TingRandom');
console.log('');
console.log('3. Enable APIs:');
console.log('   - Google+ API or Google Identity');
console.log('');
console.log('4. Create OAuth 2.0 Client:');
console.log('   - Type: Web application');
console.log('   - Name: TingRandom OAuth');
console.log('');
console.log('5. Add Authorized redirect URIs:');
console.log('   ✅ https://random.tingnect.com/api/auth/callback/google');
console.log('   ✅ http://localhost:3000/api/auth/callback/google');
console.log('');
console.log('6. Copy credentials to .env.local:');
console.log('   GOOGLE_CLIENT_ID=your-actual-client-id');
console.log('   GOOGLE_CLIENT_SECRET=your-actual-client-secret');
console.log('');
console.log('🚀 Current status:');
console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
console.log(`   API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
console.log(`   Google OAuth: ${process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED}`);
console.log('');
console.log('💡 Test URLs:');
console.log('   - Production: https://random.tingnect.com/auth/register');
console.log('   - Development: http://localhost:3000/auth/register');