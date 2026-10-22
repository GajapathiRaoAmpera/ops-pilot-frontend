/** Display names for the backend's allowlisted actions. Unknown types are shown as their raw key, never invented. */
export const ACTION_LABEL: Record<string, string> = {
  rerun_failed_jobs: "Re-run failed jobs",
  open_fix_pr: "Open fix pull request",
};

export const actionLabel = (type: string) => ACTION_LABEL[type] ?? type;
