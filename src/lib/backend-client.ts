/** Browser helper for the same-origin /api/backend relay. Returns the backend's detail code on failure. */
export type CallResult<T> = { ok: true; data: T } | { ok: false; status: number; detail: string };

export async function callBackend<T>(method: string, path: string, body?: unknown): Promise<CallResult<T>> {
  try {
    const res = await fetch(`/api/backend/${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (res.ok) return { ok: true, data: json as T };
    return { ok: false, status: res.status, detail: typeof json?.detail === "string" ? json.detail : "unknown" };
  } catch {
    return { ok: false, status: 0, detail: "unavailable" };
  }
}

const MESSAGES: Record<string, string> = {
  already_member: "That person already has access here.",
  email_unavailable: "That email cannot be used.",
  organization_exists: "An organization with that name already exists.",
  workspace_exists: "A workspace with that name already exists.",
  role_not_grantable: "You cannot grant or change a role at or above your own level.",
  role_not_allowed_for_workspace: "That role applies to the whole organization, not a single workspace.",
  last_org_admin: "An organization must keep at least one administrator.",
  cannot_change_own_role: "You cannot change your own role.",
  cannot_remove_self: "You cannot remove yourself.",
  cannot_disable_self: "You cannot disable your own account.",
  invalid_or_expired: "This link is invalid, expired, or already used.",
  account_exists: "An account with this email already exists. Sign in to join.",
  forbidden: "You do not have permission to do that.",
  unavailable: "The service is temporarily unavailable. Please try again.",
};

export function messageFor(detail: string): string {
  return MESSAGES[detail] ?? "That did not work. Please check the details and try again.";
}

export function inviteUrl(token: string): string {
  return `${window.location.origin}/accept-invite?token=${encodeURIComponent(token)}`;
}
