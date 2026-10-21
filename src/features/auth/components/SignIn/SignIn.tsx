import { Icon } from "@/components/ui/Icon/Icon";
import { LoginForm } from "../LoginForm/LoginForm";
import styles from "./SignIn.module.scss";

/** One sign-in for everyone. Role and landing page come only from the backend session. */
export function SignIn({ next, notice }: { next: string | null; notice?: string }) {
  return (
    <div className={styles.layout}>
      <section aria-labelledby="intro-heading" className={styles.panel}>
        <p className={styles.eyebrow}><Icon name="shield" size={16} />Role-governed access</p>
        <h1 id="intro-heading" className={styles.title}>Sign in to OpsPilot</h1>
        <p className={styles.summary}>
          One portal for pipelines, automation, approvals and audit. What you see and can do depends on
          your organization&apos;s role assignment.
        </p>
        <p className={styles.disclaimer}>
          Your role and permissions are verified by OpsPilot after sign-in; they are never chosen on this page.
        </p>
      </section>
      <section aria-labelledby="form-heading" className={styles.panel}>
        <h2 id="form-heading" className={styles.formTitle}>Sign in</h2>
        <p className={styles.formLead}>Use your work email and password.</p>
        <LoginForm next={next} notice={notice} />
      </section>
    </div>
  );
}
