export class PermissionError extends Error {
  constructor() {
    super("You do not have permission to perform this action.");
    this.name = "PermissionError";
  }
}

export class ApiError extends Error {
  constructor(public status: number) {
    super(`Request failed (${status})`);
    this.name = "ApiError";
  }
}

/**
 * Central browser-side API helper. 401 -> back to sign-in; 403 -> PermissionError.
 * Unsafe methods are never retried automatically.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, { ...init, credentials: "same-origin" });
  if (res.status === 401) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload clears scoped client state
    window.location.href = "/login?reason=expired";
    throw new ApiError(401);
  }
  if (res.status === 403) throw new PermissionError();
  if (!res.ok) throw new ApiError(res.status);
  return (await res.json()) as T;
}
