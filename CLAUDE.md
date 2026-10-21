# OpsPilot — Claude Code Project Instructions

## Project
OpsPilot is an AI-powered enterprise DevOps automation platform.
Inspect the existing repository and backend contracts before implementing features.

## Engineering
- Preserve existing working functionality and user changes.
- Follow the existing framework, package manager, routing, and styling conventions.
- Prefer small, reusable, testable changes.
- Never invent endpoints, permissions, production metrics, or execution results.

## Design
- Background: #0B1120
- Surface: #151F32
- Indigo: #6366F1
- Neon cyan: #22D3EE
- Violet: #A78BFA
- Text: #F8FAFC
- Secondary text: #94A3B8
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444

Use restrained neon accents, responsive layouts, accessible contrast, keyboard navigation, and reduced-motion support.

## Modules
Support authentication, organizations, workspaces, role-aware navigation, cloud inventory, projects, DevOps pipelines, AI agent orchestration, approvals, execution logs, audit trails, and settings where the backend supports them.

## Security
- Never expose credentials or secrets in frontend code.
- Backend authorization is authoritative.
- Respect tenant boundaries.
- Render untrusted content safely.
- Require appropriate confirmation for sensitive actions.
- Never claim an AI action executed without backend confirmation.

## Agent team
Use appropriate specialized agents from .claude/agents/:
- frontend-orchestrator
- ui-ux-architect
- react-component-engineer
- auth-rbac-ui-engineer
- cloud-dashboard-engineer
- devops-automation-ui-engineer
- ai-agent-ui-engineer
- api-integration-engineer
- frontend-qa-security-engineer

Delegate focused work, avoid conflicting edits, and verify results.

## Workflow
Inspect first, plan, implement incrementally, integrate against verified API contracts, run available tests and build checks, and report actual outcomes.

Inspect package.json before selecting commands. Never discard user changes or run destructive commands without approval.

## Reporting
Summarize changed files, tests actually executed, results, failures, and remaining work. Distinguish proposed work from verified implementation.



## Stitch-Generated Frontend: Mandatory Instructions

### Source of Truth
- The existing Google Stitch-generated OpsPilot screens are the approved visual baseline.
- Inspect the supplied Stitch HTML screens and `opspilot_core/DESIGN.md` before changing UI.
- Inspect the existing React project, package.json, routing, components, styles, and API services before implementing changes.
- Preserve the existing page layouts, information hierarchy, navigation, spacing, typography, icons, tables, cards, and interaction patterns wherever practical.
- Do not redesign the application from scratch or replace the established UI without explicit approval.
- Do not assume the Stitch HTML files are already integrated into React.

### Design Tokens
- Use the supplied Stitch design tokens as the source of truth for colors, typography, surfaces, and component styling.
- Existing primary colors include `#c3c0ff` and `#4f46e5`.
- Existing secondary color: `#b4c5ff`.
- Background: `#0b1326`.
- Surface colors include `#131b2e`, `#171f33`, and `#222a3d`.
- Use consistent tokens instead of introducing a competing color palette.
- Do not add neon cyan or other accent colors globally unless the existing design system calls for them or approval is given.

### React Integration
- Treat Stitch HTML as a visual reference when converting screens to React.
- Reuse the existing framework, package manager, routing, and styling architecture.
- Extract shared navigation, headers, cards, status indicators, tables, dialogs, and form controls into reusable components where appropriate.
- Avoid duplicating complete page implementations or creating competing design systems.
- Avoid adding a new UI library or replacing the existing styling approach without justification.
- Keep application logic, API integration, and presentation concerns appropriately separated.

### Functional Integration
- Replace mock data with verified API responses where backend endpoints exist.
- Clearly identify placeholders when an endpoint or backend feature is not implemented.
- Wire buttons, filters, search, forms, navigation, dialogs, and approval actions to their intended behavior.
- Never simulate a successful deployment, automation run, approval, or agent execution when the backend has not confirmed it.
- Preserve loading, empty, error, success, and permission-denied states.
- Enforce authorization on the backend; frontend role checks are not a security boundary.

### Change Control
- Before editing a screen, compare the existing React implementation with its corresponding Stitch reference.
- Prefer incremental changes over full-page rewrites.
- Preserve existing user changes and working functionality.
- Do not remove existing pages or components without verifying their purpose.
- Run available tests and build checks after integration.
- Report visual deviations, missing APIs, placeholders, and unresolved issues explicitly.


## Next.js Architecture, RBAC and Refactoring

### Framework decision
- Evaluate the existing frontend before choosing or migrating frameworks.
- If adopting Next.js, use the App Router and TypeScript unless the existing project or a documented constraint justifies another approach.
- Preserve the Google Stitch screens and design tokens when converting them into Next.js components.
- Do not perform a framework migration without first documenting its impact, dependencies, risks, and migration plan.
- Never discard working functionality merely to conform to a proposed directory structure.

### Authentication and role-based access
- Every authenticated user must receive navigation and page access based on verified identity, organization membership, workspace membership, roles, and permissions.
- Define a centralized permission model. Avoid scattered hardcoded role checks throughout components.
- Protect server-rendered pages, server actions, route handlers, and API operations using the appropriate authorization checks.
- Use middleware or proxy logic only as an additional routing layer, not as the sole authorization mechanism.
- Enforce authorization and tenant isolation on the backend for every protected resource and action.
- Distinguish authentication (who the user is) from authorization (what the user can do).
- Deny access by default when permissions are missing or cannot be verified.
- Do not trust roles, tenant IDs, or permissions supplied by client-side state.
- Prevent users from accessing another user's or organization's resources by manipulating URLs or request parameters.
- Do not expose secrets, session tokens, or privileged credentials to client-side code.

### Refactorability
- Organize code by feature and responsibility.
- Keep shared UI components independent of business-specific authorization logic where practical.
- Centralize API communication, error handling, authentication utilities, and permission checks.
- Prefer typed interfaces, small components, explicit contracts, and testable services.
- Avoid oversized page components, duplicate business logic, circular imports, and unnecessary abstractions.
- Introduce changes incrementally and preserve existing behavior.
- Add tests for role-based navigation, direct URL access, unauthorized API requests, tenant isolation, and critical workflows.

### Agent responsibilities
- The frontend orchestrator coordinates framework migration, module boundaries, and integration.
- The UI/UX architect preserves the Stitch design system.
- The authentication/RBAC agent defines role-aware navigation and protected-page behavior.
- The component engineer builds reusable UI components.
- The API integration agent verifies frontend/backend contracts.
- The QA/security agent tests access restrictions, session handling, and cross-tenant isolation.
- All agents must agree on shared types, permissions, design tokens, and component interfaces before parallel changes.

