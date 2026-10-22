import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { BrandMark, BrandWordmark } from "@/components/brand/BrandMark";
import { AuthBackground } from "../AuthBackground/AuthBackground";
import { Parallax } from "./Parallax";
import styles from "./GatewayShell.module.scss";

/** Stitch "Security Gate" frame for unauthenticated screens. */
export function GatewayShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <Parallax className={styles.page}>
      <AuthBackground />
      <header className={styles.header}>
        <BrandMark size={32} />
        <BrandWordmark />
        <span className={styles.badge}>SECURITY GATE</span>
      </header>
      <main className={styles.main}>
        <div className={cx(styles.content, wide && styles.wide)}>{children}</div>
      </main>
    </Parallax>
  );
}
