import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Notice } from "@/components/ui/Notice/Notice";
import { hasPermission, PERMISSIONS } from "@/features/auth/permissions";
import { requireAnySession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { CopilotView } from "@/features/copilot/components/CopilotView";
import { fetchRuns } from "@/features/pipelines/server/runs";

export const metadata = { title: "AI Copilot · OpsPilot" };

const FAILED = new Set(["failure", "timed_out", "startup_failure"]);

export default async function Page() {
  const session = await requireAnySession([PERMISSIONS.copilotUse, PERMISSIONS.aiRead]);
  const ws = await getActiveWorkspace(session);
  const runs = await fetchRuns(ws?.id);
  const failed = runs.state === "ok" ? runs.runs.filter((r) => FAILED.has(r.conclusion ?? "")) : [];
  return (
    <>
      <PageHeader eyebrow="AI" title="AI Copilot"
        description="Pick a failed run and let the AI read its log. It explains the likely cause with quotes from the log and can suggest a re-run, which still needs a second person's approval." />
      {!ws ? <Notice variant="info">No workspace is assigned to your account.</Notice>
        : runs.state !== "ok" ? <Notice variant="error">Pipeline data is temporarily unavailable.</Notice>
        : <CopilotView workspaceId={ws.id} runs={failed} connected={runs.connected}
            canInvestigate={hasPermission(session.permissions, PERMISSIONS.copilotUse)}
            canRequest={hasPermission(session.permissions, PERMISSIONS.copilotUse) && hasPermission(session.permissions, PERMISSIONS.pipelinesExecute)} />}
    </>
  );
}
