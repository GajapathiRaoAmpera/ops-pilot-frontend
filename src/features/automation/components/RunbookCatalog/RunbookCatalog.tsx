"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { MOCK_CATEGORY_COUNTS, MOCK_RUNBOOKS } from "../../mock-data";
import type { RunbookCategory } from "../../types";
import { NO_BACKEND } from "../shared";
import styles from "./RunbookCatalog.module.scss";

type Tab = keyof typeof MOCK_CATEGORY_COUNTS;
const TABS = Object.keys(MOCK_CATEGORY_COUNTS) as Tab[];

export function RunbookCatalog() {
  const [tab, setTab] = useState<Tab>("All");
  const runbooks = MOCK_RUNBOOKS.filter((r) => tab === "All" || r.category === (tab as RunbookCategory));

  return (
    <Card title="Runbook catalog" actions={<span className={styles.count}>{MOCK_CATEGORY_COUNTS.All} total (mock)</span>}>
      <div role="group" aria-label="Filter runbooks by category" className={styles.chips}>
        {TABS.map((c) => (
          <button key={c} type="button" aria-pressed={tab === c} className={styles.chip} onClick={() => setTab(c)}>
            {c.toUpperCase()} ({MOCK_CATEGORY_COUNTS[c]})
          </button>
        ))}
      </div>
      {runbooks.length === 0 && <p className={styles.empty}>No runbooks in this category.</p>}
      <ul className={styles.runbooks}>
        {runbooks.map((r) => (
          <li key={r.id} className={styles.runbook} data-impact={r.highImpact ? "high" : undefined}>
            <div className={styles.tags}>
              {r.highImpact && <StatusBadge tone="error" icon="warning">High impact</StatusBadge>}
              <StatusBadge tone="neutral">{r.category.toUpperCase()}</StatusBadge>
              {r.runningNow && <StatusBadge tone="info" icon="sync">Running now</StatusBadge>}
              <span className={styles.mono}>ID: {r.id} - est. {r.estimate}</span>
            </div>
            <h3 className={styles.rbTitle}>{r.title}</h3>
            <p className={styles.rbDesc}>{r.description}</p>
            <div className={styles.rbFoot}>
              <span className={styles.mono}>Target: {r.target}</span>
              {r.runningNow ? (
                <span className={styles.mono}>Active job: #JOB-8812 (mock)</span>
              ) : (
                <Button variant="ghost" disabled title={NO_BACKEND} aria-label={`Execute ${r.title} (not connected)`}>
                  <Icon name="play_arrow" size={16} />Execute
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
