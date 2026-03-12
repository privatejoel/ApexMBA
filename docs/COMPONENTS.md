# Components Reference

All components live in two files. There is no `src/components/` directory.

## Page Components

### Landing Page — `src/app/page.tsx`

**Route**: `/` (public)
**Directive**: `"use client"`

Renders the marketing landing page with navigation, hero, stats, features grid, curriculum preview, and CTA sections. Redirects signed-in users to `/dashboard` via `useEffect`.

**Imports**: `useAuth`, `useRouter` (from Clerk and Next.js)

**Sections** (top to bottom):
1. **Nav bar** — Logo, Sign In link, Get Started button
2. **Hero** — Headline, subtitle, CTA button, stats row (13 subjects, 200+ sessions, 50+ cases, 90 min/day)
3. **Features grid** — 6 cards (Case Method, Formula Hints, Self-Paced, etc.)
4. **Curriculum overview** — 2 tracks rendered as card grids, Finance I marked "Active"
5. **CTA section** — Final call-to-action
6. **Footer** — Harvard non-affiliation disclaimer

### Dashboard — `src/app/dashboard/page.tsx`

**Route**: `/dashboard` (protected)
**Directive**: `"use client"`
**Size**: ~400 lines

The main application interface. Contains all learning UI, note-taking, and progress tracking.

**State variables**:
| Variable | Type | Persisted | Purpose |
|----------|------|-----------|---------|
| `view` | `"plan" \| "module" \| "notes"` | No | Active tab |
| `activeWeek` | `number` (0-3) | No | Selected week tab |
| `expanded` | `string \| null` | No | Expanded session key |
| `done` | `Record<string, boolean>` | Yes | Session completion map |
| `notes` | `Record<string, {prompts, freeNote}>` | Yes | User notes per session |
| `noteTab` | `Record<string, "guided" \| "free">` | No | Note mode preference |
| `menuOpen` | `boolean` | No | Mobile menu (unused) |

**Helper functions**:
| Function | Signature | Purpose |
|----------|-----------|---------|
| `toggleDone` | `(key: string) => void` | Toggle session completion |
| `toggleExp` | `(key: string) => void` | Expand/collapse session |
| `getTab` | `(key: string) => "guided" \| "free"` | Get note mode for session |
| `setTab` | `(key: string, t) => void` | Set note mode for session |
| `getPN` | `(key: string, i: number) => string` | Get guided prompt answer |
| `setPN` | `(key: string, i: number, v: string) => void` | Set guided prompt answer |
| `getFN` | `(key: string) => string` | Get free-form note |
| `setFN` | `(key: string, v: string) => void` | Set free-form note |
| `hasNote` | `(key: string) => boolean` | Check if session has any notes |

**Views**:

#### Plan View (`view === "plan"`)
Renders the full curriculum roadmap with two tracks and 13 subjects. Only Finance I is clickable (has `active: true`). Clicking it switches to module view.

#### Module View (`view === "module"`)
The primary learning interface:
- **Module header**: Title, description, progress bar with percentage and session count
- **Week tabs**: 4 buttons to switch between weeks
- **Week content**: Dark header with week theme, then session cards
- **Session cards**: Expandable rows with completion checkbox, day label, topic, type badge
- **Expanded session**: Description, assignment box (orange-bordered), `<Hints>` panel, `<Notes>` section with guided/free tabs
- **Week navigation**: Previous/Next Week buttons at bottom

#### Notes View (`view === "notes"`)
Aggregates all sessions that have saved notes. Each note card shows week/day label, topic, type badge, answered prompts, free notes, and an Edit button that navigates back to the session.

### Sign-In — `src/app/sign-in/[[...sign-in]]/page.tsx`

**Route**: `/sign-in` (public)

Renders Clerk's `<SignIn />` component centered on a dark gradient background with ApexMBA branding.

### Sign-Up — `src/app/sign-up/[[...sign-up]]/page.tsx`

**Route**: `/sign-up` (public)

Renders Clerk's `<SignUp />` component centered with branding and tagline about 50,000 free users.

---

## Internal Components (defined in `dashboard/page.tsx`)

### `usePersistedState<T>`

```typescript
function usePersistedState<T>(key: string, init: T): [T, (v: T | ((prev: T) => T)) => void]
```

Custom hook that persists React state to `localStorage`.

**Behavior**:
1. Initializes with `init` value
2. On mount, if `localStorage` has data for `apexmba_{userId}_{key}`, hydrates from it
3. Every `set` call writes to both React state and localStorage
4. Supports functional updates: `set(prev => newValue)`
5. Errors are silently caught (try/catch around JSON parse/stringify)

**Key format**: `apexmba_{userId}_{key}` where `userId` comes from Clerk's `useUser()`.

**Used for**: `done` (completion map), `notes` (note content)

### `Hints`

```typescript
function Hints({ hints }: { hints: { l: string; f: string; n: string }[] })
```

Collapsible panel showing formula hints for a session.

**Props**:
- `hints` — Array of `{ l: label, f: formula, n: note }` objects

**Behavior**:
- Renders nothing if `hints` is empty
- Toggle button shows count badge and "Show"/"Hide" text
- Each hint renders: numbered label, code block with green monospace formula, context note with lightbulb icon
- Green color scheme (`#2e7d32` accent, `#e8f5e9` background)

### `Textarea`

```typescript
function Textarea({ value, onChange, placeholder, rows }: Props)
```

Auto-resizing textarea with focus styling.

**Props**:
- `value: string` — Current text content
- `onChange: (v: string) => void` — Change handler
- `placeholder?: string` — Placeholder text
- `rows?: number` — Initial row count (default: 3)

**Behavior**:
- Auto-resizes height based on scroll height via `useRef` + `useEffect`
- Focus: purple border (`#7c4dab`) with subtle box-shadow
- Blur: reverts to default gray border
- Georgia serif font at 13px with 1.7 line-height
- Cream background (`#fffef9`)

---

## Root Layout — `src/app/layout.tsx`

Wraps the entire application with `<ClerkProvider>`. Sets up:
- HTML metadata (title, description)
- Clerk UI components in hidden divs (for internal routing)
- `<Show when="signed-out">` / `<Show when="signed-in">` conditional rendering
