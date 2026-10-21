/**
 * Role-gateway entry points from the Stitch login prototypes. The gateway a user
 * picks is a presentation hint ONLY: it is never sent to the backend and never
 * grants anything. The role and landing page come from the backend session.
 */
export interface Gateway {
  slug: string;
  title: string;
  roleLabel: string;
  icon: string;
  summary: string;
  /** Descriptive areas this role typically works in (from Stitch); not an entitlement list. */
  areas: readonly string[];
  cta: string;
}

export const GATEWAYS: readonly Gateway[] = [
  {
    slug: "platform-admin",
    title: "Platform Super Admin",
    roleLabel: "Platform Administrator",
    icon: "key",
    summary: "Root governance and multi-tenant administration for the OpsPilot platform.",
    areas: ["Multi-tenant federation", "Cross-org partitioning", "Platform-wide settings"],
    cta: "Sign in as Platform Admin",
  },
  {
    slug: "org-admin",
    title: "Organization Admin",
    roleLabel: "Organization Administrator",
    icon: "shield_person",
    summary: "Tenant administration, RBAC changes and dual-sign-off approvals for your organization.",
    areas: ["RBAC management", "Tenant policies", "Approvals"],
    cta: "Sign in as Organization Admin",
  },
  {
    slug: "devops",
    title: "DevOps Lead / Engineer",
    roleLabel: "DevOps Engineer",
    icon: "terminal",
    summary: "CI/CD pipelines, runbook execution and incident response across your workspaces.",
    areas: ["CI/CD pipelines", "Runbooks & automation", "AI Copilot"],
    cta: "Sign in to the Command Center",
  },
  {
    slug: "auditor",
    title: "Security & SOX Auditor",
    roleLabel: "Security Auditor",
    icon: "fact_check",
    summary: "Read-only access to audit trails and compliance evidence.",
    areas: ["Audit trail", "RBAC change history", "Compliance reports"],
    cta: "Sign in to the Audit Portal",
  },
];

export function findGateway(slug: string): Gateway | undefined {
  return GATEWAYS.find((g) => g.slug === slug);
}
