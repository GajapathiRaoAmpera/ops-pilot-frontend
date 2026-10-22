/** Things that really happened (the backend-confirmed results shown as toasts), for listeners such as Pilot. */
export interface ActivityEvent { tone: "success" | "error" | "info"; title: string; at: number }

const EVENT = "opspilot:activity";

export function emitActivity(e: Omit<ActivityEvent, "at">): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<ActivityEvent>(EVENT, { detail: { ...e, at: Date.now() } }));
}

export function onActivity(fn: (e: ActivityEvent) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<ActivityEvent>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
