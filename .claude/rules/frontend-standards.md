# OpsPilot Frontend Engineering Standards

## 1. Repository conventions
- Inspect the repository before modifying it.
- Preserve the existing framework, build system, package manager, and style conventions.
- Prefer minimal, focused changes.
- Do not introduce dependencies without a clear benefit.
- Do not overwrite user changes or unrelated files.

## 2. Architecture
- Separate presentation, data access, and business behavior where practical.
- Reuse existing routing, state management, and component patterns.
- Keep components focused and testable.
- Centralize API behavior instead of scattering fetch logic across screens.
- Avoid unnecessary global state and duplicated business logic.

## 3. Design system
Use existing tokens when available. Otherwise, the default OpsPilot dark palette is:
- Background: #0B1120
- Surface: #151F32
- Indigo: #6366F1
- Cyan: #22D3EE
- Violet: #A78BFA
- Main text: #F8FAFC
- Secondary text: #94A3B8
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444

Use neon accents sparingly. Never communicate status by color alone.

## 4. Responsive design
- Support desktop, tablet, and mobile layouts.
- Avoid unintended horizontal scrolling.
- Make tables and complex dashboards usable at narrow widths.
- Provide clear navigation and sensible content hierarchy.

## 5. Accessibility
- Prefer semantic HTML.
- Provide labels for inputs and accessible names for icon buttons.
- Support keyboard navigation and visible focus states.
- Manage dialog focus correctly.
- Respect reduced-motion preferences.
- Maintain readable contrast and meaningful status text.

## 6. UI states
Handle applicable:
- Initial loading
- Background refresh
- Empty data
- Validation errors
- API errors and timeouts
- Permission denied
- Session expiry
- Success and confirmation
- Disabled or unavailable actions

Never display fake production success states.

## 7. API integration
- Verify endpoints and schemas before use.
- Use centralized API configuration.
- Validate payloads at appropriate boundaries.
- Handle 401, 403, validation errors, server errors, and network failures.
- Do not retry unsafe operations without an idempotency strategy.
- Avoid unnecessary polling.

## 8. Authentication and multi-tenancy
- Backend authorization is authoritative.
- Frontend role checks only control the user experience.
- Treat tenant and workspace identifiers from the browser as untrusted.
- Clear scoped UI state when changing organizations or signing out.
- Never leak data from one tenant into another tenant's screens.

## 9. Secrets and sensitive operations
- Never commit API keys, tokens, passwords, or private keys.
- Never expose secrets through public frontend environment variables.
- Avoid logging credentials or sensitive response data.
- Use backend-managed cloud credentials and approved identity flows.
- Require explicit confirmation for sensitive operations.
- Follow backend approval and authorization policies.

## 10. Testing
- Add or update tests for meaningful changes.
- Run the project's actual test, lint, type-check, and build commands when available.
- Report commands that could not run.
- Do not claim success without evidence.
