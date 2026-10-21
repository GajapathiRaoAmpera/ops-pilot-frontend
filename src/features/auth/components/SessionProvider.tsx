"use client";

import { createContext, useContext, type ReactNode } from "react";
import { hasPermission } from "../permissions";
import type { Session } from "../types";

const SessionContext = createContext<Session | null>(null);

/** Carries the server-validated session to client components for UX gating only. */
export function SessionProvider({ session, children }: { session: Session; children: ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): Session | null {
  return useContext(SessionContext);
}

export function usePermission(permission: string): boolean {
  return hasPermission(useSession()?.permissions, permission);
}

/** Renders children only when the permission is held; denies by default. */
export function Can({ permission, children, fallback = null }: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return usePermission(permission) ? <>{children}</> : <>{fallback}</>;
}
