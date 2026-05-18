import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Include '/' explicitly so the middleware runs on the root path too
  matcher: ['/', '/((?!_next|_vercel|api|.*\\..*).*)'],
};
