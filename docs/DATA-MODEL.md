# Data Model Reference

## TypeScript Types

Defined in `src/lib/data.ts` (exported) and `src/app/dashboard/page.tsx` (local).

### Exported Types (`src/lib/data.ts`)

```typescript
// Inferred from the WEEKS constant
export type Week = typeof WEEKS[0];
export type Day = Week["days"][0];
```

**Week shape** (inferred):
```typescript
{
  number: number;       // 1-4
  theme: string;        // e.g., "The Language of Finance"
  goal: string;         // Learning objective summary
  days: Day[];          // Array of 5 daily sessions
}
```

**Day shape** (inferred):
```typescript
{
  day: string;          // "Day 1", "Day 2", etc.
  topic: string;        // Session title, e.g., "Time Value of Money"
  type: string;         // "Concept", "Case Study", "Assignment", etc.
  desc: string;         // Multi-sentence session description
  task: string;         // Assignment instructions
  prompts: string[];    // 3 guided note-taking prompts
  hints: Hint[];        // 3-4 formula/concept hints
}
```

**Hint shape**:
```typescript
{
  l: string;  // Label, e.g., "Present Value"
  f: string;  // Formula, e.g., "PV = FV / (1 + r)ⁿ"
  n: string;  // Context note, e.g., "$1,000 in 5yr at 8% = $681 today."
}
```

### Local Types (`src/app/dashboard/page.tsx`)

```typescript
type Notes = Record<string, { prompts: string[]; freeNote: string }>;
type Done  = Record<string, boolean>;
type NoteTab = Record<string, "guided" | "free">;
```

## Session Key Format

Sessions are identified by the pattern `w{weekNumber}d{dayIndex}`:
- `weekNumber` — 1-based (1, 2, 3, 4)
- `dayIndex` — 0-based (0, 1, 2, 3, 4)

Examples: `w1d0` (Week 1 Day 1), `w3d4` (Week 3 Day 5)

Generated inline: `const key = \`w${week.number}d${di}\``

## localStorage Schema

All keys are prefixed with `apexmba_{userId}_` where `userId` is the Clerk user ID.

### `apexmba_{userId}_done`

Tracks session completion.

```json
{
  "w1d0": true,
  "w1d2": true,
  "w2d1": true
}
```

Only completed sessions have entries. Absence = not done.

### `apexmba_{userId}_notes`

Stores user notes per session.

```json
{
  "w1d0": {
    "prompts": [
      "Answer to prompt 1...",
      "Answer to prompt 2...",
      "Answer to prompt 3..."
    ],
    "freeNote": "Free-form text here..."
  },
  "w2d3": {
    "prompts": ["", "Some answer", ""],
    "freeNote": ""
  }
}
```

- `prompts` array indices correspond to `day.prompts` indices in curriculum data
- Empty strings are preserved for unanswered prompts
- `hasNote()` checks if any prompt or freeNote has non-whitespace content

## Curriculum Data (`WEEKS`)

Exported from `src/lib/data.ts`. Contains 4 weeks of Finance I content.

### Week 1 — "The Language of Finance"
| Day | Topic | Type |
|-----|-------|------|
| 1 | Time Value of Money | Concept |
| 2 | Amazon's Early Capital Decisions | Case Study |
| 3 | Free Cash Flow & Valuation | Concept |
| 4 | Netflix vs. Blockbuster | Case Study |
| 5 | WACC | Concept + Practice |

### Week 2 — "Capital Structure & Leverage"
| Day | Topic | Type |
|-----|-------|------|
| 1 | Debt vs. Equity Trade-offs | Concept |
| 2 | Hertz Bankruptcy | Case Study |
| 3 | Leveraged Buyouts | Concept + Model |
| 4 | KKR & RJR Nabisco | Case Study |
| 5 | CFO Decision-Making | Assignment |

### Week 3 — "Valuation & Investment Decisions"
| Day | Topic | Type |
|-----|-------|------|
| 1 | DCF Valuation | Concept |
| 2 | Snap Inc. IPO | Case Study |
| 3 | Comparable Company Analysis | Concept + Practice |
| 4 | Disney/Pixar Acquisition | Case Study |
| 5 | Real Options | Concept |

### Week 4 — "Corporate Finance in Action"
| Day | Topic | Type |
|-----|-------|------|
| 1 | Dividends & Buybacks | Concept |
| 2 | Microsoft/Activision M&A | Case Study |
| 3 | Corporate Restructuring | Concept + Practice |
| 4 | Financial Strategy Integration | Review |
| 5 | Finance I Capstone | Capstone Assignment |

## TYPE_COLORS

Exported from `src/lib/data.ts`. Maps session type strings to color objects.

```typescript
TYPE_COLORS: Record<string, { bg: string; tx: string; bd: string }>
```

| Type | Background | Text | Border |
|------|-----------|------|--------|
| Concept | `#e8f4fd` | `#1a5276` | `#2980b9` |
| Case Study | `#fef9e7` | `#7d6608` | `#f39c12` |
| Assignment | `#fdf2f8` | `#6c3483` | `#8e44ad` |
| Concept + Practice | `#e8f8f5` | `#1a5c4a` | `#27ae60` |
| Concept + Model | `#e8f8f5` | `#1a5c4a` | `#27ae60` |
| Capstone Assignment | `#fdf5e6` | `#784212` | `#e67e22` |
| Review | `#f4f6f7` | `#424949` | `#95a5a6` |

## Full Curriculum Roadmap (Dashboard)

Defined inline in `dashboard/page.tsx` as the `curriculum` variable. Contains all 13 subjects across 2 tracks. Only Finance I has `active: true`.

### Track 1 — Core Finance & Strategy
| Abbr | Name | Weeks | Status |
|------|------|-------|--------|
| FIN I | Finance I | 4 | Active |
| FRC | Financial Reporting & Control | 4 | Locked |
| LEAD | Leadership & Org. Behavior | 3 | Locked |
| MKT | Marketing | 3 | Locked |
| TOM | Technology & Operations Mgmt | 3 | Locked |
| STR | Strategy | 3 | Locked |

### Track 2 — Advanced & Applied
| Abbr | Name | Weeks | Status |
|------|------|-------|--------|
| DSAI | Data Science & AI for Leaders | 3 | Locked |
| BGGE | Business, Govt & Global Economy | 3 | Locked |
| TEM | The Entrepreneurial Manager | 3 | Locked |
| FIN II | Finance II | 3 | Locked |
| LCA | Leadership & Corp. Accountability | 3 | Locked |
| GBC | Global Business Capstone | 2 | Locked |
| PTF | The Purpose of the Firm | 2 | Locked |
