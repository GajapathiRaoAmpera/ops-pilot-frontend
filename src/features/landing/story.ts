/** The landing page's one story, told by the 3D pipeline and the step list. Every line describes real behavior. */
export interface StoryStep {
  title: string;
  /** What Pilot says and how it looks while this step plays. */
  pilot: { line: string; mood: "worried" | "thinking" | "curious" | "idle" | "success" };
  detail: string;
  /** The audit event OpsPilot writes at this step (see the backend's audit.record calls). */
  audit: string;
  /** When the step starts in the hero animation, in seconds. */
  at: number;
}

export const STORY: readonly StoryStep[] = [
  {
    title: "A run fails",
    pilot: { line: "Uh-oh. The test stage just failed.", mood: "worried" },
    detail: "OpsPilot syncs GitHub Actions runs from every repository connected to your workspace, so a red build shows up with the rest of your pipelines.",
    audit: "pipelines.sync",
    at: 0,
  },
  {
    title: "Pilot reads the log",
    pilot: { line: "Reading the log for you.", mood: "thinking" },
    detail: "Open the failed run in AI Copilot. Pilot reads the job log and explains in plain language what broke and where.",
    audit: "ai.investigation",
    at: 4,
  },
  {
    title: "A fix is proposed",
    pilot: { line: "Found it. Here is a small fix.", mood: "curious" },
    detail: "Pilot drafts a small code change. The diff you review is exactly what will be opened as a pull request.",
    audit: "ai.fix_proposal",
    at: 7,
  },
  {
    title: "A teammate approves",
    pilot: { line: "Now a teammate has to approve it.", mood: "idle" },
    detail: "The request waits in the approvals inbox. The person who asked can never approve their own request.",
    audit: "approval.approve",
    at: 10,
  },
  {
    title: "It runs, on the record",
    pilot: { line: "Approved, re-run, and on the record.", mood: "success" },
    detail: "OpsPilot re-runs the failed jobs or opens the pull request. It never merges, and success is recorded only when GitHub confirms it.",
    audit: "execution.started",
    at: 13,
  },
];

/** Length of one loop of the hero animation, in seconds. */
export const STORY_LENGTH = 16;

export function stepAt(time: number): number {
  let step = 0;
  STORY.forEach((s, i) => { if (time >= s.at) step = i; });
  return step;
}
