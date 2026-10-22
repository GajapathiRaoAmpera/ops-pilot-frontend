import { cx } from "@/lib/cx";
import styles from "./Segmented.module.scss";

interface Props<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** A visible, always-on filter: the current choice is never hidden inside a closed dropdown. */
export function Segmented<T extends string>({ label, value, options, onChange, disabled }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={styles.group}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} disabled={disabled}
          className={cx(styles.option, o.value === value && styles.on)} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}
