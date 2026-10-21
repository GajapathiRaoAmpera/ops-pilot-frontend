# Auth contract (PROPOSED, UNVERIFIED)

No backend exists yet. The frontend assumes the following; change it here and in
`src/features/auth/` when the FastAPI contract is defined. Nothing here is fabricated
at runtime: without a backend, sign-in fails with "temporarily unavailable".

| Call | Request | Success | Failure |
|---|---|---|---|
| `POST /auth/login` | `{ email, password }` | 200 + `Set-Cookie` (HttpOnly, Secure, SameSite=Lax) | 401/400/422 bad credentials, 429 rate limit |
| `GET /auth/me` (cookie) | none | 200 `{ user:{id,email,name}, role, organization:{id,name}, permissions:string[] }` | 401 no/expired session |
| `POST /auth/logout` (cookie) | none | 200 + cookie cleared | |

- Browser never talks to the backend directly: `/api/auth/login|logout` route handlers relay
  (same-origin check, cookie forwarded, no token in response bodies). Configure `OPSPILOT_API_URL` (server only).
- `permissions` are `domain:resource:action` strings (see `permissions.ts`); `role` is a display label. One role per user.
- Backend must enforce authorization and org/workspace isolation on every endpoint; the UI guards are UX only.
- Not supported until the backend defines it: forgot-password, MFA, multiple roles, workspace switching.

## Backend draft (Phase 1)
The backend repo now holds a draft of the wider API, data model and threat model in
`../ops-pilot-backend/docs/` (`api-contract.md`, `data-model.md`, `threat-model.md`).
Proposed change: `GET /auth/me` also returns `workspaces:[{id,name,role}]`. Still PROPOSED and unimplemented.
