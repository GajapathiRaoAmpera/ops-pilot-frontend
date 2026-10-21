import { Card } from "@/components/ui/Card/Card";
import { Sparkline } from "@/components/ui/charts/Sparkline";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { telemetry } from "../../mock-data";
import styles from "./TelemetryPanel.module.scss";

export function TelemetryPanel() {
  return (
    <Card title="Telemetry" actions={<StatusBadge tone="neutral" icon="science">Mock snapshot</StatusBadge>}>
      <p className={styles.hint}>Static sample values. Not refreshed and not connected to any metrics source.</p>
      <ul className={styles.list}>
        {telemetry.map((m) => (
          <li key={m.id} className={styles.metric}>
            <div className={styles.row}>
              <span className={styles.label}>{m.label}</span>
              {m.badge && <span className={styles.badge}>{m.badge}</span>}
            </div>
            <div className={styles.row}>
              <span className={styles.value}>{m.value}<span className={styles.unit}>{m.unit}</span></span>
              <span className={styles.detail}>{m.detail}</span>
            </div>
            {m.spark && (
              <Sparkline
                values={m.spark.split(" ").map((pt) => 40 - Number(pt.split(",")[1]))}
                name="Latency (sample, relative)"
                ariaLabel="Static sparkline: latency flat, then rising sharply at the end"
              />
            )}
            {m.percent !== undefined && (
              <div className={styles.bar} role="img" aria-label={`${m.percent}% of capacity`}>
                <div style={{ width: `${m.percent}%` }} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
