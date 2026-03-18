# Design System — Bảo Hiểm Nhân Thọ

## Product Context
- **What this is:** Personal dashboard tracking back-office job openings from 17 Vietnamese life insurance companies
- **Who it's for:** Single user (personal productivity tool for monitoring the Vietnamese insurance job market)
- **Space/industry:** Insurance HR / job tracking, Vietnam
- **Project type:** Data dashboard / internal tool

## Aesthetic Direction
- **Direction:** Industrial / Utilitarian
- **Decoration level:** Minimal — structural dividers only, typography and hierarchy carry all meaning
- **Mood:** Focused, trustworthy, data-forward. Like a Bloomberg terminal but legible. Color is rare and always meaningful. No decorative chrome competing with the data.

## Typography
- **UI / Body:** Be Vietnam Pro (400, 500, 600, 700) — purpose-built Vietnamese diacritic support, clean geometric, replaces the overused Roboto
- **Numbers / Stats / Table IDs:** JetBrains Mono (400, 500) — tabular-nums, stat cards, row numbers, hex codes
- **Loading:** Google Fonts CDN

### Type Scale
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero  | 22px | 700 | Overview page title |
| Title | 20px | 700 | Company page name |
| Body  | 13.5px | 400/500 | Table rows, card content |
| Label | 11px | 700 | Section headers, column labels (uppercase + letter-spacing) |
| Meta  | 12px | 400 | Posted date, URLs, secondary info |
| Mono  | varies | 500 | Numbers in stat cards, row numbers |

## Color
- **Approach:** Restrained — single accent, color appears sparingly and always signals something

### Palette
```
--bg-base:     #111113   Main background (charcoal, slight warm undertone)
--bg-surface:  #1c1c1f   Cards, sidebar, table containers
--bg-raised:   #252529   Hover states, active nav, inputs
--border:      #2e2e33   All dividers and card edges
--accent:      #00D2A0   Primary action — teal-green, distinctive, not blue
--accent-dim:  #00a880   Accent hover state
--text-1:      #f4f4f5   Primary text
--text-2:      #a1a1aa   Secondary, meta, placeholders
--text-3:      #52525b   Muted, column headers, labels
--gold:        #f59e0b   Stat numbers (retained from original — works well)
--green:       #22c55e   Positive states
--red:         #ef4444   Error, negative
```

### Location Badge Colors
```
HCM:     background rgba(0,210,160,0.12)  text #00D2A0  (accent-tinted)
Hanoi:   background rgba(52,211,153,0.15)  text #6ee7b7  (mint-tinted)
Other:   background rgba(139,92,246,0.15)  text #c4b5fd  (violet-tinted)
```

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64

## Layout
- **Approach:** Grid-disciplined — strict sidebar + main, no creative-editorial asymmetry
- **Sidebar width:** 230px (fixed)
- **Border radius scale:** sm=6px, md=8px, lg=10px (reduced from 16px — utilitarian)
- **Max content width:** unbounded (full remaining width)

## Motion
- **Approach:** Minimal-functional
- **Duration:** 150ms for state transitions (hover, active), 200ms for theme changes
- **Easing:** ease (standard) for most transitions

## Key Component Decisions

### Active Nav Item
Dark treatment — `bg-raised` background with `text-1` color. NOT the old white inversion. Accent badge on active item.

### Stat Cards
Numbers in JetBrains Mono, gold color. Minimal container — `bg-raised` with single border, no drop shadow.

### Job Table
`bg-surface` container, 1px border. Row hover: `bg-raised`. Column headers: 10px uppercase mono-weight labels.

### Buttons
Primary: accent background, near-black text (`#0a0a0b`). No gradient. Radius 7px.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-18 | Replaced Roboto with Be Vietnam Pro | Roboto is overused; Be Vietnam Pro has purpose-built Vietnamese diacritic support |
| 2026-03-18 | New base color #111113 vs old #0f172a | Warmer, richer charcoal — less generic SaaS navy |
| 2026-03-18 | Accent changed to #00D2A0 | Precise teal-green avoids confusion with blue, reads as distinctive in insurance/finance context |
| 2026-03-18 | Active nav: dark treatment (not white inversion) | Fits industrial aesthetic — no high-contrast pop, just clear affordance |
| 2026-03-18 | Border radius lg reduced 16px → 10px | Less bubbly, more utilitarian |
| 2026-03-18 | JetBrains Mono for numbers | Tabular alignment for stat cards and table row numbers |
