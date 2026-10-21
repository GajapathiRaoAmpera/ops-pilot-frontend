import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { AuthBackground } from "../AuthBackground/AuthBackground";
import styles from "./GatewayShell.module.scss";

/** Stitch "Security Gate" frame for unauthenticated screens. */
export function GatewayShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={styles.page}>
      <AuthBackground />
      <header className={styles.header}>
        <span className={styles.logo} aria-hidden="true">O</span>
        <span className={styles.brand}>OpsPilot</span>
        <span className={styles.badge}>SECURITY GATE</span>
      </header>
      <main className={styles.main}>
        <div className={cx(styles.content, wide && styles.wide)}>{children}</div>
      </main>
    </div>
  );
}
