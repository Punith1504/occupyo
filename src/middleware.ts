import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/about',
  '/enterprise(.*)',
  '/onboarding',
  '/property(.*)',
  '/search(.*)',
  '/commercial-space(.*)',
  '/api/telemetry',
  '/api/properties/search',
  '/api/vision-search',
  '/api/semantic-search',
  '/api/cron/keepalive',

  '/api/webhooks/clerk',
  '/api/webhooks/stripe',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
