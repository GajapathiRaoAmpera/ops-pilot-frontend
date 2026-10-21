/** Display metadata only. Which roles a user may grant is decided by the backend. */
export const ROLE_LABELS: Record<string, string> = {
  org_admin: "Organization Administrator",
  workspace_admin: "Workspace Administrator",
  devops_engineer: "DevOps Engineer",
  developer: "Developer",
  security_auditor: "Security Auditor",
  viewer: "Viewer",
};

export const WORKSPACE_ROLE_KEYS = ["workspace_admin", "devops_engineer", "developer", "viewer"] as const;
export const WS_ADMIN_GRANTABLE_KEYS = ["devops_engineer", "developer", "viewer"] as const;
export const ORG_ROLE_KEYS = ["org_admin", "workspace_admin", "devops_engineer", "developer", "security_auditor", "viewer"] as const;

export interface MemberRow {
  membershipId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  roleLabel: string;
  workspaceId: string | null;
  workspace: string | null;
  disabled: boolean;
}
