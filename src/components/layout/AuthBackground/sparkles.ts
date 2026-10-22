export interface SparkleSpec { left: number; top: number; size: number; delay: number; duration: number; tone: 0 | 1 | 2 }

/**
 * Deterministic positions (same on server and client, so no hydration mismatch).
 * Biased to the edges: the middle band, where the forms sit, stays mostly clear.
 */
export function makeSparkles(count = 34, seed = 7): SparkleSpec[] {
  let s = seed;
  const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const out: SparkleSpec[] = [];
  while (out.length < count) {
    const left = rand() * 100;
    const top = rand() * 100;
    const central = left > 22 && left < 78 && top > 18 && top < 85;
    if (central && rand() > 0.15) continue; // keep the reading area calm
    out.push({
      left: Math.round(left * 10) / 10,
      top: Math.round(top * 10) / 10,
      size: Math.round(8 + rand() * 14),
      delay: Math.round(rand() * 60) / 10,
      duration: Math.round(30 + rand() * 30) / 10,
      tone: (Math.floor(rand() * 3) as 0 | 1 | 2),
    });
  }
  return out;
}
