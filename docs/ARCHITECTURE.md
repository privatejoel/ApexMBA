# Architecture Reference

## System Overview

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Vercel CDN │────▶│  Next.js 16 │────▶│  Clerk Auth  │
│  (iad1)     │     │  App Router │     │  (managed)   │
└─────────────┘     └──────┬──────┘     └──────────────┘
                           │
                    ┌──────▼──────┐
                    │ localStorage │
                    │ (per-user)  │
                    └─────────────┘
```

There is no backend database or API layer. The application is a client-rendered SPA with server-side route protection via Clerk middleware.

## Route Map

| Route | File | Access | Purpose |
|-------|------|--------|---------|
| `/` | `src/app/page.tsx` | Public | Landing page. Redirects signed-in users to `/dashboard`. |
| `/sign-in` | `src/app/sign-in/[[...sign-in]]/page.tsx` | Public | Clerk sign-in form with ApexMBA branding. |
| `/sign-up` | `src/app/sign-up/[[...sign-up]]/page.tsx` | Public | Clerk sign-up form with ApexMBA branding. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Protected | Main learning interface (module, curriculum, notes views). |

### Catch-all Routes
Sign-in and sign-up use Next.js optional catch-all segments (`[[...sign-in]]`) to support Clerk's multi-step authentication flows (e.g., `/sign-in/factor-one`).

## Authentication Flow

```
User visits /dashboard
        │
        ▼
proxy.ts middleware runs
        │
   isProtectedRoute?
   ┌────┴────┐
   No       Yes
   │         │
   ▼         ▼
  Pass    auth.protect()
            │
      ┌─────┴─────┐
   Authed?      No auth
      │            │
      ▼            ▼
   Continue    Redirect to
   to page     /sign-in
```

### Middleware (`src/proxy.ts`)
- Uses `clerkMiddleware` from `@clerk/nextjs/server`
- `createRouteMatcher(["/dashboard(.*)"])` defines protected routes
- Matcher config excludes static assets (images, fonts, CSS, JS bundles)
- Despite being named `proxy.ts`, this is the Next.js middleware entry point

### Client-side Auth
- `useAuth()` — checks `isSignedIn` and `isLoaded` state
- `useUser()` — provides `user.id` (for localStorage keys) and `user.firstName` (for greeting)
- `<UserButton />` — renders Clerk's account menu in the dashboard header

### Clerk Components in Layout
`layout.tsx` renders `<Show when="signed-out">` / `<Show when="signed-in">` wrappers with `SignInButton`, `SignUpButton`, and `UserButton`. These are hidden via `display: none` and exist for Clerk's internal routing.

## Data Flow

### Read Path (page load)
```
Dashboard mounts
    │
    ▼
useUser() → get userId
    │
    ▼
usePersistedState("done", {})
    │
    ▼
localStorage.getItem("apexmba_{userId}_done")
    │
    ▼
JSON.parse → setState
```

### Write Path (user action)
```
User toggles checkbox / edits note
    │
    ▼
setDone() or setNotes()
    │
    ▼
usePersistedState setter
    │
    ▼
setState(next) + localStorage.setItem(key, JSON.stringify(next))
```

### Static Content
Curriculum data (`WEEKS` array) is imported from `src/lib/data.ts` at build time. No runtime fetching.

## Deployment

### Vercel Config (`vercel.json`)
- **Region**: `iad1` (Northern Virginia)
- **Build**: `npm run build` → `.next` output
- **Clean URLs**: Enabled (no trailing slashes)
- **Redirect**: `/home` → `/` (301)

### Security Headers
| Header | Value |
|--------|-------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |

### Static Asset Caching
Files matching `/_next/static/**` get `Cache-Control: public, max-age=31536000, immutable`.

## Current Limitations

1. **No cross-device sync** — localStorage is browser-specific. Notes and progress don't transfer between devices.
2. **No backend API** — No `src/app/api/` directory exists. Adding server endpoints requires creating this.
3. **Single active module** — Only Finance I has content. Other 12 subjects are locked in the curriculum view.
4. **No error boundaries** — The app has no React error boundary components.
5. **No tests** — No test files or testing framework configured.
6. **No analytics** — No tracking, metrics collection, or event logging.

## Scaling Considerations

To evolve beyond the current client-side architecture:
- Add a database (Postgres/Supabase/Planetscale) for note and progress persistence
- Create API routes in `src/app/api/` for CRUD operations
- Add Clerk webhook handlers for user lifecycle events
- Implement server-side rendering for curriculum pages (currently all client-rendered)
- Extract dashboard sub-components into a `src/components/` directory
