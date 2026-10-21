"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon/Icon";
import { cx } from "@/lib/cx";
import { visibleNavItems } from "../../navigation";
import { useSession } from "../SessionProvider";
import styles from "./NavLinks.module.scss";

export function NavLinks() {
  const pathname = usePathname();
  const session = useSession();
  const items = visibleNavItems(session?.permissions ?? []);
  const sections = [...new Set(items.map((i) => i.section))];

  if (items.length === 0) {
    return <p className={styles.empty}>No sections are available for your account.</p>;
  }

  return (
    <nav aria-label="Primary" className={styles.nav}>
      {sections.map((section) => (
        <div key={section}>
          <h2 className={styles.section}>{section}</h2>
          <ul className={styles.list}>
            {items.filter((i) => i.section === section).map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={cx(styles.link, active && styles.active)}>
                    <Icon name={item.icon} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
