import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip authentication for login page
  if (path === '/admin/login') {
    return NextResponse.next();
  }
  
  // Check if it's an admin route
  if (path.startsWith('/admin')) {
    // Check for admin session in cookies
    const adminSession = request.cookies.get('admin_session');
    
    if (!adminSession) {
      // Redirect to admin login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
