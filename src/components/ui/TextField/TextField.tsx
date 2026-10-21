import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./TextField.module.scss";

type Props = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  /** Interactive adornment rendered inside the field, e.g. a show/hide button. */
  trailing?: ReactNode;
};

export function TextField({ id, label, error, trailing, className, ...rest }: Props) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.control}>
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cx(styles.input, !!trailing && styles.hasTrailing, error && styles.invalid, className)}
          {...rest}
        />
        {trailing && <div className={styles.trailing}>{trailing}</div>}
      </div>
      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  );
}
