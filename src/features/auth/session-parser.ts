import type { Session } from "./types";

const isString = (v: unknown): v is string => typeof v === "string" && v.length > 0;

/** Validates the untrusted /auth/me payload; returns null if it is malformed. */
export function parseSession(data: unknown): Session | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  const user = d.user as Record<string, unknown> | undefined;
  const org = d.organization as Record<string, unknown> | undefined;
  if (!user || !org) return null;
  if (!isString(user.id) || !isString(user.email) || !isString(user.name)) return null;
  if (!isString(org.id) || !isString(org.name) || !isString(d.role)) return null;
  if (!Array.isArray(d.permissions) || !d.permissions.every((p) => typeof p === "string")) return null;
  return {
    user: { id: user.id, email: user.email, name: user.name },
    role: d.role,
    organization: { id: org.id, name: org.name },
    permissions: d.permissions as string[],
  };
}
