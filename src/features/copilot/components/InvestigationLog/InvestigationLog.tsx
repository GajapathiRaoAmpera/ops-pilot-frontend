import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { investigationSteps } from "../../mock-data";
import styles from "./InvestigationLog.module.scss";

export function InvestigationLog() {
  return (
    <Card title="Autonomous Investigation Log" actions={<StatusBadge tone="accent" icon="psychology">AI-generated, mock</StatusBadge>}>
      <p className={styles.hint}>Findings below are AI suggestions from a static sample. They are not verified results.</p>
      <ol className={styles.steps}>
        {investigationSteps.map((s, i) => (
          <li key={s.title} className={styles.step}>
            <div className={styles.head}>
              <h3>Step {i + 1}: {s.title}</h3>
              <time className={styles.mono}>{s.time}</time>
            </div>
            <p>{s.body}</p>
            {s.confidence && <p className={styles.conf}><Icon name="check_circle" size={14} /> {s.confidence}</p>}
            {s.diff && (
              <pre className={styles.diff} tabIndex={0} aria-label={`Sample diff for ${s.diff.file}`}>
                <span className={styles.file}>{s.diff.file}</span>{"\n"}
                <span className={styles.removed}>{s.diff.removed}</span>{"\n"}
                <span className={styles.added}>{s.diff.added}</span>
              </pre>
            )}
          </li>
        ))}
        <li className={styles.step}>
          <div className={styles.head}>
            <h3>Step 3: Remediation Decision Matrix</h3>
            <StatusBadge tone="neutral">Mock snapshot</StatusBadge>
          </div>
          <p>Options are listed under Mitigation Options. Selecting a plan is not connected to a backend.</p>
        </li>
      </ol>
    </Card>
  );
}
