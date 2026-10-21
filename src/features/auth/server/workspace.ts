import "server-only";
import { cookies } from "next/headers";
import type { Session } from "../types";

export const WORKSPACE_COOKIE = "opspilot_ws";

/** The workspace the UI is focused on. The cookie is only a hint: it must match one of the session's workspaces. */
export async function getActiveWorkspace(session: Session): Promise<{ id: string; name: string; role: string } | undefined> {
  const wanted = (await cookies()).get(WORKSPACE_COOKIE)?.value;
  return session.workspaces.find((w) => w.id === wanted) ?? session.workspaces[0];
}
