import type { Tone } from "@/components/ui/StatusBadge/StatusBadge";

export type PipelineHealth = "stable" | "verifying" | "degraded";

export interface PipelineRow {
  id: string;
  service: string;
  version: string;
  commit: string;
  target: string;
  stageLabel: string;
  stageDetail: string;
  progress: number;
  health: PipelineHealth;
  healthLabel: string;
  actions: { label: string; kind: "view" | "mutate" }[];
}

export interface LogLine {
  time: string;
  source: string;
  message: string;
  level: "info" | "warn";
}

export interface DailyRate { day: string; rate: number }

export interface MockOverview {
  workspace: { org: string; environment: string; summary: string[] };
  sparkline: DailyRate[];
  pipelines: PipelineRow[];
  logs: LogLine[];
  streamFooter: string[];
}

export const HEALTH_TONE: Record<PipelineHealth, Tone> = { stable: "success", verifying: "accent", degraded: "error" };
