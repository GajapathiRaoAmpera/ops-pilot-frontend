import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/server/session";
import { isSameOrigin } from "@/features/auth/server/origin";
import { WORKSPACE_COOKIE } from "@/features/auth/server/workspace";

/** Remembers the focused workspace. Accepts only an id that belongs to the signed-in user. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  const result = await getSession();
  if (result.status !== "authenticated") return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: unknown };
  if (typeof id !== "string" || !result.session.workspaces.some((w) => w.id === id)) {
    return NextResponse.json({ error: "unknown_workspace" }, { status: 404 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(WORKSPACE_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" });
  return res;
}
