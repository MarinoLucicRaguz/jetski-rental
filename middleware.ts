import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from '@/routes';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
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

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/auth/login', nextUrl));
  }

  const userRole = req.auth?.user?.role;
  // const roleRequired = roleBasedRoutes[nextUrl.pathname]

  // routes.js
  //ovo ide u routes.ts
  // export const apiAuthPrefix = "/api/auth";
  // export const authRoutes = ["/auth/login", "/auth/register"];
  // export const publicRoutes = ["/", "/about", "/contact"];
  // export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

  // export const roleBasedRoutes = {
  //     "/admin": "admin",       // Only admins can access this route
  //     "/dashboard": "user",    // General users can access this route
  //     // Add more routes and roles as needed
  // };

  //https://chatgpt.com/c/5b01133c-c115-4024-a0b0-77f2e93360b9

  return undefined;
});

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
