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
  invalid_repo: "Enter the repository as owner/name, for example acme/api.",
  invalid_token: "That token does not look valid.",
  encryption_not_configured: "The server is not configured to store credentials yet. Ask the platform operator to set OPSPILOT_SECRET_KEY.",
  integration_not_connected: "Connect GitHub for this workspace first.",
  github_not_configured: "No GitHub token is set for this workspace.",
  sync_too_frequent: "Synced a moment ago. Try again in a few seconds.",
  upstream_error: "GitHub did not accept the request. Check the repository and token permissions.",
  run_not_failed: "Only failed runs can be re-run.",
  request_already_open: "A request for this run is already open.",
  separation_of_duties: "You cannot approve a request you made yourself.",
  not_pending: "This request was already decided.",
  invalid_key: "That is not a valid service-account key file. Download the JSON key from Google Cloud and select it again.",
  key_unreadable: "The stored key cannot be read (the server key changed). Upload the service-account key again.",
  too_many_repositories: "This workspace has reached its repository limit. Remove one, or use another workspace.",
  ai_not_configured: "AI investigations are not set up. Ask the platform operator to set OPSPILOT_GROQ_API_KEY.",
  ai_unauthorized: "The AI provider rejected the server's API key. Ask the platform operator to check it.",
  ai_rate_limited: "Too many investigations in a short time. Wait a minute and try again.",
  ai_model_unavailable: "The configured AI model is not available to this API key. Set OPSPILOT_GROQ_MODEL to a model the key can use.",
  ai_unavailable: "The AI provider could not be reached. Try again shortly.",
  ai_bad_output: "The AI returned an answer OpsPilot could not use. Try again.",
  proposal_not_found: "That fix proposal no longer exists. Propose a fix again.",
  proposal_has_no_fix: "This proposal has no code change to open as a pull request.",
  run_commit_unknown: "The run's commit is unknown. Sync Pipelines and try again.",
  user_in_other_organizations: "This person also belongs to another organization, so only they can reset their own password.",
  cannot_block_self: "You cannot block yourself.",
  cannot_block_platform_admin: "Platform administrators are managed on the server, not here.",
  use_change_password: "To change your own password, use Change password while signed in.",
  organization_not_active: "This organization is blocked or archived. Reactivate it first.",
  block_before_delete: "Block the organization first, then delete it.",
  confirmation_mismatch: "The name you typed does not match the organization's name.",
  unavailable: "The service is temporarily unavailable. Please try again.",
};

/** Technical reference for toasts and support: HTTP status plus the backend's error code. */
export function referenceFor(r: { status: number; detail: string }): string {
  return `${r.status || "no response"} ${r.detail}`;
}

export function messageFor(detail: string): string {
  return MESSAGES[detail] ?? "That did not work. Please check the details and try again.";
}

export function inviteUrl(token: string): string {
  return `${window.location.origin}/accept-invite?token=${encodeURIComponent(token)}`;
}
