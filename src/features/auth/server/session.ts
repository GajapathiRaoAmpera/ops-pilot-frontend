import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch } from "./backend";
import { isGuardBypassed, PREVIEW_SESSION } from "../dev-bypass";
import { hasAnyPermission, hasPermission } from "../permissions";
import { parseSession } from "../session-parser";
import type { Session, SessionResult } from "../types";

/** Validates the session cookie with the backend (`GET /auth/me`, unverified contract). */
export async function fetchSession(cookieHeader: string): Promise<SessionResult> {
  if (!cookieHeader) return { status: "unauthenticated" };
  try {
    const res = await backendFetch("/auth/me", { headers: { cookie: cookieHeader } });
    if (res.status === 401) return { status: "unauthenticated" };
    if (res.status === 403) return { status: "blocked" }; // blocked by an administrator (or the organization is)
    if (!res.ok) return { status: "error" };
    const session = parseSession(await res.json());
    return session ? { status: "authenticated", session } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export const getSession = cache(async (): Promise<SessionResult> => {
  const store = await cookies();
  return fetchSession(store.toString());
});

/** Page-level guard. Unauthenticated -> /login, missing permission -> /unauthorized. */
export async function requireSession(permission?: string): Promise<Session> {
  if (isGuardBypassed()) return PREVIEW_SESSION;
  const result = await getSession();
  if (result.status === "unauthenticated") redirect("/login?reason=expired");
  if (result.status === "blocked") redirect("/login?reason=blocked");
  if (result.status === "error") redirect("/login?reason=unavailable");
  if (result.session.mustChangePassword) redirect("/change-password");
  if (permission && !hasPermission(result.session.permissions, permission)) {
    redirect("/unauthorized");
  }
  return result.session;
}

/** Like requireSession, but any one of several permissions suffices (e.g. org or workspace admin). */
export async function requireAnySession(permissions: readonly string[]): Promise<Session> {
  if (isGuardBypassed()) return PREVIEW_SESSION;
  const result = await getSession();
  if (result.status === "unauthenticated") redirect("/login?reason=expired");
  if (result.status === "blocked") redirect("/login?reason=blocked");
  if (result.status === "error") redirect("/login?reason=unavailable");
  if (result.session.mustChangePassword) redirect("/change-password");
  if (!hasAnyPermission(result.session.permissions, permissions)) redirect("/unauthorized");
  return result.session;
}
