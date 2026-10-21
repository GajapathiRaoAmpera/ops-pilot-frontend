# OpsPilot design system (v2, ui-ux-pro-max guided)

Status: applied on branch `redesign/ui-ux-pro-max`. Supersedes the Stitch palette in `CLAUDE.md` once merged.
Source of truth in code: `src/styles/_tokens.scss` (emits `--color-*`), shared components in `src/components/ui/`.

## Direction
Product: operations console for DevOps teams (pipelines, approvals, audit). Style: **Data-Dense Dashboard** on a dark
slate base. Matches the database's "Status Page / Incident Management" profile: neutral dark, status colours reserved
for status. Searched and verified: product, style, colour, typography. No verified match for approval/timeline UX, so
the decision trail (`features/approvals/live/DecisionTrail`) is a deliberate local design.

## Colour (CSS variables; WCAG measured on `surface-low` #1b2336)
| Token | Value | Use | Contrast |
|---|---|---|---|
| background | #0f172a | page | text 16.3:1 |
| surface-low | #1b2336 | panels, cards | - |
| surface-container / high | #222b40 / #272f42 | raised, hover, table header | muted text 5.2:1 |
| on-surface | #f1f5f9 | text | 14.3:1 |
| on-surface-variant | #cbd5e1 | secondary text | 10.6:1 |
| outline | #94a3b8 | muted text, labels | 6.1:1 |
| control-border | #6b7c93 | borders of inputs/selects | 3.7:1 (>= 3:1 for UI components) |
| outline-variant | #475569 | dividers (decorative) | - |
| primary / primary-container | #a5b4fc / #4f46e5 | links, focus, actions (indigo) | button text 5.6:1 |
| success / warning / error | #4ade80 / #fbbf24 / #f87171 | **status only** | 9.0 / 9.4 / 5.7 |
Rule: green/amber/red mean status and nothing else; actions are indigo. Status is never colour alone: `StatusBadge`
carries a default icon plus text.

## Type
Fira Sans (labels, prose, 400-700) + Fira Code (identifiers, SHAs, figures, permission strings). `--font-sans`,
`--font-mono`. Body 13-14px in the console, tables 13px, page title 22-26px. Numerals are tabular in tables and stat tiles.

## Density and shape
Cards radius 8px, header padding 10/14px, body 14px. Table cells 8/12px (~36px rows), header on a tinted band,
sentence-case column labels. Sidebar 15rem, content padding 16/24/32px by breakpoint. Buttons radius 6px, solid (no glow).
Glass blur is kept only on the signed-out screens.

## Motion
Minimal (motion dial 3/10): 150ms colour/filter transitions, background orbs only on signed-out screens, all disabled
under `prefers-reduced-motion`.

## Checklist before shipping a screen
Keyboard focus visible; text >= 4.5:1; control borders >= 3:1; status has text + icon; tables scroll inside their
container at 375px; empty states say what to do next (`EmptyState`); no emoji icons (Material Symbols only).
