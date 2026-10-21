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

/** Role names and where they can be granted. Served by the backend (`GET /meta/roles`): never hardcoded here. */
export interface RoleCatalog {
  roles: { key: string; label: string }[];
  workspaceRoles: string[];
  wsAdminGrantable: string[];
}
