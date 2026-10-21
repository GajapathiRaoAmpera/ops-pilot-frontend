import Link from "next/link";
import { landingPath } from "@/features/auth/navigation";
import { requireSession } from "@/features/auth/server/session";
import styles from "./unauthorized.module.scss";

export const metadata = { title: "Access denied · OpsPilot" };

export default async function UnauthorizedPage() {
  const session = await requireSession();
  const home = landingPath(session.permissions);
  return (
    <section role="alert" className={styles.box}>
      <h1 className={styles.title}>Access denied</h1>
      <p className={styles.text}>
        Your account does not have permission to view this page. If you believe this is a mistake,
        contact your organization administrator.
      </p>
      {home && <Link href={home} className={styles.cta}>Go to an available page</Link>}
    </section>
  );
}
