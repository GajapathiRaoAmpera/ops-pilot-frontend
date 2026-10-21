import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFetch } from "@/features/auth/server/backend";
import { isSameOrigin } from "@/features/auth/server/origin";

/** Ends the session on the backend (`POST /auth/logout`, unverified) and relays cookie clearing. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });

  const store = await cookies();
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  try {
    const upstream = await backendFetch("/auth/logout", {
      method: "POST",
      headers: { cookie: store.toString() },
    });
    for (const c of upstream.headers.getSetCookie()) res.headers.append("set-cookie", c);
  } catch {
    // Backend unreachable: still drop local cookies so the UI is signed out.
  }
  for (const c of store.getAll()) res.cookies.delete(c.name);
  return res;
}
