import { NextResponse } from "next/server";
import { backendFetch } from "@/features/auth/server/backend";
import { fetchSession } from "@/features/auth/server/session";
import { isSameOrigin } from "@/features/auth/server/origin";
import { isGuardBypassed, PREVIEW_SESSION } from "@/features/auth/dev-bypass";
import { landingPath, safeNextPath } from "@/features/auth/navigation";
import type { LoginErrorBody, LoginErrorCode, LoginSuccessBody } from "@/features/auth/types";

const fail = (error: LoginErrorCode, status: number) =>
  NextResponse.json<LoginErrorBody>({ error }, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Relays credentials to the backend (`POST /auth/login`, unverified contract).
 * The backend is expected to set the HttpOnly session cookie; it is forwarded
 * untouched. Credentials and tokens are never logged or returned in the body.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return fail("forbidden_origin", 403);

  let email: unknown;
  let password: unknown;
  let next: unknown;
  try {
    ({ email, password, next } = await req.json());
  } catch {
    return fail("invalid_credentials", 400);
  }
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return fail("invalid_credentials", 400);
  }

  // Dev-only UI preview (OPSPILOT_AUTH_GUARD=off): no backend exists, so skip it. Never active in production.
  if (isGuardBypassed()) {
    const dest = safeNextPath(typeof next === "string" ? next : null) ?? landingPath(PREVIEW_SESSION.permissions);
    return NextResponse.json<LoginSuccessBody>({ redirectTo: dest ?? "/overview" });
  }

  let upstream: Response;
  try {
    upstream = await backendFetch("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return fail("unavailable", 503);
  }

  if (upstream.status === 401 || upstream.status === 400 || upstream.status === 422) {
    return fail("invalid_credentials", 401);
  }
  if (upstream.status === 429) return fail("rate_limited", 429);
  if (!upstream.ok) return fail("unavailable", 503);

  const setCookies = upstream.headers.getSetCookie();
  if (setCookies.length === 0) return fail("unavailable", 503);

  // Resolve the landing page from the trusted session, never from client input.
  const cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");
  const result = await fetchSession(cookieHeader);
  if (result.status !== "authenticated") return fail("unavailable", 503);

  const landing = landingPath(result.session.permissions);
  const requested = safeNextPath(typeof next === "string" ? next : null);
  const res = NextResponse.json<LoginSuccessBody>(
    { redirectTo: requested ?? landing ?? "/unauthorized" },
    { headers: { "Cache-Control": "no-store" } },
  );
  for (const c of setCookies) res.headers.append("set-cookie", c);
  return res;
}
