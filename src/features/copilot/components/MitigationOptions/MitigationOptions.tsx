import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { mitigations } from "../../mock-data";
import type { Risk } from "../../types";
import styles from "./MitigationOptions.module.scss";

const RISK: Record<Risk, { tone: Tone; label: string }> = {
  low: { tone: "success", label: "Low Risk" },
  medium: { tone: "warning", label: "Med Risk" },
  high: { tone: "error", label: "High Risk" },
};
export const NOT_CONNECTED = "Not connected to a backend. Nothing will be executed.";

export function MitigationOptions() {
  return (
    <Card title="Mitigation Options" actions={<StatusBadge tone="warning" icon="lightbulb">Suggestions, not executed</StatusBadge>}>
      <Notice variant="info">
        These are AI suggestions only. None has been applied. Apply controls are disabled because they are not connected to a backend.
      </Notice>
      <ul className={styles.list}>
        {mitigations.map((m) => (
          <li key={m.key} className={styles.option}>
            <div className={styles.head}>
              <div>
                <h3><span className={styles.key}>{m.key}</span> {m.title}</h3>
                <p className={styles.hint}>{m.summary}</p>
              </div>
              <StatusBadge tone={RISK[m.risk].tone}>{`${RISK[m.risk].label} (Score ${m.score})`}</StatusBadge>
            </div>
            <p className={styles.hint}>{m.meta.join(" - ")} (mock estimates)</p>
            <div className={styles.foot}>
              <Button disabled aria-describedby={`nc-${m.key}`}>
                <Icon name="lock" size={16} /> Apply suggestion {m.key}
              </Button>
              <span id={`nc-${m.key}`} className={styles.hint}>{NOT_CONNECTED}</span>
              {m.needsApproval && (
                <Link href="/approvals" className={styles.link}>Approvals page <Icon name="open_in_new" size={14} /></Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
