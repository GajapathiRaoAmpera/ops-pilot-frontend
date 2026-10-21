import { Icon } from "@/components/ui/Icon/Icon";
import styles from "./MockDataNotice.module.scss";

/** Rendered at the top of every screen that uses static mock data instead of backend responses. */
export function MockDataNotice() {
  return (
    <p role="note" className={styles.notice}>
      <Icon name="science" size={16} />
      Mock data for UI preview. Nothing on this screen comes from a backend, and no action here executes anything.
    </p>
  );
}
