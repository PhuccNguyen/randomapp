import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';

// Middleware để kiểm tra authentication
export async function authMiddleware(request: NextRequest) {
  try {
    const token = AuthService.extractTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Token required' },
        { status: 401 }
      );
    }

    const payload = AuthService.verifyToken(token);
    
    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-tier', payload.tier);

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });

  } catch {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid token' },
      { status: 401 }
    );
  }
}

// Helper function to extract user from request headers (for use in API routes)
export function getUserFromRequest(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id'),
    email: request.headers.get('x-user-email'),
    tier: request.headers.get('x-user-tier')
  };
}

// Helper to check if user can access certain features based on tier
export function checkTierAccess(userTier: string, requiredTier: string): boolean {
  const tierLevels = {
    'PERSONAL': 1,
    'BUSINESS': 2,
    'ENTERPRISE': 3
  };
  
  return (tierLevels[userTier as keyof typeof tierLevels] || 0) >= 
         (tierLevels[requiredTier as keyof typeof tierLevels] || 0);
}

export default authMiddleware;