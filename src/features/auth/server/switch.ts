import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchSession } from "./session";

/**
 * Sets one scope cookie (and clears others), then asks the backend for the session it now implies, so the client
 * can stay on the current page only if the new role still allows it. Cookies are hints; the backend validates them.
 */
export async function switchScope(set: Record<string, string>, clear: string[] = []): Promise<NextResponse> {
  const store = await cookies();
  const jar = new Map(store.getAll().map((c) => [c.name, c.value]));
  for (const k of clear) jar.delete(k);
  for (const [k, v] of Object.entries(set)) jar.set(k, v);
  const header = [...jar].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("; ");
  const next = await fetchSession(header);
  const res = NextResponse.json(next.status === "authenticated" ? { ok: true, permissions: next.session.permissions } : { ok: true });
  const secure = process.env.NODE_ENV === "production";
  for (const [k, v] of Object.entries(set)) res.cookies.set(k, v, { httpOnly: true, sameSite: "lax", path: "/", secure });
  for (const k of clear) res.cookies.delete(k);
  return res;
}
