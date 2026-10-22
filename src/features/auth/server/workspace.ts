import "server-only";
import { cookies } from "next/headers";
import type { Session } from "../types";

export const WORKSPACE_COOKIE = "opspilot_ws";
export const ORGANIZATION_COOKIE = "opspilot_org";

/** The workspace the UI is focused on: the backend's validated choice (the cookie is only a hint to it). */
export async function getActiveWorkspace(session: Session): Promise<{ id: string; name: string; role: string } | undefined> {
  const chosen = session.workspaces.find((w) => w.id === session.activeWorkspaceId);
  if (chosen) return chosen;
  const wanted = (await cookies()).get(WORKSPACE_COOKIE)?.value; // older backend without activeWorkspaceId
  return session.workspaces.find((w) => w.id === wanted) ?? session.workspaces[0];
}
