import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- BẢO VỀ CÁC ROUTE YÊU CẦU XÁC THỰC ---
  const protectedPageRoutes = [
    '/campaign',
    '/control',
    '/dashboard',
    '/profile',
  ];

  // Kiểm tra xem đây có phải route bảo vệ không
  const isProtectedRoute = protectedPageRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Lấy token từ NextAuth
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
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