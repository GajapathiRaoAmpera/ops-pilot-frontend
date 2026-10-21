import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "../Icon/Icon";
import styles from "./Notice.module.scss";

/** Status text is always written out and given a role; color is never the only signal. */
export function Notice({ variant, children }: { variant: "info" | "error"; children: ReactNode }) {
  return (
    <p role={variant === "error" ? "alert" : "status"} className={cx(styles.notice, styles[variant])}>
      {variant === "error" && <Icon name="error" />}
      <span>{children}</span>
    </p>
  );
}
