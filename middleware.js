import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // User is authenticated but not subscribed — send to subscribe page
    if (pathname.startsWith('/members') && !token?.isSubscribed) {
      return NextResponse.redirect(new URL('/subscribe', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Must be logged in to access /members
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/members/:path*'],
};
