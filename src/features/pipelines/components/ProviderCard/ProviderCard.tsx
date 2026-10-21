import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import type { CloudEndpoint } from "../../types";
import { ActionButton } from "../ActionButton/ActionButton";
import styles from "./ProviderCard.module.scss";

export function ProviderCard({ cloud }: { cloud: CloudEndpoint }) {
  const headingId = `cloud-${cloud.id}`;
  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.main}>
        <div className={styles.head}>
          <div className={styles.identity}>
            <span className={styles.logo}><Icon name={cloud.icon} size={24} /></span>
            <div>
              <h3 id={headingId} className={styles.name}>{cloud.name}</h3>
              <p className={styles.slug}>{cloud.slug}</p>
            </div>
          </div>
          <StatusBadge tone={cloud.state === "connected" ? "info" : "warning"} icon={cloud.state === "connected" ? "check_circle" : "schedule"}>
            {cloud.stateLabel}
          </StatusBadge>
        </div>
        <dl className={styles.meta}>
          {cloud.rows.map((r) => (
            <div key={r.label} className={styles.row}>
              <dt>{r.label}</dt>
              <dd><strong className={r.emphasis ? styles.count : undefined}>{r.value}</strong>{r.hint && <span className={styles.hint}> {r.hint}</span>}</dd>
            </div>
          ))}
        </dl>
        {cloud.latencyBars && (
          <div>
            <p className={styles.trend}><span>Latency trend</span><span>{cloud.latencyLabel}</span></p>
            <div className={styles.bars} aria-hidden="true">
              {cloud.latencyBars.map((h, i) => <span key={i} className={styles.bar} style={{ height: `${h * 4}px` }} />)}
            </div>
          </div>
        )}
        {cloud.warning && (
          <div className={styles.warning}>
            <span><Icon name="warning" size={16} /> {cloud.warning.text}</span>
            <ActionButton label={cloud.warning.actionLabel} kind="primary" />
          </div>
        )}
      </div>
      <footer className={styles.footer}>
        <span className={styles.region}><Icon name={cloud.regionIcon} size={14} /> {cloud.region}</span>
        <ActionButton label={cloud.footerActionLabel} />
      </footer>
    </article>
  );
}
