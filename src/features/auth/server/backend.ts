import "server-only";

const TIMEOUT_MS = 8000;

function baseUrl(): string {
  const url = process.env.OPSPILOT_API_URL;
  if (!url) throw new Error("OPSPILOT_API_URL is not configured");
  return url.replace(/\/$/, "");
}

/** Server-to-backend fetch. Never log bodies or cookies here. */
export function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}
