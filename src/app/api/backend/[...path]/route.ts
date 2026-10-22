import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFetch } from "@/features/auth/server/backend";
import { isSameOrigin } from "@/features/auth/server/origin";

/**
 * Narrow same-origin relay from client components to the backend. The browser never learns the backend
 * URL and never sees its Set-Cookie. Only these route shapes may pass; the backend still authorizes
 * every call (this allowlist is NOT a security boundary, just least exposure).
 */
const ALLOWED: RegExp[] = [
  /^org\/(members|invitations|workspaces)(\/[0-9a-f-]{36})?$/,
  /^org\/(memberships)\/[0-9a-f-]{36}$/,
  /^org\/members\/[0-9a-f-]{36}\/reset-link$/,
  /^platform\/organizations$/,
  /^invitations\/(accept|accept-existing|[A-Za-z0-9_-]{20,200})$/,
  /^workspaces\/[0-9a-f-]{36}\/(members|invitations)$/,
  /^workspaces\/[0-9a-f-]{36}\/memberships\/[0-9a-f-]{36}$/,
  /^auth\/change-password$/,
  /^workspaces\/[0-9a-f-]{36}\/integrations\/github(\/test|\/repositories(\/[0-9a-f-]{36})?)?$/,
  /^workspaces\/[0-9a-f-]{36}\/cloud\/gcp(\/test|\/inventory)?$/,
  /^workspaces\/[0-9a-f-]{36}\/investigations(\/status)?$/,
  /^workspaces\/[0-9a-f-]{36}\/pipelines\/(sync|runs)$/,
  /^workspaces\/[0-9a-f-]{36}\/action-requests$/,
  /^workspaces\/[0-9a-f-]{36}\/approvals$/,
  /^workspaces\/[0-9a-f-]{36}\/approvals\/[0-9a-f-]{36}\/decision$/,
  /^workspaces\/[0-9a-f-]{36}\/overview$/,
  /^workspaces\/[0-9a-f-]{36}\/executions$/,
  /^audit-events$/,
  /^rbac\/matrix$/,
  /^meta\/roles$/,
];
/** Only these query keys are forwarded (filters/pagination); everything else is dropped. */
const QUERY_KEYS = ["status", "limit", "action", "outcome", "before_id", "runId"];
const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

async function relay(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const path = (await ctx.params).path.join("/");
  if (!METHODS.has(req.method) || !ALLOWED.some((re) => re.test(path))) {
    return NextResponse.json({ detail: "not_found" }, { status: 404 });
  }
  if (req.method !== "GET" && !isSameOrigin(req)) {
    return NextResponse.json({ detail: "forbidden_origin" }, { status: 403 });
  }
  const search = new URLSearchParams();
  for (const k of QUERY_KEYS) {
    const v = new URL(req.url).searchParams.get(k);
    if (v !== null && v.length <= 100) search.set(k, v);
  }
  const qs = search.size ? `?${search}` : "";
  const headers: Record<string, string> = { cookie: (await cookies()).toString() };
  let body: string | undefined;
  if (req.method !== "GET") {
    headers["content-type"] = "application/json";
    body = await req.text();
  }
  try {
    const upstream = await backendFetch(`/${path}${qs}`, { method: req.method, headers, body });
    const text = await upstream.text();
    return new NextResponse(text || null, {
      status: upstream.status,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json({ detail: "unavailable" }, { status: 503 });
  }
}

export { relay as GET, relay as POST, relay as PUT, relay as PATCH, relay as DELETE };
