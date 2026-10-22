/**
 * Auth contract between the frontend and the (not yet built) FastAPI backend.
 * UNVERIFIED: shapes below are the frontend's proposal; see docs/auth-contract.md.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: SessionUser;
  /** Display label only. Authorization is decided by `permissions`. */
  role: string;
  organization: { id: string; name: string };
  permissions: readonly string[];
  /** Every organization the user belongs to, with their role there. Switching changes `organization`. */
  organizations: readonly { id: string; name: string; role: string }[];
  /** Workspaces the user can access in the active organization (backend-provided). */
  workspaces: readonly { id: string; name: string; role: string }[];
  /** The backend's validated choice of active workspace; `permissions` and `role` apply to it. */
  activeWorkspaceId: string | null;
  /** True after an operator bootstrap: the backend blocks everything until the password is changed. */
  mustChangePassword: boolean;
}

export type SessionResult =
  | { status: "authenticated"; session: Session }
  | { status: "unauthenticated" }
  | { status: "error" };

export interface LoginCredentials {
  email: string;
  password: string;
}

export type LoginErrorCode =
  | "invalid_credentials"
  | "rate_limited"
  | "unavailable"
  | "forbidden_origin"
  | "unknown";

export interface LoginSuccessBody {
  redirectTo: string;
}

export interface LoginErrorBody {
  error: LoginErrorCode;
}
