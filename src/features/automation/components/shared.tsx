import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { JOB_STATUS_LABEL, type JobStatus } from "../types";

export const NO_BACKEND = "Not connected to a backend yet.";

const TONE: Record<JobStatus, { tone: Tone; icon: string }> = {
  queued: { tone: "neutral", icon: "schedule" },
  running: { tone: "info", icon: "sync" },
  succeeded: { tone: "success", icon: "check_circle" },
  failed: { tone: "error", icon: "cancel" },
  cancelled: { tone: "neutral", icon: "block" },
  approval_required: { tone: "warning", icon: "gavel" },
  timed_out: { tone: "error", icon: "timer_off" },
};

export function JobBadge({ status }: { status: JobStatus }) {
  return <StatusBadge tone={TONE[status].tone} icon={TONE[status].icon}>{JOB_STATUS_LABEL[status]}</StatusBadge>;
}
