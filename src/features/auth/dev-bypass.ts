import { PERMISSIONS } from "./permissions";
import type { Session } from "./types";

/**
 * Local UI-preview switch while the backend does not exist. Set
 * OPSPILOT_AUTH_GUARD=off in .env.local. Ignored in production builds.
 * It only skips the frontend guards; it never authenticates against anything.
 */
export function isGuardBypassed(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.OPSPILOT_AUTH_GUARD === "off";
}

export const PREVIEW_SESSION: Session = {
  user: { id: "preview", email: "preview@localhost", name: "UI Preview" },
  role: "Preview (guards off)",
  organization: { id: "preview", name: "Preview Organization" },
  permissions: Object.values(PERMISSIONS),
};
