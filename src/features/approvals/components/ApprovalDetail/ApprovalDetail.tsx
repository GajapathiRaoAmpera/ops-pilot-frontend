import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Can } from "@/features/auth/components/SessionProvider";
import { PERMISSIONS } from "@/features/auth/permissions";
import { cx } from "@/lib/cx";
import type { ApprovalRequest } from "../../types";
import styles from "./ApprovalDetail.module.scss";

const PREFIX = { context: "  ", remove: "- ", add: "+ " } as const;

export function ApprovalDetail({ request: r }: { request: ApprovalRequest }) {
  return (
    <div className={styles.detail}>
      <Card>
        <p className={styles.crumb}>{r.id} / {r.target}</p>
        <h2 className={styles.heading}>{r.title}</h2>
        <p className={styles.meta}>Requested by {r.requester} · {r.ageLabel}</p>
        <p className={styles.ttl}>
          <Icon name="hourglass_bottom" size={16} />
          Quarantine TTL (mock value, not a running timer): <strong>{r.ttlLabel}</strong>
        </p>
      </Card>

      <Card title="Policy & Separation of Duties Matrix" actions={<StatusBadge tone="info">Mock policy #204</StatusBadge>}>
        <p className={styles.policy}><Icon name="info" size={16} /> {r.policy}</p>
        <ul className={styles.signoffs}>
          {r.signoffs.map((s) => (
            <li key={s.slot} className={styles.signoff}>
              <div className={styles.row}>
                <strong>{s.slot}</strong>
                <StatusBadge tone={s.state === "recorded" ? "info" : "warning"} icon={s.state === "recorded" ? "check_circle" : "hourglass_empty"}>
                  {s.state === "recorded" ? "Mock: signed" : "Awaiting decision"}
                </StatusBadge>
              </div>
              {s.who && <span>{s.who}</span>}
              {s.detail && <span className={styles.meta}>{s.detail}</span>}
              {s.note && <span className={styles.meta}>{s.note}</span>}
            </li>
          ))}
        </ul>
      </Card>

      {r.blast && (
        <Card title="Blast Radius & Surface Impact Analysis" actions={<StatusBadge tone="neutral">Mock snapshot</StatusBadge>}>
          <dl className={styles.metrics}>
            {r.blast.metrics.map((m) => (
              <div key={m.label} className={styles.metric}>
                <dt>{m.label}</dt>
                <dd className={styles.metricValue}>{m.value}</dd>
                <dd className={styles.meta}>{m.sub}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.meta}>{r.blast.caption}</p>
        </Card>
      )}

      {r.changeLines.length > 0 && (
        <Card title="Git Target Mutation & Spec Rollback (mock diff)" flush>
          {r.changeFile && <p className={styles.file}>{r.changeFile}</p>}
          <pre className={styles.diff} tabIndex={0} aria-label="Mock proposed change">
            {r.changeLines.map((l, i) => (
              <code key={i} className={cx(styles.line, styles[l.kind])}>{PREFIX[l.kind]}{l.text}{"\n"}</code>
            ))}
          </pre>
        </Card>
      )}

      <Card title="Decision">
        <Notice variant="info">
          Approval is not connected to a backend. Decisions cannot be submitted from this screen, and no request is
          approved or rejected.
        </Notice>
        <Can permission={PERMISSIONS.approvalsDecide}>
          <div className={styles.actions}>
            <Button type="button" disabled aria-disabled="true">Approve (not connected)</Button>
            <Button type="button" variant="ghost" disabled aria-disabled="true">Reject (not connected)</Button>
          </div>
        </Can>
      </Card>
    </div>
  );
}
