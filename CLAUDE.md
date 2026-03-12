# ApexMBA — Claude Development Guide

## Project Overview

ApexMBA is a self-directed MBA curriculum platform built with Next.js 16, React 19, and TypeScript. Users sign in via Clerk, then work through case-method business sessions with guided note-taking and progress tracking. All user data persists in localStorage keyed by Clerk user ID.

## Quick Reference

| Area | Detail |
|------|--------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Auth | Clerk `@clerk/nextjs` 7.0.4 |
| Styling | Inline React `style` objects (Tailwind installed but unused) |
| Database | None — localStorage only |
| Hosting | Vercel (region: iad1) |
| Path alias | `@/*` → `./src/*` |

## Commands

```sh
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                   # Root layout — ClerkProvider wrapper
│   ├── page.tsx                     # Landing page (public)
│   ├── globals.css                  # Minimal CSS reset
│   ├── dashboard/page.tsx           # Main app UI (protected, ~400 lines)
│   ├── sign-in/[[...sign-in]]/      # Clerk sign-in
│   └── sign-up/[[...sign-up]]/      # Clerk sign-up
├── lib/
│   └── data.ts                      # Curriculum data + types (WEEKS, TYPE_COLORS)
└── proxy.ts                         # Clerk middleware (protects /dashboard)
```

## Architecture Decisions

- **Client-only persistence**: Notes and progress are stored in `localStorage` under keys `apexmba_{userId}_{key}`. There is no backend database.
- **Inline styles everywhere**: All components use React `style` objects rather than CSS classes or Tailwind utilities. Follow this pattern when editing existing components.
- **Single-file components**: The dashboard is one large file with inline sub-components (`Hints`, `Textarea`, `usePersistedState`). There is no `components/` directory.
- **Clerk auth only**: Authentication is fully delegated to Clerk. No custom auth logic exists. Middleware in `proxy.ts` protects `/dashboard` routes.
- **Static curriculum data**: Course content lives in `src/lib/data.ts` as a hardcoded `WEEKS` array. Only Finance I (4 weeks, 20 sessions) is populated. Other 12 subjects are defined in the dashboard curriculum roadmap but locked.

## Key Patterns

### State Management
`usePersistedState<T>(key, init)` — custom hook in `dashboard/page.tsx` that syncs React state to localStorage. Uses `apexmba_{userId}_{key}` format. All persisted state flows through this hook.

### Session Keys
Sessions are identified by `w{weekNumber}d{dayIndex}` (e.g., `w1d0` = Week 1, Day 1). These keys are used in the `done`, `notes`, and `noteTab` state maps.

### Dashboard Views
Three views controlled by `view` state: `"plan"` (curriculum roadmap), `"module"` (Finance I sessions), `"notes"` (all saved notes).

### Type Badges
Session types (`Concept`, `Case Study`, `Assignment`, etc.) have color mappings in `TYPE_COLORS` exported from `data.ts`.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Navy dark | `#0d1a2b` | Headers, primary backgrounds |
| Navy mid | `#1a3a5c` | Borders, accents, Track 1 color |
| Red accent | `#c0392b` | CTA buttons, Track 2 color |
| Gold | `#f0c040` | Hero highlight text |
| Cream bg | `#f7f4ef` | Page background |
| Green | `#27ae60` | Completion, success states |
| Purple | `#7c4dab` / `#4a2d80` | Notes UI |

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Conventions

- **Fonts**: Georgia, serif for body/headings; sans-serif for UI labels; monospace for formula code blocks.
- **No component library**: No shadcn/ui, Material-UI, etc. All UI is hand-crafted.
- **No API routes**: The `src/app/api/` directory does not exist. Add one if backend endpoints are needed.
- **Clerk middleware is `proxy.ts`**: Despite the non-standard name, `src/proxy.ts` serves as the Next.js middleware file.

## Reference Docs

See `docs/` for deeper reference:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture, auth flow, data flow
- [`docs/COMPONENTS.md`](docs/COMPONENTS.md) — Component API and internal structure
- [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) — Types, curriculum schema, localStorage structure
