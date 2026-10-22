import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/server/session";
import { isSameOrigin } from "@/features/auth/server/origin";
import { switchScope } from "@/features/auth/server/switch";
import { ORGANIZATION_COOKIE, WORKSPACE_COOKIE } from "@/features/auth/server/workspace";

/** Switches the active organization. Only one the user belongs to; the old workspace choice is dropped with it. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  const result = await getSession();
  if (result.status !== "authenticated") return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: unknown };
  if (typeof id !== "string" || !result.session.organizations.some((o) => o.id === id)) {
    return NextResponse.json({ error: "unknown_organization" }, { status: 404 });
  }
  return switchScope({ [ORGANIZATION_COOKIE]: id }, [WORKSPACE_COOKIE]);
}
