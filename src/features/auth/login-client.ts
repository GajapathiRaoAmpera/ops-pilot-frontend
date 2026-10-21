import type { LoginCredentials, LoginErrorBody, LoginErrorCode, LoginSuccessBody } from "./types";

export const LOGIN_ERROR_MESSAGES: Record<LoginErrorCode, string> = {
  invalid_credentials: "The email or password is incorrect.",
  rate_limited: "Too many sign-in attempts. Please wait a moment and try again.",
  unavailable: "Sign-in is temporarily unavailable. Please try again shortly.",
  forbidden_origin: "This request was blocked. Reload the page and try again.",
  unknown: "Something went wrong. Please try again.",
};

export type LoginOutcome =
  | { ok: true; redirectTo: string }
  | { ok: false; error: LoginErrorCode };

export async function submitLogin(
  credentials: LoginCredentials,
  next: string | null,
): Promise<LoginOutcome> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ ...credentials, next }),
    });
    const body = (await res.json().catch(() => null)) as LoginSuccessBody | LoginErrorBody | null;
    if (res.ok && body && "redirectTo" in body) return { ok: true, redirectTo: body.redirectTo };
    return { ok: false, error: body && "error" in body ? body.error : "unknown" };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = "Enter your work email.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}
