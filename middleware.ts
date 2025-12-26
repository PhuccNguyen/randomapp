import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các route cần bảo vệ (Để dành cho Phase sau, hiện tại chưa dùng tới để tránh lỗi)
const protectedRoutes = [
  '/campaign',
  '/display',
  '/control',
  '/dashboard',
  '/profile',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- DEBUG MODE: BẬT ---
  // Hiện tại chúng ta cho phép mọi request đi qua để đảm bảo tính năng Login hoạt động trơn tru.
  // Sau khi Login và Backend ổn định, ta sẽ uncomment đoạn logic bảo vệ dưới đây.

  /*
  // Logic bảo vệ API (Tạm tắt)
  if (pathname.startsWith('/api/campaigns')) {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  */

  // Cho phép request đi tiếp
  return NextResponse.next();
}

export const config = {
  // Giữ lại Matcher của code cũ vì nó tối ưu hơn (loại trừ api/auth và static files)
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (đăng nhập/đăng ký phải được thả lỏng hoàn toàn)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - wheel/guest (khách chơi không cần login)
     * - display/guest (khách xem sự kiện không cần login)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|wheel/guest|display/guest).*)',
  ],
};