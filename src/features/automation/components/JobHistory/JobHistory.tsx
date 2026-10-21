"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { Notice } from "@/components/ui/Notice/Notice";
import { Table } from "@/components/ui/Table/Table";
import { MOCK_HISTORY } from "../../mock-data";
import { JOB_STATUS_LABEL, type JobStatus } from "../../types";
import { JobBadge, NO_BACKEND } from "../shared";
import styles from "./JobHistory.module.scss";

const PAGE_SIZE = 5;

export function JobHistory() {
  const [status, setStatus] = useState<"all" | JobStatus>("all");
  const [page, setPage] = useState(0);
  const history = MOCK_HISTORY.filter((h) => status === "all" || h.status === status);
  const pages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = history.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  return (
    <Card
      title="Execution audit & job history"
      flush
      actions={
        <>
          <label className={styles.filter}>
            <span>Filter status</span>
            <select value={status} onChange={(e) => { setStatus(e.target.value as "all" | JobStatus); setPage(0); }}>
              <option value="all">All</option>
              {(Object.keys(JOB_STATUS_LABEL) as JobStatus[]).map((s) => <option key={s} value={s}>{JOB_STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <Button variant="ghost" disabled title={NO_BACKEND}><Icon name="download" size={16} />Export CSV</Button>
        </>
      }
    >
      {rows.length === 0 ? (
        <div className={styles.emptyBox}><Notice variant="info">No runs match this status filter.</Notice></div>
      ) : (
        <Table caption="Execution audit and job history (mock data)">
          <thead>
            <tr>
              <th scope="col">Job ref</th><th scope="col">Runbook</th><th scope="col">Target environment</th>
              <th scope="col">Triggered by</th><th scope="col">Status</th><th scope="col">Duration</th>
              <th scope="col">Executed at</th><th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.ref}>
                <th scope="row" className={styles.mono}>#{h.ref}</th>
                <td>{h.runbook}</td>
                <td className={styles.mono}>{h.environment}</td>
                <td>{h.triggeredBy}</td>
                <td><JobBadge status={h.status} /></td>
                <td className={styles.mono}>{h.duration}</td>
                <td className={styles.mono}>{h.executedAt}</td>
                <td>
                  <Button variant="ghost" disabled title={`${NO_BACKEND} Job detail, rerun and rollback need backend support.`} aria-label={`Actions for ${h.ref} (not connected)`}>
                    <Icon name="visibility" size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <nav className={styles.pager} aria-label="History pagination">
        <span className={styles.mono}>Showing {rows.length} of {history.length} mock runs (mock total: 1,420)</span>
        <span className={styles.pages}>
          <Button variant="ghost" disabled={current === 0} onClick={() => setPage(current - 1)}>Prev</Button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" className={styles.pageBtn} aria-current={i === current ? "page" : undefined} aria-label={`Page ${i + 1}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <Button variant="ghost" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Next</Button>
        </span>
      </nav>
    </Card>
  );
}
