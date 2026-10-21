# OpsPilot Frontend Agent Implementation Plan

## Phase 1 — Discovery
Owner: frontend-orchestrator
- Inspect repository and package scripts.
- Map routes, components, authentication, APIs, and tests.
- Identify existing design conventions.
- Record unknown backend contracts.

Acceptance: a repository-specific plan exists before implementation.

## Phase 2 — Design foundation
Owner: ui-ux-architect
- Define tokens, layouts, navigation, responsive rules, and accessibility patterns.

Owner: react-component-engineer
- Implement shared primitives and the application shell.

Acceptance: shared patterns are consistent and existing routes still work.

## Phase 3 — Access and tenancy
Owner: auth-rbac-ui-engineer
- Implement verified authentication behavior, protected routes, and role-aware UI.
- Add organization/workspace selection if supported by backend contracts.

Acceptance: navigation reflects verified permissions and tenant changes refresh scoped state.

## Phase 4 — Feature interfaces
Owner: cloud-dashboard-engineer
- Build cloud account and infrastructure views.

Owner: devops-automation-ui-engineer
- Build pipelines, jobs, logs, deployments, and approvals.

Owner: ai-agent-ui-engineer
- Build agent monitoring, orchestration runs, tool activity, and approval interfaces.

Acceptance: features distinguish real backend data from unavailable or demo data.

## Phase 5 — Backend integration
Owner: api-integration-engineer
- Verify actual endpoints and schemas.
- Centralize API behavior.
- Connect screens and handle errors, timeouts, and authorization responses.

Acceptance: no fabricated production endpoint or success response is used.

## Phase 6 — Quality gate
Owner: frontend-qa-security-engineer
- Run relevant tests, linting, type checks, and production build.
- Review accessibility, tenant isolation, secrets, and sensitive actions.
- Report confirmed defects and unresolved risks.

Owner: frontend-orchestrator
- Resolve integration issues and publish the final report.

Acceptance: verification results are accurate and outstanding failures are documented.

## Collaboration rules
- Parallelize independent analysis.
- Agree on shared component contracts before concurrent feature work.
- Assign one primary writer per shared file.
- Avoid simultaneous edits to the router, design tokens, API client, and global styles.
- Review changes before merging or integrating them.
