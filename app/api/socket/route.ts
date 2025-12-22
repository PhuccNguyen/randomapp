import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Bắt buộc Next.js không cache route này

export async function GET() {
  // Service Discovery: Thông báo cho Client biết Socket thực sự nằm ở đâu
  return NextResponse.json({
    status: 'healthy',
    service: 'Socket.IO Gateway',
    mode: 'Standalone Backend',
    upstream: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    message: 'Socket connection should be established directly to the Backend Server (Port 3001).'
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Socket.IO endpoint is active (handled by external server).'
  });
}

// Xử lý CORS Preflight nếu cần thiết
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}