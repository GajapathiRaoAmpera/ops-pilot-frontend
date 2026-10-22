import { landingPath, visibleNavItems } from "@/features/auth/navigation";

/** Where to go after the active organization or workspace changed: stay if the new role still allows this page. */
export function destinationAfterSwitch(pathname: string, permissions: readonly string[] | undefined): string | null {
  if (!permissions) return null; // unknown: just refresh in place
  const allowed = visibleNavItems(permissions).some((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  return allowed ? null : landingPath(permissions) ?? "/unauthorized";
}
