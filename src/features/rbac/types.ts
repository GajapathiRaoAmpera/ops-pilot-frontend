export interface MockRole {
  name: string;
  assignees: number;
  readOnly?: boolean;
}

/** "yes" granted, "no" denied, "na" not applicable, or a conditional label (optionally shown as an icon). */
export type Cell = "yes" | "no" | "na" | { label: string; icon?: string };

export interface MockResourceRow {
  name: string;
  id: string;
  icon: string;
  read: Cell;
  create: Cell;
  update: Cell;
  delete: Cell;
  execute: Cell;
  approve: Cell;
  scope: string;
  /** Extra condition detail, only visible when conditions are expanded. */
  conditions: string;
  destructive?: boolean;
  elevated?: boolean;
}
