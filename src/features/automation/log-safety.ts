/**
 * Best-effort client-side masking of secrets that slipped into log output.
 * This is a defence in depth only; the backend must redact before logs are stored or served.
 */
export const REDACTED = "[REDACTED]";

const RULES: [RegExp, string][] = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g, REDACTED],
  [/\bAKIA[0-9A-Z]{16}\b/g, REDACTED],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, REDACTED],
  [/\b(?:ghp|gho|ghs|xox[abp])[_-][A-Za-z0-9-]{16,}\b/g, REDACTED],
  [/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, `$1 ${REDACTED}`],
  [/\b((?:password|passwd|secret|token|api[_-]?key|access[_-]?key|authorization)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|\S+)/gi, `$1${REDACTED}`],
];

export function redactSecrets(line: string): string {
  return RULES.reduce((out, [re, rep]) => out.replace(re, rep), line);
}

/** Case-insensitive plain-text match on the already-redacted line. Never builds a RegExp from user input. */
export function matchesQuery(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q === "" || text.toLowerCase().includes(q);
}

/** Splits text into plain and matching segments so it can be rendered as React text nodes (no HTML injection). */
export function splitHighlight(text: string, query: string): { text: string; hit: boolean }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [{ text, hit: false }];
  const lower = text.toLowerCase();
  const parts: { text: string; hit: boolean }[] = [];
  let i = 0;
  while (i < text.length) {
    const j = lower.indexOf(q, i);
    if (j === -1) { parts.push({ text: text.slice(i), hit: false }); break; }
    if (j > i) parts.push({ text: text.slice(i, j), hit: false });
    parts.push({ text: text.slice(j, j + q.length), hit: true });
    i = j + q.length;
  }
  return parts;
}
