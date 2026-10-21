import { RANGE_HOURS } from "./mock-data";
import { ALL, type AuditEvent, type AuditFilters } from "./types";

export const DEFAULT_FILTERS: AuditFilters = { search: "", org: ALL, env: ALL, severity: ALL, action: ALL, range: "30d" };

export function filterEvents(events: AuditEvent[], f: AuditFilters): AuditEvent[] {
  const q = f.search.trim().toLowerCase();
  return events.filter((e) => {
    if (f.org !== ALL && e.org !== f.org) return false;
    if (f.env !== ALL && e.env !== f.env) return false;
    if (f.severity !== ALL && e.severity !== f.severity) return false;
    if (f.action !== ALL && e.action !== f.action) return false;
    if (e.ageHours > (RANGE_HOURS[f.range] ?? Infinity)) return false;
    if (!q) return true;
    return [e.correlationId, e.actor, e.actorRole, e.resource, e.target, e.authMethod].some((v) => v.toLowerCase().includes(q));
  });
}
