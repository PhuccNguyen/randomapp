import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  tier: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn: JWT_EXPIRES_IN } as any);
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET as any) as JWTPayload;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  static extractTokenFromRequest(request: NextRequest): string | null {
    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookie
    const tokenCookie = request.cookies.get('auth-token');
    if (tokenCookie) {
      return tokenCookie.value;
    }

    return null;
  }

  static generateEmailVerificationToken(): string {
    return jwt.sign({ type: 'email_verification' } as any, JWT_SECRET as any, { expiresIn: '24h' } as any);
  }

  static generatePasswordResetToken(userId: string): string {
    return jwt.sign({ userId, type: 'password_reset' } as any, JWT_SECRET as any, { expiresIn: '1h' } as any);
  }

  static verifyEmailToken(token: string): Record<string, unknown> {
    try {
      return jwt.verify(token, JWT_SECRET as any) as Record<string, unknown>;
    } catch {
      throw new Error('Invalid or expired verification token');
    }
  }
}

export default AuthService;