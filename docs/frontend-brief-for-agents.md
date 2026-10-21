# Shared brief: building a Stitch screen as a React page

Repo: /home/gajapathimugunda/Documents/ops-pilot-frontend. Next.js 16 App Router, TypeScript, **SCSS modules** (Tailwind is NOT installed). Read `CLAUDE.md`, `docs/frontend-structure.md`, and `OpsPilot-ProtoType/stitch_opspilot_enterprise_devops_portal/opspilot_core/DESIGN.md`.

## Goal
Recreate your assigned Stitch screen (`code.html` for structure/content, `screen.png` for the look) as real React components so the owner can view the mock-up UI. Keep the Stitch layout, hierarchy, spacing, icons (Material Symbols, via `Icon`), tables and cards. Do NOT paste the HTML wholesale: build small typed components. Do not invent a different design.

## What already exists (read these files; do not modify them)
- Shell/nav/auth/guards: `src/app/(app)/layout.tsx`, `src/features/auth/**`. The page is already routed and guarded; you only replace its body.
- Shared UI: `src/components/ui/{Button,TextField,Notice,Icon,Card,StatusBadge,PageHeader,StatTile,Table}`, `src/components/layout/MockDataNotice`.
- Styling: `src/styles/_tokens.scss` (colors emitted as `var(--color-*)`: background, surface-lowest/low/container/high/highest, on-surface, on-surface-variant, outline, outline-variant, primary, primary-container, on-primary-container, secondary, tertiary, error, error-container, on-error-container, warning, success), `src/styles/_mixins.scss` (`@use "mixins"`: `up(sm|md|lg)`, `reduced-motion`, `focus-ring`, `glass-card`, `eyebrow`). Fonts: `var(--font-inter)`, `var(--font-jetbrains)` for mono. Use these tokens; do not add new colors or a new palette. `cx` helper in `src/lib/cx`.
- Pattern: one folder per component, `Name/Name.tsx` + `Name/Name.module.scss`.

## File ownership (avoid conflicts: 7 agents work in parallel)
Edit only: your `src/features/<feature>/**` and your one page file under `src/app/(app)/...`. Do NOT edit shared components, `src/styles`, `src/features/auth`, other features, configs or package.json. If you need a shared change, work around it inside your feature folder (e.g. a feature-local component) and mention it in your report. Do not add dependencies.

## Structure to produce
- `src/features/<feature>/types.ts` typed interfaces.
- `src/features/<feature>/mock-data.ts` starts with a comment `// MOCK DATA: static UI-preview data, not from any backend.` Mock values come from the Stitch HTML.
- `src/features/<feature>/components/<Name>/...` small components. Server components by default; add `"use client"` only where interaction needs it (tabs, filters, sorting, expand/collapse, dialogs).
- Page file: keep the existing `requireSession(PERMISSIONS.x)` call, then render `<MockDataNotice />` and your view. Page is a thin composition.

## Hard rules (project security/integrity rules)
- Never simulate success. Buttons that would mutate or execute something (Deploy, Promote, Rollback, Execute, Cancel, Approve, Reject, Apply, Export, Import, Create, Run) must be **disabled** with visible or `title`/`aria-describedby` text that the action is not connected to a backend yet. No fake spinners-then-success, no toasts claiming completion, no fake timers or auto-updating "live" data. Show a static "Mock snapshot" instead of "LIVE" where the Stitch says live (you may keep the Stitch wording as part of mock content, but nothing may actually pretend to stream).
- Navigation-like interactions SHOULD really work on the mock data: tabs, filters, sorting, search, expand/collapse, selecting a row to show detail.
- AI output is a suggestion, never an executed action.
- Render all text as React text (no dangerouslySetInnerHTML); mock logs/commands are untrusted-style content.
- Never present a status by color alone: pair with text/icon (`StatusBadge`).
- Do not claim real compliance/verification (e.g. "SOC2 attested", "hash verified") as live fact; it's mock content inside a screen that is labeled mock.

## Quality bar
- Semantic HTML (landmarks, headings in order starting at the page `h1` from `PageHeader`, real `<table>` via `Table`, `<button>`, labels for inputs, accessible names for icon buttons, `aria-pressed`/`role=tablist` for tabs, visible focus via `focus-ring`).
- Responsive 375px to desktop; no page-level horizontal scroll (tables scroll inside `Table`). Use `up()` mixin mobile-first.
- `prefers-reduced-motion` respected (any transition inside `@include mixins.reduced-motion`).
- Keep components small (< ~150 lines); extract repeated pieces.

## Verify (do these; do NOT run `next build` or `next dev`: the shared `.next` folder is used by others)
1. `npx tsc --noEmit` (ignore errors in files you do not own, other agents are mid-edit).
2. `npx eslint src/features/<feature> "<your page path>"`.
3. Add `src/features/<feature>/__tests__/<feature>.test.tsx` (vitest + Testing Library, globals enabled; mock `next/navigation` if needed). Cover: main view renders key landmarks/headings with mock data, one real interaction (filter/tab/sort), and that mutating actions are disabled. Run `npx vitest run src/features/<feature>`.

## Report (short)
Files created, what matches Stitch, deviations/omissions, placeholders, exact commands run with pass/fail. Distinguish verified from not verified. Do not claim visual fidelity you did not check (you may read `screen.png` for comparison).
