# Design Brief

## Direction

Trading Terminal — decentralized prop trading platform with dark minimalist aesthetic focused on speed, clarity, and real-time data density.

## Tone

Brutalist utilitarian: every pixel serves function. Professional, Bloomberg-terminal-like restraint with no decorative flair or distraction.

## Differentiation

Semantic color system for execution modes (cyan=SIMULATED, gold=REAL) and trading outcomes (green=profit, red=loss). Monospace pricing with real-time badges. Compact sidebar navigation. Terminal-like density meets professional restraint.

## Color Palette

| Token | OKLCH | Role |
|-------|-------|------|
| background | 0.13 0 0 | page base, true black |
| foreground | 0.92 0 0 | text, near white |
| card | 0.18 0 0 | elevated surfaces |
| primary | 0.65 0.2 200 | cyan accent, simulated mode, interactive elements |
| accent | 0.72 0.18 60 | gold accent, real funded mode |
| chart-1 | 0.62 0.22 150 | profit/gain, success states |
| chart-2 | 0.52 0.22 25 | loss/drawdown, danger states |
| chart-3 | 0.7 0.15 85 | warning/caution states |
| muted | 0.22 0 0 | secondary surfaces |
| border | 0.25 0 0 | subtle dividers |

## Typography

- Display: Space Grotesk — clean geometric headers, challenge titles, risk labels
- Body: DM Sans — UI labels, descriptions, form text
- Mono: Geist Mono — prices, P&L values, timestamps
- Scale: h1 `text-3xl font-bold tracking-tight`, h2 `text-2xl font-semibold`, label `text-xs font-semibold tracking-widest`, body `text-sm text-muted-foreground`

## Elevation & Depth

Flat with subtle card borders. Cards use `border border-border` and `bg-card`. Sidebar `bg-sidebar` creates spatial hierarchy via background shift only, no shadows.

## Structural Zones

| Zone | Background | Border | Notes |
|------|-----------|--------|-------|
| Header | bg-card | border-b border-border | navigation, branding |
| Sidebar | bg-sidebar | border-r border-sidebar-border | challenge list, nav links |
| Content | bg-background | — | main dashboard, alternating card backgrounds |
| Cards | bg-card | border border-border | individual trades, metrics, compact density |

## Spacing & Rhythm

Compact density: 8px base unit, 4px micro-spacing. Section gaps 16–24px. Card padding 12px. Label-to-input 8px. Minimize whitespace without crowding for high information density.

## Component Patterns

- Buttons: bg-primary text-primary-foreground hover:opacity-90, transition-smooth, rounded-md
- Badges: .badge-simulated (cyan), .badge-real (gold), .badge-success (green), .badge-warning (amber), .badge-destructive (red)
- Mono values: .mono-price for market data, .mono-lg for highlights
- Status indicators: uppercase label, color-coded badges, risk levels inline

## Motion

Entrance: fade-in 100ms. Hover: color shift + shadow-sm, transition-smooth. No decorative animations. Real-time updates via CSS transition on value changes.

## Constraints

- NO gradients, NO blur effects, NO glow or neon shadows
- All semantic colors strictly applied (cyan→simulated, gold→real, green→profit, red→loss, amber→warning)
- Monospace ONLY for prices, timestamps, P&L values
- Compact grid layout, no padding excess
- Border-radius 0.5rem max (subtle, not rounded)

## Signature Detail

Monospace price feeds with semantic badge system. Status + risk level + execution mode visible at a glance via color and compact badge grouping. Terminal-like speed without sacrificing professional craft.
