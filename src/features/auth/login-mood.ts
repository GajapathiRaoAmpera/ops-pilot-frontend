/** What the sign-in form is doing, broadcast for decorative listeners (the robot). Never carries field values. */
export type LoginMood = "idle" | "email" | "password" | "peek" | "thinking" | "error" | "success";

export interface LoginMoodDetail {
  mood: LoginMood;
  /** 0..1: how far along the email the caret is, so eyes can follow the typing. Length only, never content. */
  look?: number;
}

const EVENT = "opspilot:login-mood";

export function emitLoginMood(detail: LoginMoodDetail): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<LoginMoodDetail>(EVENT, { detail }));
}

export function onLoginMood(fn: (d: LoginMoodDetail) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<LoginMoodDetail>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
