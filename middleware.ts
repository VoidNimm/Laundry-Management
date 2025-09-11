import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role-based access control configuration
const rolePermissions = {
  admin: [
    '/', '/login', '/logout', '/members', '/outlets', '/users', '/transaksi', '/packages', '/reports'
  ],
  kasir: [
    '/', '/login', '/logout', '/members', '/transaksi', '/reports'
  ],
  owner: [
    '/', '/login', '/logout', '/members', '/transaksi', '/reports'
  ]
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and login page
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = request.cookies.get('auth-token');
  const userData = request.cookies.get('user-data');

  if (!token || !userData) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Parse user data to get role
    const user = JSON.parse(userData.value);
    const userRole = user.role;

    // Check if user has permission to access this route
    const allowedRoutes = rolePermissions[userRole as keyof typeof rolePermissions] || [];
    
    // Check if the current path is allowed for this role
    const isAllowed = allowedRoutes.some(route => {
      if (route === '/') return pathname === '/';
      return pathname.startsWith(route);
    });

    if (!isAllowed) {
      // Redirect to home page if access denied
      return NextResponse.redirect(new URL('/', request.url));
    }

  } catch (error) {
    // If user data is corrupted, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
