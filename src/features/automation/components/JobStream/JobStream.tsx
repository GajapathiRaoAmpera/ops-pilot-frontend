"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { matchesQuery, redactSecrets, splitHighlight } from "../../log-safety";
import { MOCK_ACTIVE_JOB as job } from "../../mock-data";
import { JobBadge, NO_BACKEND } from "../shared";
import styles from "./JobStream.module.scss";

export function JobStream() {
  const [query, setQuery] = useState("");
  const lines = useMemo(
    () => job.log.map((l) => ({ t: l.t, text: redactSecrets(l.text) })).filter((l) => matchesQuery(l.text, query)),
    [query],
  );
  const done = job.stages.filter((s) => s.status === "succeeded").length;

  return (
    <div className={styles.stream}>
      <Card
        title={`#${job.ref} ${job.runbook}`}
        actions={
          <>
            <JobBadge status={job.status} />
            <Button variant="ghost" disabled title={`${NO_BACKEND} A cancel request would not guarantee the job stops.`}>
              <Icon name="stop_circle" size={16} />Request abort
            </Button>
          </>
        }
      >
        <p className={styles.meta}>Environment: <span className={styles.mono}>{job.environment}</span> - Triggered by {job.triggeredBy} - {job.duration}</p>
        <p className={styles.meta} id="stage-progress">Stage progress: step {done + 1} of {job.stages.length} (Route53 latency weights) - {Math.round((done / job.stages.length) * 100)}% completed (mock)</p>
        <progress className={styles.progress} max={job.stages.length} value={done} aria-labelledby="stage-progress" />
        <ol className={styles.stages}>
          {job.stages.map((s, i) => (
            <li key={s.name} className={styles.stage}>
              <span className={styles.mono}>{String(i + 1).padStart(2, "0")}</span>
              <strong>{s.name}</strong>
              <JobBadge status={s.status} />
              <span className={styles.mono}>{s.detail}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Execution log" actions={<StatusBadge tone="neutral">Mock snapshot</StatusBadge>}>
        <p className={styles.mono}>runner-east-04.internal:/var/log/runbooks/job-8812.log - not streaming</p>
        <div className={styles.logTools}>
          <label className={styles.search}>
            <span className={styles.srOnly}>Search log output</span>
            <Icon name="search" size={16} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search log output" />
          </label>
          <span className={styles.mono} role="status">{lines.length} of {job.log.length} lines</span>
        </div>
        <p className={styles.mono}>Secret-like values are masked in this view; the backend must still redact stored logs.</p>
        <pre className={styles.log} tabIndex={0} aria-label="Command output log">
          {lines.length === 0 ? "No log lines match your search." : null}
          {lines.map((l, i) => (
            <div key={i} className={styles.line}>
              <span className={styles.ts}>{l.t}</span>
              <span>{splitHighlight(l.text, query).map((p, k) => (p.hit ? <mark key={k}>{p.text}</mark> : <span key={k}>{p.text}</span>))}</span>
            </div>
          ))}
        </pre>
        <p className={styles.mono}>CPU: 4.2% - MEM: 142MB - PID: 8812 - EXIT-CODE: -- (mock snapshot)</p>
      </Card>
    </div>
  );
}
