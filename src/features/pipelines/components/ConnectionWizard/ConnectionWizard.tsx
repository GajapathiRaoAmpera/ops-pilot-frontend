"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { cx } from "@/lib/cx";
import type { WizardStep } from "../../types";
import styles from "./ConnectionWizard.module.scss";

/** Informational outline of the connection flow. Credentials are never typed here. */
export function ConnectionWizard({ steps }: { steps: WizardStep[] }) {
  const [open, setOpen] = useState(true);
  const panelId = useId();
  return (
    <section className={styles.wrap} aria-labelledby={`${panelId}-h`}>
      <header className={styles.head}>
        <div className={styles.title}>
          <Icon name="architecture" size={20} />
          <h2 id={`${panelId}-h`}>Federated Cloud Connection Pipeline</h2>
          <span className={styles.tag}>AUTOMATED_ONBOARDING</span>
        </div>
        <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? "close" : "expand_more"} size={18} />
          <span className={styles.srOnly}>{open ? "Hide connection steps" : "Show connection steps"}</span>
        </button>
      </header>
      {open && (
        <div id={panelId}>
          <ol className={styles.steps}>
            {steps.map((s) => (
              <li key={s.n} className={cx(styles.step, styles[s.tone])} aria-current={s.tone === "active" ? "step" : undefined}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNo}>STEP {s.n}</span>
                  <Icon name={s.icon} size={16} />
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.desc}>{s.description}</p>
                <p className={styles.state}>{s.stateLabel}</p>
              </li>
            ))}
          </ol>
          <p className={styles.note}>
            <Icon name="shield_lock" size={14} /> Preview only. Cloud secret keys are never entered in this app; connections rely on backend-managed
            federation or workload identity once the backend supports them.
          </p>
        </div>
      )}
    </section>
  );
}
