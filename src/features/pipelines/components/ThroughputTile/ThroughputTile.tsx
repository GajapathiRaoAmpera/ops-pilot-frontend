import { Icon } from "@/components/ui/Icon/Icon";
import styles from "./ThroughputTile.module.scss";

export function ThroughputTile({ value, unit, note, cadence }: { value: string; unit: string; note: string; cadence: string }) {
  return (
    <section className={styles.tile} aria-labelledby="throughput-h">
      <div>
        <p className={styles.top}><span id="throughput-h">FABRIC THROUGHPUT</span><Icon name="sync_alt" size={18} /></p>
        <p className={styles.value}>{value} <span className={styles.unit}>{unit}</span></p>
        <p className={styles.note}>{note}</p>
      </div>
      <p className={styles.cadence}><span>SYNC CADENCE</span><span>{cadence}</span></p>
    </section>
  );
}
