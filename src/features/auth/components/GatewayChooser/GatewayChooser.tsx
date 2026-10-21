import Link from "next/link";
import { Icon } from "@/components/ui/Icon/Icon";
import { GATEWAYS } from "../../gateways";
import styles from "./GatewayChooser.module.scss";

/** `query` is a pre-sanitised string (reason / safe next) carried onto each gateway link. */
export function GatewayChooser({ query }: { query: string }) {
  return (
    <>
      <div className={styles.intro}>
        <p className={styles.pill}><Icon name="shield" size={14} />Role-Governed Access Portal</p>
        <h1 className={styles.title}>Sign in to OpsPilot</h1>
        <p className={styles.lead}>
          Choose your sign-in gateway. Your actual access is determined by your organization&apos;s
          role assignment, not by the gateway you pick.
        </p>
      </div>
      <ul className={styles.grid}>
        {GATEWAYS.map((g) => (
          <li key={g.slug}>
            <Link href={`/login/${g.slug}${query}`} className={styles.card}>
              <span className={styles.cardIcon}><Icon name={g.icon} /></span>
              <span>
                <span className={styles.cardTitle}>{g.title}</span>
                <span className={styles.cardText}>{g.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
