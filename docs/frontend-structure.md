# Frontend structure

```
src/
  app/                      Routing only: thin pages that compose components
    login/                  /login (gateway chooser), /login/[gateway]
    api/auth/               Same-origin relay to the backend (login, logout)
    (app)/                  Authenticated shell (layout does requireSession)
      (shared)/             overview, settings, unauthorized   - any role
      (devops)/             pipelines, automation, copilot     - DevOps Engineer
      (org-admin)/          rbac, approvals                    - Org/Platform Admin
      (auditor)/            audit                              - Security Auditor
      (platform-admin)/     (none yet; add tenant/org pages here when specified)
  components/
    ui/                     Generic primitives: Button, TextField, Notice, Icon
    layout/                 AppShell, GatewayShell, AuthBackground, PlaceholderPage, PreviewBanner
  features/auth/            Auth domain: permissions, navigation, session, login form, gateways
    components/<Name>/      Name.tsx + Name.module.scss side by side
  styles/                   _tokens.scss (Stitch tokens), _mixins.scss, globals.scss
  lib/                      cx, api-client
```

## Rules

- Route groups `(...)` organise code by role; URLs stay flat (`/rbac`, `/audit`).
  The folder is NOT the security boundary: every page calls `requireSession(PERMISSION)`
  and the backend enforces authorization.
- A page's required permission lives in `features/auth/navigation.ts` / `permissions.ts`
  (single source), not in the folder name.
- Styling is SCSS modules next to each component, using `var(--color-*)` tokens emitted from
  `styles/_tokens.scss`. Use `@use "mixins"` for breakpoints, focus ring and reduced motion.
- `components/ui` and `components/layout` must not import from `features/*`.
