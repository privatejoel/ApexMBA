import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Public API routes — no Clerk session required
// These serve community/aggregate data anyone can read, or handle incoming webhooks
const isPublicApiRoute = createRouteMatcher([
  "/api/opendata",
  "/api/progress/community",
  "/api/notes/community",
  "/api/webhooks/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApiRoute(req)) return; // pass through without auth check
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
