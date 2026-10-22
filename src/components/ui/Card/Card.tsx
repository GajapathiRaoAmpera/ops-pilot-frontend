import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { InfoTip } from "../InfoTip/InfoTip";
import styles from "./Card.module.scss";

interface Props {
  title?: string;
  /** What this card is for, shown in an "i" card next to the title. */
  info?: string;
  /** Right-aligned header content (badges, small buttons). */
  actions?: ReactNode;
  /** Remove body padding, e.g. for tables. */
  flush?: boolean;
  /** Fill the height of the parent and scroll the body; empty states centre in the space. */
  fill?: boolean | "clip";
  className?: string;
  children: ReactNode;
}

export function Card({ title, info, actions, flush, fill, className, children }: Props) {
  return (
    <section className={cx(styles.card, fill && styles.fill, fill === "clip" && styles.clip, className)}>
      {(title || actions) && (
        <header className={styles.header}>
          {title && (
            <div className={styles.heading}>
              <h2 className={styles.title}>{title}</h2>
              {info && <InfoTip title={title}>{info}</InfoTip>}
            </div>
          )}
          {actions}
        </header>
      )}
      <div className={cx(styles.body, flush && styles.flush)}>{children}</div>
    </section>
  );
}
