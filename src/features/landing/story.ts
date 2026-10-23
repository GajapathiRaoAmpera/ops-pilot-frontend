/** The landing page's one story, told by the 3D pipeline and the step list. Every line describes real behavior. */
export interface StoryStep {
  title: string;
  /** Material Symbol shown beside the title (decorative). */
  icon: string;
  /** What Pilot says and how it looks while this step plays. */
  pilot: { line: string; mood: "worried" | "scanning" | "curious" | "idle" | "success" };
  detail: string;
  /** The audit event OpsPilot writes at this step (see the backend's audit.record calls). */
  audit: string;
  /** When the step starts in the hero animation, in seconds. */
  at: number;
}

export const STORY: readonly StoryStep[] = [
  {
    title: "Test goes red",
    icon: "error",
    pilot: { line: "Uh-oh. Test just went red.", mood: "worried" },
    detail: "Every GitHub Actions run from every connected repository lands in one place. A red build can't hide in a tab you forgot to open.",
    audit: "pipelines.sync",
    at: 0,
  },
  {
    title: "Pilot reads the log",
    icon: "manage_search",
    pilot: { line: "Scanning the log. Every line, so you don't have to.", mood: "scanning" },
    detail: "Open the run in AI Copilot. Pilot reads the whole job log and tells you, in plain words, what broke and where.",
    audit: "ai.investigation",
    at: 4,
  },
  {
    title: "A fix, ready to review",
    icon: "healing",
    pilot: { line: "Found it. Here's a small fix.", mood: "curious" },
    detail: "Pilot drafts the change. The diff you read is exactly the pull request that gets opened. No surprises.",
    audit: "ai.fix_proposal",
    at: 7,
  },
  {
    title: "A teammate says yes",
    icon: "how_to_reg",
    pilot: { line: "Your turn, teammate. I wait for a yes.", mood: "idle" },
    detail: "The request waits in the approvals inbox for a second person. Nobody, not even an admin, approves their own request.",
    audit: "approval.approve",
    at: 10,
  },
  {
    title: "Green, on the record",
    icon: "check_circle",
    pilot: { line: "Green again. And it's all on the record.", mood: "success" },
    detail: "OpsPilot re-runs the failed jobs or opens the pull request. It never merges, and it records success only when GitHub confirms it.",
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
