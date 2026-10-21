---
name: OpsPilot Core
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#b4c5ff'
  on-secondary: '#002a78'
  secondary-container: '#0053db'
  on-secondary-container: '#cdd7ff'
  tertiary: '#c4c1fb'
  on-tertiary: '#2d2a5b'
  tertiary-container: '#5d5b8e'
  on-tertiary-container: '#dcd8ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#e3dfff'
  tertiary-fixed-dim: '#c4c1fb'
  on-tertiary-fixed: '#181445'
  on-tertiary-fixed-variant: '#444173'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.005em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system projects mission-critical authority, surgical precision, and intelligent autonomy. Built for platform engineers, Site Reliability Engineers (SREs), and enterprise infrastructure leaders, the visual language balances dense diagnostic telemetry with calm, lucid decision paths. The aesthetic rejects decorative clutter in favor of high-legibility typographic hierarchies, deterministic data density, and mechanical composure.

The stylistic foundation fuses **Corporate / Modern** discipline with technical **Minimalism**:
- **Information Density without Chaos:** Layouts prioritize compact row heights, micro-status indicators, and instant telemetry scanning, avoiding unnecessary decorative margins.
- **Controlled Technical Contrast:** High-precision hairline borders delineate nested multi-tenant workspaces, infrastructure graphs, and AI remediation runs.
- **Deliberate Accent Hierarchy:** Vivid violet and indigo tokens are reserved for active orchestration vectors and AI-assisted automations, while infrastructural states use strict functional semaphores (emerald, amber, rose).

## Colors

The color system operates on an infrastructure-first dark canvas (`#0F172A`), calibrated to eliminate eye strain during prolonged on-call triage while maintaining AA/AAA contrast compliance across complex visual trees.

### Core Canvas & Structural Tiers
- **Canvas Base:** `#0F172A` (Obsidian Slate) serves as the primary window environment.
- **Surface Layer 1 (Panels & Nav):** `#1E293B` provides structural containment for cards, toolbars, and inspection sidebars.
- **Surface Layer 2 (Elevated Inputs & Code Terminals):** `#334155` provides interior contrast for input wells, monospaced logs, and terminal panels.
- **Hairline Outlines:** `#334155` at 1px default, dropping to `#1E293B` for low-priority dividers.

### Orchestration & AI Tints
- **Primary AI/Orchestration (`#4F46E5` / `#6366F1`):** Applied to active agents, automated root-cause insights, flow-node anchors, and primary trigger actions.
- **Secondary Cloud Flow (`#2563EB`):** Applied to conventional networking routes, target deployment links, and platform-level navigation states.
- **Tertiary Foundation (`#1E1B4B`):** Employed as subtle tinted backdrop fills behind AI recommendations, diff cards, and elevated run status ribbons.

### Telemetry Semantics
- **Success (Running / Healthy):** `#10B981` (active) / `#059669` (border/fill accents).
- **Warning (Degraded / Drift Detected):** `#D97706` / `#F59E0B`.
- **Error (Failed Job / Node Panic):** `#E11D48` / `#FB7185`.

## Typography

The dual-type strategy enforces strict visual logic: **Inter** powers general structural interfaces, operational text, and dashboard context, while **JetBrains Mono** surfaces all deterministic system entities.

