import styles from "./Icon.module.scss";

/** Decorative Material Symbol; pair with visible text or an aria-label on the parent control. */
export function Icon({ name, size }: { name: string; size?: number }) {
  return (
    <span className={styles.icon} aria-hidden="true" style={size ? { fontSize: size } : undefined}>
      {name}
    </span>
  );
}
