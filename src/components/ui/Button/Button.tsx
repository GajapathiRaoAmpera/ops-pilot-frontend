import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.scss";

type Props = ComponentProps<"button"> & {
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
  loading?: boolean;
};

export function Button({ variant = "primary", fullWidth, loading, className, children, ...rest }: Props) {
  return (
    <button className={cx(styles.button, styles[variant], fullWidth && styles.fullWidth, className)} {...rest}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
