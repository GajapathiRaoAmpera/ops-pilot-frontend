import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { podDetails } from "../../mock-data";
import styles from "./TopologyPanel.module.scss";

const PODS = [
  { name: "pod-1", ok: true },
  { name: "pod-3", ok: false },
  { name: "pod-2", ok: true },
];

export function TopologyPanel() {
  return (
    <Card title="Cluster Topology" actions={<StatusBadge tone="neutral">us-east-1a</StatusBadge>}>
      <figure className={styles.figure}>
        <figcaption className={styles.cols}>
          <span>Ingress</span><span>Microservices</span><span>Persistence</span>
        </figcaption>
        <div className={styles.canvas}>
          <svg className={styles.lines} viewBox="0 0 300 144" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 40 72 C 80 72, 80 28, 120 28" className={styles.neutralLine} />
            <path d="M 40 72 C 80 72, 80 72, 120 72" className={styles.critLine} strokeDasharray="4 4" />
            <path d="M 40 72 C 80 72, 80 116, 120 116" className={styles.neutralLine} />
            <path d="M 195 72 C 225 72, 230 72, 260 72" className={styles.critLine} />
          </svg>
          <div className={styles.node}>
            <span className={styles.icon}><Icon name="dns" size={18} /></span>
            <span className={styles.mono}>alb-core</span>
          </div>
          <ul className={styles.pods}>
            {PODS.map((p) => (
              <li key={p.name} className={p.ok ? styles.pod : styles.podCrit}>
                <Icon name={p.ok ? "check_circle" : "error"} size={14} />
                {p.name} ({p.ok ? "ok" : "CRIT"})
              </li>
            ))}
          </ul>
          <div className={styles.node}>
            <span className={`${styles.icon} ${styles.iconCrit}`}><Icon name="database" size={18} /></span>
            <span className={`${styles.mono} ${styles.crit}`}>db-read-02</span>
          </div>
        </div>
        <p className={styles.foot}><span>Mesh: Istio 1.20</span><span className={styles.crit}>1 Pod Stalled</span></p>
      </figure>
      <dl className={styles.kv}>
        {podDetails.map((d) => (
          <div key={d.k}><dt>{d.k}</dt><dd>{d.v}</dd></div>
        ))}
      </dl>
    </Card>
  );
}
