import styles from "./AuthBackground.module.scss";

/** Decorative, non-interactive backdrop. */
export function AuthBackground() {
  return (
    <div aria-hidden="true" className={styles.backdrop}>
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />
      <div className={styles.grid} />
    </div>
  );
}
