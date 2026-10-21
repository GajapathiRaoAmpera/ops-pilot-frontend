export type Risk = "low" | "medium" | "high";

export interface TelemetryMetric {
  id: "latency" | "memory" | "connections";
  label: string;
  value: string;
  unit?: string;
  badge?: string;
  detail: string;
  percent?: number;
  /** Static sparkline polyline points in a 200x40 viewBox. */
  spark?: string;
}

export interface InvestigationStep {
  title: string;
  time: string;
  body: string;
  confidence?: string;
  diff?: { file: string; removed: string; added: string };
}

export interface Mitigation {
  key: string;
  title: string;
  summary: string;
  risk: Risk;
  score: number;
  meta: string[];
  needsApproval?: boolean;
}

export interface ChatMessage {
  who: "user" | "ai";
  name: string;
  time: string;
  text: string;
  tools?: { label: string; result: string }[];
}
