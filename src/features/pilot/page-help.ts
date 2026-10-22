import { hasAnyPermission, PERMISSIONS, type Permission } from "@/features/auth/permissions";

/** A tip about something only some roles can do carries `needs` (any one of them is enough). */
export type Tip = string | { text: string; needs: readonly Permission[] };
export interface PageHelp { title: string; tips: Tip[] }

/** Help per page, keyed by path prefix. Plain statements of how OpsPilot behaves, nothing invented. */
const HELP: [string, PageHelp][] = [
  ["/overview", { title: "Overview", tips: [
    "Everything here comes from your workspace. Sections you don't have access to are hidden, not faked.",
    "Switch workspace in the sidebar to see another one.",
  ] }],
  ["/pipelines", { title: "Pipelines", tips: [
    { text: "Sync now pulls the latest runs from every connected repository.", needs: [PERMISSIONS.pipelinesExecute] },
    { text: "A failed run can be re-run, but only after someone else approves the request.", needs: [PERMISSIONS.pipelinesExecute] },
    { text: "You can view runs here. Syncing and re-runs are for DevOps engineers and administrators.", needs: [] },
    "Use the repository filter when a workspace has more than one.",
  ] }],
  ["/automation", { title: "Automation", tips: [
    "These are the only actions OpsPilot can take, and each needs a second person's approval.",
    "The history shows who asked, who approved, and what GitHub reported.",
  ] }],
  ["/approvals", { title: "Approvals", tips: [
    { text: "You can't approve your own request. Someone else must decide it.", needs: [PERMISSIONS.approvalsDecide] },
    { text: "Approving runs the action straight away, and the result appears in the decision trail.", needs: [PERMISSIONS.approvalsDecide] },
    { text: "You can follow every request and its outcome here; deciding is for administrators.", needs: [] },
    "For a fix pull request, the diff you see is exactly what will be opened.",
  ] }],
  ["/cloud", { title: "Cloud", tips: [
    "The Google Cloud connection is read-only: OpsPilot cannot change anything there.",
    "Use a service account with only the Viewer role.",
  ] }],
  ["/team", { title: "Team & access", tips: [
    "Invitations are single-use links. Share them yourself; they expire.",
    "A role for the whole organization covers every workspace; a workspace role covers one.",
  ] }],
  ["/rbac", { title: "Roles & permissions", tips: [
    "This is what each role can do. The server checks it on every request.",
  ] }],
  ["/audit", { title: "Audit trail", tips: [
    { text: "Every sign-in, change, approval and AI investigation in the organization is recorded here.", needs: [PERMISSIONS.auditRead] },
    { text: "You see everything recorded in your workspace.", needs: [] },
    "Filter by action or outcome, and load older events at the bottom.",
  ] }],
  ["/settings", { title: "Settings", tips: [
    "Tokens are stored encrypted and never shown again.",
    "A repository uses the workspace token unless you give it its own.",
    "AI fix pull requests need Contents and Pull requests write access on the token.",
  ] }],
  ["/platform", { title: "Organizations", tips: [
    "Creating an organization also creates a first-admin invitation link to share.",
  ] }],
];

/** Tips for this person: plain ones always; role-specific ones only with the right permission. A `needs: []` tip is
 * the fallback for people without any of the page's role-specific permissions. */
export function tipsFor(help: PageHelp, permissions: readonly string[]): string[] {
  const gated = help.tips.filter((t): t is Exclude<Tip, string> => typeof t !== "string" && t.needs.length > 0);
  const hasGated = gated.some((t) => hasAnyPermission(permissions, t.needs));
  return help.tips.flatMap((t) => {
    if (typeof t === "string") return [t];
    if (t.needs.length === 0) return hasGated ? [] : [t.text];
    return hasAnyPermission(permissions, t.needs) ? [t.text] : [];
  });
}

const DEFAULT: PageHelp = { title: "OpsPilot", tips: ["Ask the AI Copilot to explain a failed run."] };

export function helpFor(pathname: string): PageHelp {
  return HELP.find(([p]) => pathname === p || pathname.startsWith(`${p}/`))?.[1] ?? DEFAULT;
}
