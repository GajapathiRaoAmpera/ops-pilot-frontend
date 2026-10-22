import { NextResponse, type NextRequest } from "next/server";
import { isGuardBypassed } from "@/features/auth/dev-bypass";

/**
 * Routing convenience only: sends cookie-less visitors to /login early (except the landing page at "/").
 * Authorization happens in server components (requireSession) and on the backend.
 */
export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/") return NextResponse.next(); // the public landing page
  if (!isGuardBypassed() && req.cookies.size === 0) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const dest = req.nextUrl.pathname + req.nextUrl.search;
    if (dest !== "/") url.searchParams.set("next", dest);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Public files must stay reachable when signed out (the browser asks for the favicon on the sign-in page).
  matcher: ["/((?!login|accept-invite|api|_next|favicon.ico|icon|apple-icon|robots.txt).*)"],
};
