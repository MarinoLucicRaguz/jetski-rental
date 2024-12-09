import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { getToken } from 'next-auth/jwt';

import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes, routesByRole } from '@/routes';

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && nextUrl.pathname === '/') {
    return Response.redirect(new URL('/auth/login', req.url));
  }

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return undefined;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return undefined;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/auth/login', nextUrl));
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (token) {
    const isUserAuthorized = routesByRole[token.role as keyof typeof routesByRole].includes(nextUrl.pathname);
    if (!isUserAuthorized) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return undefined;
  }

  return undefined;
});

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
