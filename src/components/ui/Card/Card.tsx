import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Card.module.scss";

interface Props {
  title?: string;
  /** Right-aligned header content (badges, small buttons). */
  actions?: ReactNode;
  /** Remove body padding, e.g. for tables. */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ title, actions, flush, className, children }: Props) {
  return (
    <section className={cx(styles.card, className)}>
      {(title || actions) && (
        <header className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {actions}
        </header>
      )}
      <div className={cx(styles.body, flush && styles.flush)}>{children}</div>
    </section>
  );
}