### Technical Type Rules
- **Inter (Application Shell & Narrative):** Used across primary layouts, tables, headers, and AI remediation descriptions. Optical sizing is tightly tuned with tight negative letter tracking (`-0.01em` to `-0.02em`) on headers to maintain compact hierarchy.
- **JetBrains Mono (Deterministic System State):** Strictly designated for Commit SHA hashes, AWS/GCP/Azure resource ARNs, Kubernetes pods, microservice status chips, numeric telemetry metrics (latencies, CPU ratios), and terminal execution blocks.
- **Numbers & Metrics:** Quantitative data columns inside data tables must inherit tabular lining figures (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during real-time streaming updates.

## Layout & Spacing

This design system employs an ultra-dense, responsive fluid-grid architecture anchored on a strict **4px baseline rhythm**. Layout modules adapt fluidly to screen real estate to maximize visible pipeline state without inducing horizontal pagination.

### Grid & Breakpoints
- **Desktop (1440px and above):** 12-column fluid grid. Outer margins are locked to `1.5rem` (`24px`), with `1rem` (`16px`) gutters. Sidebars default to a fixed width of `260px` (collapsible to `56px`), with split inspection drawers fixed to `420px`.
- **Tablet / Small Desktop (768px – 1439px):** 8-column layout. Workspace panels convert to full width with floating slide-over inspectors. Gutters remain `1rem`.
- **Mobile (< 768px):** 4-column layout. Outer margins contract to `1rem`, gutters to `0.75rem`. Non-critical telemetry graphs collapse into expandable disclosure cards.

### Layout Rules
- **Component Padding Scale:** Default inner card padding is `space-lg` (`16px`), collapsing to `space-md` (`12px`) for nested sub-cards, status rows, and data list tiles.
- **Compact Data Rows:** Table row heights adhere strictly to either `32px` (dense monitoring view) or `40px` (standard pipeline view), ensuring deep data visibility above the fold.

## Elevation & Depth

Visual separation relies on **tonal surface layering** combined with **low-contrast hairline outlines**, completely avoiding heavy drop shadows. Ambient shadows are restricted to floating modal surfaces and contextual popovers to preserve the platform's flat, technical aesthetic.

### Surface Elevation Hierarchy
- **Level 0 (App Canvas):** `#0F172A`. Root canvas for the platform; carries no border.
- **Level 1 (Sub-systems & Viewports):** `#1E293B`. Base layer for persistent cards, metrics grids, and log consoles. Enclosed by a 1px border of `#334155`.
- **Level 2 (Active Focus & Contextual Panels):** `#1E293B` raised with an inner high-density fill or `#334155` surface. Outlined by `rgba(99, 102, 241, 0.35)` to signal active AI inspection or system-level focus.
- **Level 3 (Overlays, Modals, & Context Menus):** Surface `#1E293B` surrounded by a crisp 1px stroke of `#475569`, backed by an ambient technical shadow: `0 12px 24px -4px rgba(0, 0, 0, 0.6), 0 4px 8px -2px rgba(0, 0, 0, 0.4)`.

### Border Discipline
Hairline borders (`1px solid #334155`) serve as the primary containment vehicle. Dividers inside panels drop to `rgba(255, 255, 255, 0.06)` to avoid visual banding across dense lists.

## Shapes

The design system enforces a **Soft (Level 1)** geometric standard. Corner radii remain intentionally restrained to deliver a surgical, purpose-built developer aesthetic that mirrors hardware appliances and IDE environments.

### Radius Application Matrix
- **Base Elements (`rounded`, 0.25rem / 4px):** Applied to buttons, text inputs, status chips, code snippets, tabs, and table selection checkboxes.
- **Container Surfaces (`rounded-lg`, 0.5rem / 8px):** Applied to workflow step cards, pipeline group blocks, logs panels, charts, and dialogs.
- **Floating Overlays (`rounded-xl`, 0.75rem / 12px):** Reserved solely for global modal dialogs, platform onboarding wizards, and floating command palettes.
- **Full Pill (`rounded-full`):** Exclusively utilized for micro-status indicators (e.g., active execution pulse dots) and notification count badges.

## Components

### Buttons
- **Primary (AI / Actionable Deploy):** Background `#4F46E5`, hover `#4338CA`, text `#FFFFFF`. 1px subtle highlight top border (`rgba(255, 255, 255, 0.15)`). Height: `32px` (dense) or `36px` (standard). Typography: `body-sm`, font-weight 500.
- **Secondary (Infrastructure Control):** Background `#1E293B`, border `1px solid #334155`, text `#E2E8F0`. Hover background `#334155`.
- **Destructive (Rollback / Terminate Cluster):** Background `rgba(225, 29, 72, 0.1)`, border `1px solid #E11D48`, text `#FB7185`. Hover background `#E11D48`, hover text `#FFFFFF`.

### Chips & Status Indicators
- Always use `JetBrains Mono` (`label-md` or `label-sm`).
- **Success Chip (Healthy / Deployed):** Background `rgba(16, 185, 129, 0.1)`, border `1px solid rgba(16, 185, 129, 0.25)`, text `#34D399`. Accompanied by a leading 6px static circle.
- **Warning Chip (Drift / Latency Spike):** Background `rgba(217, 119, 6, 0.1)`, border `1px solid rgba(217, 119, 6, 0.3)`, text `#FBBF24`.
- **Error Chip (Failed / Pod OOMKilled):** Background `rgba(225, 29, 72, 0.12)`, border `1px solid rgba(225, 29, 72, 0.35)`, text `#FDA4AF`.
- **AI Suggested Mutation Chip:** Background `rgba(99, 102, 241, 0.15)`, border `1px solid rgba(99, 102, 241, 0.4)`, text `#A5B4FC`.

### Form Inputs & Controls
- **Text Inputs:** Background `#0F172A`, border `1px solid #334155`, text `#F8FAFC`, placeholder `#64748B`. Corner radius: `4px`. Focused state: border `#6366F1`, ring: `0 0 0 1px #6366F1`.
- **Checkboxes & Radios:** Size `14px x 14px`. Unselected: border `#475569`, background `transparent`. Selected: background `#4F46E5`, border `#4F46E5`. Corner radius on checkboxes is `2px`.

### Cards & Workflow Nodes
- **Pipeline Node Card:** Background `#1E293B`, border `1px solid #334155`, radius `8px`. Left-edge 3px indicator line encoding running status (`#10B981`, `#6366F1`, or `#E11D48`). Header rows display resource identifier in `JetBrains Mono` and execution latency right-aligned.

### Lists & Telemetry Tables
- Striped alternating backgrounds are forbidden. Row delineation uses `1px solid rgba(51, 65, 85, 0.5)`. Hover state triggers background `#1E293B` at 100% opacity. Numerical figures must align right; status chips center; resource IDs align left.

### Monospaced Log Consoles (Product-Specific)
- Background `#090D16`, border `1px solid #1E293B`, text `#94A3B8`, line numbers in `#475569`. Font: `JetBrains Mono` (`body-sm`). Error highlights utilize background `rgba(225, 29, 72, 0.15)` across the entire line with `#FB7185` text.