import Link from "next/link";
import { Icon } from "@/components/ui/Icon/Icon";
import type { Gateway } from "../../gateways";
import { LoginForm } from "../LoginForm/LoginForm";
import styles from "./GatewayLogin.module.scss";

export function GatewayLogin({ gateway, next, notice }: { gateway: Gateway; next: string | null; notice?: string }) {
  return (
    <div className={styles.layout}>
      <section aria-labelledby="gw-heading" className={styles.panel}>
        <p className={styles.eyebrow}><Icon name={gateway.icon} size={16} />Role gateway</p>
        <h1 id="gw-heading" className={styles.title}>{gateway.title}</h1>
        <p className={styles.summary}>{gateway.summary}</p>
        <h2 className={styles.areasTitle}>Typical areas</h2>
        <ul className={styles.areas}>
          {gateway.areas.map((a) => <li key={a} className={styles.area}>{a}</li>)}
        </ul>
        <p className={styles.disclaimer}>
          This page is an entry point only. After sign-in, your role and permissions are verified by
          OpsPilot and determine what you can see and do.
        </p>
      </section>

      <section aria-labelledby="form-heading" className={styles.panel}>
        <h2 id="form-heading" className={styles.formTitle}>Sign in</h2>
        <p className={styles.formLead}>Use your work email and password.</p>
        <LoginForm next={next} notice={notice} submitLabel={gateway.cta} />
        <p className={styles.back}><Link href="/login">Choose a different gateway</Link></p>
      </section>
    </div>
  );
}
