import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import type { Pipeline, PipelineStatus } from "../../types";
import { ActionButton } from "../ActionButton/ActionButton";
import styles from "./PipelinesPanel.module.scss";

const STATUS: Record<PipelineStatus, { label: string; tone: Tone; icon: string }> = {
  running: { label: "Running", tone: "accent", icon: "play_circle" },
  queued: { label: "Queued", tone: "neutral", icon: "schedule" },
  succeeded: { label: "Succeeded", tone: "success", icon: "check_circle" },
  degraded: { label: "Degraded", tone: "error", icon: "error" },
};

export function statusLabel(s: PipelineStatus) {
  return STATUS[s].label;
}

export function PipelineRow({ p }: { p: Pipeline }) {
  const s = STATUS[p.status];
  return (
    <tr>
      <th scope="row" className={styles.rowHead}>
        <span className={styles.name}>{p.name}</span>
        <span className={styles.sub}>{p.track}</span>
      </th>
      <td><span className={styles.ref}>{p.ref}</span><span className={styles.commit}>{p.commit}</span></td>
      <td><span className={styles.target}><Icon name={p.targetIcon} size={16} /> {p.target}</span></td>
      <td>
        <div className={styles.stage}>
          <p className={styles.stageTop}><span>{p.progressLabel}</span><strong>{p.progressSide}</strong></p>
          <div className={styles.track} role="progressbar" aria-label={`${p.name} rollout progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.progress}>
            <span className={p.status === "degraded" ? styles.fillError : styles.fill} style={{ width: `${p.progress}%` }} />
          </div>
          <p className={styles.sub}>{p.stageSummary}</p>
        </div>
      </td>
      <td className={styles.mono}>{p.elapsed}</td>
      <td><StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge></td>
      <td><div className={styles.actions}>{p.actions.map((a) => <ActionButton key={a.label} label={a.label} kind={a.kind} />)}</div></td>
    </tr>
  );
}
