import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Paths that require authentication
  const protectedPaths = [
    '/messages',
    '/settings',
    '/create',
    '/clipz/create',
    '/api/v1/posts',
    '/api/v1/clipz',
  ];

  // Paths that are public but have auth features
  const authPaths = ['/login', '/register'];

  const path = request.nextUrl.pathname;

  // Check if path requires protection
  const isProtectedPath = protectedPaths.some(prefix => 
    path.startsWith(prefix)
  );

  // Check if path is auth-related
  const isAuthPath = authPaths.some(prefix => 
    path.startsWith(prefix)
  );

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect authenticated users away from auth pages
    if (isAuthPath && token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect unauthenticated users to login
    if (isProtectedPath && !token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // Add user info to headers for API routes
    if (path.startsWith('/api/') && token) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', token.sub as string);
      requestHeaders.set('x-user-role', token.role as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 