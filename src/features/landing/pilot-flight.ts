/** Where the landing page's Pilot flies to while the reader scrolls. Pure geometry, so it can be tested. */

export type Side = "left" | "right";

export interface Waypoint { x: number; y: number; side: Side }

/** The section being read: its box in viewport pixels and which side Pilot keeps to beside it. */
export interface Reading { top: number; height: number; side: Side }

const CONTENT = 1152; // the page column: 72rem
const EDGE = 12;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Wide screens: Pilot flies in the empty margin beside the column, drifting down the section as it is read.
 * Narrower screens: it keeps to a bottom corner, switching sides between sections.
 */
export function flightTarget(vw: number, vh: number, box: { w: number; h: number }, reading: Reading | null): Waypoint {
  const side = reading?.side ?? "right";
  // How far through the section the middle of the screen is (0 at its top, 1 at its bottom).
  const progress = reading ? clamp((vh / 2 - reading.top) / Math.max(1, reading.height), 0, 1) : 0.5;
  const column = Math.min(CONTENT, vw - (vw >= 768 ? 64 : 32));
  const margin = (vw - column) / 2;

  if (margin >= box.w + 8) {
    const x = side === "left" ? (margin - box.w) / 2 : vw - margin + (margin - box.w) / 2;
    const y = lerp(vh * 0.14, vh * 0.62 - box.h * 0.25, progress);
    return { x, y: clamp(y, EDGE, vh - box.h - EDGE), side };
  }
  const x = side === "left" ? EDGE : vw - box.w - EDGE;
  const y = lerp(vh * 0.58, vh - box.h - EDGE, progress);
  return { x, y: clamp(y, EDGE, vh - box.h - EDGE), side };
}
