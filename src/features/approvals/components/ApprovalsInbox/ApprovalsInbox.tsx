"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { cx } from "@/lib/cx";
import { MOCK_APPROVALS, MOCK_SLA } from "../../mock-data";
import type { ApprovalRisk, QueueSort, QueueTab } from "../../types";
import { ApprovalDetail } from "../ApprovalDetail/ApprovalDetail";
import styles from "./ApprovalsInbox.module.scss";

const RISK: Record<ApprovalRisk, { tone: Tone; label: string }> = {
  high: { tone: "error", label: "High risk" },
  medium: { tone: "warning", label: "Medium risk" },
  low: { tone: "neutral", label: "Low risk" },
};

const high = MOCK_APPROVALS.filter((r) => r.risk === "high");
const normal = MOCK_APPROVALS.filter((r) => r.risk !== "high");
const TABS: { id: QueueTab; label: string }[] = [
  { id: "all", label: `All (${MOCK_APPROVALS.length})` },
  { id: "high", label: `High Risk (${high.length})` },
  { id: "normal", label: `Normal (${normal.length})` },
  { id: "history", label: "Past History" },
];

/** Mock-data inbox: tabs, sort and selection work on static rows; decisions are not connected to a backend. */
export function ApprovalsInbox() {
  const [tab, setTab] = useState<QueueTab>("all");
  const [sort, setSort] = useState<QueueSort>("sev_desc");
  const [selectedId, setSelectedId] = useState(MOCK_APPROVALS[0].id);

  const rows = useMemo(() => {
    const base = tab === "high" ? high : tab === "normal" ? normal : tab === "history" ? [] : MOCK_APPROVALS;
    return [...base].sort((a, b) =>
      sort === "sev_desc" ? a.severityRank - b.severityRank : sort === "newest" ? a.ageMinutes - b.ageMinutes : b.ageMinutes - a.ageMinutes,
    );
  }, [tab, sort]);
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  return (
    <div className={styles.layout}>
      <div className={styles.queue}>
        <Card title="Pending Approval Queue" actions={
          <label className={styles.sort}>
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as QueueSort)}>
              <option value="sev_desc">Severity (high first)</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        } flush>
          <div role="group" aria-label="Queue filter" className={styles.tabs}>
            {TABS.map((t) => (
              <button key={t.id} type="button" aria-pressed={tab === t.id} className={cx(styles.tab, tab === t.id && styles.tabOn)} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <p className={styles.empty}>
              {tab === "history" ? "Past history is not available: no approvals backend is connected." : "No requests match this filter."}
            </p>
          ) : (
            <ul className={styles.list} aria-label="Approval requests">
              {rows.map((r) => (
                <li key={r.id}>
                  <button type="button" aria-pressed={r.id === selected?.id} className={cx(styles.item, r.id === selected?.id && styles.active)} onClick={() => setSelectedId(r.id)}>
                    <span className={styles.row}>
                      <span className={styles.id}>{r.id} · {r.severityLabel}</span>
                      <StatusBadge tone={RISK[r.risk].tone}>{RISK[r.risk].label}</StatusBadge>
                    </span>
                    <span className={styles.itemTitle}>{r.title}</span>
                    <span className={styles.meta}>{r.requester} · {r.ageLabel}</span>
                    <span className={styles.meta}>{r.target} · {r.signedCount} of {r.requiredCount} signed (mock)</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Governance SLA Monitor" actions={<Icon name="verified" size={18} />}>
          <p className={styles.meta}>Dual-signoff requests not addressed within 30 minutes are escalated to on-call Engineering VP and quarantined (mock policy text).</p>
          <div className={styles.bar} role="img" aria-label={`Mock average response ${MOCK_SLA.avgResponse} of ${MOCK_SLA.threshold} threshold`}>
            <span style={{ width: `${MOCK_SLA.percent}%` }} />
          </div>
          <p className={cx(styles.meta, styles.sla)}><span>AVG RESPONSE: {MOCK_SLA.avgResponse}</span><span>THRESHOLD: {MOCK_SLA.threshold}</span></p>
        </Card>
      </div>

      {selected ? <ApprovalDetail request={selected} /> : <Card><p className={styles.empty}>Select a request to inspect it.</p></Card>}
    </div>
  );
}
