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

  // --- BẢO VỆ CÁC ROUTE YÊU CẦU XÁC THỰC ---
  const protectedPageRoutes = [
    '/campaign',
    '/control',
    '/dashboard',
    '/profile',
  ];

  // Kiểm tra xem đây có phải route bảo vệ không
  const isProtectedRoute = protectedPageRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Kiểm tra token
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value;
    
    if (!token) {
      // Redirect sang login nếu không có token
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

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