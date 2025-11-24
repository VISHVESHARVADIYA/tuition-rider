/**
 * Static middleware placeholder
 * This middleware is designed to be completely skipped during static export
 */
import { NextResponse } from 'next/server';

const marketingRoutes = [
  '/',
  '/about',
  '/blog',
  '/contact',
  '/courses',
  '/curriculum',
  '/faq',
  '/privacy-policy',
  '/resources',
  '/reviews',
  '/services',
  '/terms'
];

export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Special handling for root level routes that should be marketing routes
  if (marketingRoutes.includes(pathname) || marketingRoutes.some(route => pathname.startsWith(route) && route !== '/')) {
    // If it's a marketing route that doesn't start with /marketing, redirect to the marketing version
    if (!pathname.startsWith('/marketing')) {
      // Keep the original path but add the marketing prefix
      url.pathname = `/marketing${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Special handling for (marketing) routes (backward compatibility)
  if (pathname.startsWith('/(marketing)') || pathname.includes('/(marketing)/')) {
    // Redirect to the non-parentheses version
    const newPath = pathname.replace('/(marketing)', '/marketing');
    url.pathname = newPath;
    return NextResponse.redirect(url);
  }

  // Continue as normal for all other routes
  return NextResponse.next();
}

// Use an empty matcher to effectively disable middleware in static export
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};