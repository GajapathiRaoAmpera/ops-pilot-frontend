import { Icon } from "@/components/ui/Icon/Icon";
import type { CloudEndpoint } from "../../types";
import { ProviderCard } from "../ProviderCard/ProviderCard";
import styles from "./CloudEndpoints.module.scss";

export function CloudEndpoints({ clouds }: { clouds: CloudEndpoint[] }) {
  return (
    <section className={styles.section} aria-labelledby="cloud-endpoints-h">
      <div className={styles.head}>
        <h2 id="cloud-endpoints-h" className={styles.title}>Active Cloud Mesh Endpoints</h2>
        <span className={styles.count}>{clouds.length} REGISTERED</span>
      </div>
      {clouds.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="cloud_off" size={24} />
          <p>No cloud accounts match the current filter.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {clouds.map((c) => <ProviderCard key={c.id} cloud={c} />)}
        </div>
      )}
    </section>
  );
}
