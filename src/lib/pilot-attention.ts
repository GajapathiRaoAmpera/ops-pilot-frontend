/** What the person is reading right now (an "i" card is open), for decorative listeners such as Pilot. */
export interface InfoFocus {
  title: string;
  /** Centre of the "i" button in viewport pixels, so Pilot can look at it. */
  x: number;
  y: number;
}

const EVENT = "opspilot:info-focus";

/** `null` means the card closed. */
export function emitInfoFocus(detail: InfoFocus | null): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<InfoFocus | null>(EVENT, { detail }));
}

export function onInfoFocus(fn: (d: InfoFocus | null) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<InfoFocus | null>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
