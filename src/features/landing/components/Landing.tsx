import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { Icon } from "@/components/ui/Icon/Icon";
import { STORY } from "../story";
import { HeroWithPilot } from "./HeroWithPilot";
import styles from "./Landing.module.scss";

const GUARDRAILS = [
  { title: "Two people for every action", text: "Re-runs and fix pull requests wait for someone other than the requester. A self-approval is refused and recorded as", code: "approval.denied" },
  { title: "A short list of actions", text: "OpsPilot can re-run failed jobs and open a fix pull request. Nothing else, and it never merges." },
  { title: "Read-only cloud", text: "Google Cloud connects through a service account with the Viewer role. OpsPilot lists what is running and cannot change it." },
  { title: "Tokens stay hidden", text: "GitHub tokens are stored encrypted and never shown again after you save them." },
  { title: "Organizations stay apart", text: "Each organization sees only its own workspaces. Platform operators manage organizations without seeing their pipelines, approvals or logs." },
];

type Access = boolean | string;
const ROLES = ["Organization admin", "Workspace admin", "DevOps engineer", "Developer", "Security auditor", "Viewer"];
// Mirrors the backend's role definitions (app/rbac.py); the server enforces them on every request.
const MATRIX: [string, Access[]][] = [
  ["View pipeline runs", [true, true, true, true, true, true]],
  ["Ask the AI Copilot", [true, true, true, true, "Read only", false]],
  ["Request a re-run or fix", [true, true, true, false, false, false]],
  ["Approve requests", [true, true, false, false, false, false]],
  ["Invite people", [true, "Own workspace", false, false, false, false]],
  ["Read the audit trail", [true, "Own workspace", false, false, true, false]],
  ["Connect GitHub", [true, true, false, false, false, false]],
  ["Connect a cloud account", [true, false, false, false, false, false]],
];

function Cell({ value }: { value: Access }) {
  if (typeof value === "string") return <span className={styles.partial}>{value}</span>;
  return value
    ? <><Icon name="check" size={18} /><span className={styles.sr}>Yes</span></>
    : <><span className={styles.no} aria-hidden="true" /><span className={styles.sr}>No</span></>;
}

/** Pilot's comment on a role-matrix row: who can do it, in plain words. */
function sayFor(label: string, cells: Access[]): string {
  const who = ROLES.filter((_, i) => cells[i] === true).map((r) => r.toLowerCase());
  if (who.length === ROLES.length) return `${label}: every role can.`;
  if (who.length === 1) return `${label}: only the ${who[0]}.`;
  return `${label}: ${who.slice(0, -1).join(", ")} and ${who.at(-1)}.`;
}

export function Landing() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main">Skip to content</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}><BrandMark size={28} /><span>OpsPilot</span></Link>
        <nav aria-label="Sections" className={styles.nav}>
          <a href="#how">How it works</a>
          <a href="#guardrails">Guardrails</a>
          <a href="#roles">Roles</a>
        </nav>
        <Link href="/login" className={styles.signInSmall}>Sign in</Link>
      </header>

      <main id="main">
        <section className={styles.intro} aria-labelledby="hero-title">
          <h1 id="hero-title" className={styles.title}>
            <span>Every failed run explained.</span> <span>Every fix approved by a person.</span>
          </h1>
          <div className={styles.lede}>
            <p>
              OpsPilot syncs your GitHub Actions runs. When one fails, its AI reads the log, tells you why, and drafts
              the fix. Nothing changes until a second person on your team approves it.
            </p>
            <div className={styles.ctas}>
              <Link href="/login" className={styles.primary}>Sign in</Link>
              <a href="#how" className={styles.secondary}>See how it works</a>
            </div>
          </div>
        </section>

        <section id="hero-scene" className={styles.heroScene} aria-label="A failed run, from failure to approved fix">
          <HeroWithPilot heroId="hero-scene" />
        </section>

        <section id="how" className={styles.split} aria-labelledby="how-title"
          data-pilot-line="Every step here leaves a line in the audit trail." data-pilot-mood="curious" data-pilot-side="right">
          <div className={styles.aside}>
            <h2 id="how-title" className={styles.h2}>Each step leaves a line in the audit trail</h2>
            <p className={styles.muted}>
              Who synced, who asked the AI, who requested the change and who approved it. Your auditors read the same
              record your engineers do.
            </p>
          </div>
          <ol className={styles.ledger}>
            {STORY.map((s, i) => (
              <li key={s.title} className={styles.entry} data-pilot-say={`"${s.title}" is recorded as ${s.audit}.`}>
                <span className={styles.entryNum}>{i + 1}</span>
                <div>
                  <h3 className={styles.h3}>{s.title}</h3>
                  <p className={styles.muted}>{s.detail}</p>
                </div>
                <code className={styles.event}>{s.audit}</code>
              </li>
            ))}
          </ol>
        </section>

        <section id="guardrails" className={styles.split} aria-labelledby="guardrails-title"
          data-pilot-line="I can't act alone. A person always decides." data-pilot-mood="idle" data-pilot-side="left">
          <div className={styles.aside}>
            <h2 id="guardrails-title" className={styles.h2}>Built so the AI can&apos;t act alone</h2>
            <p className={styles.muted}>These rules are checked by the server, not just hidden in the interface.</p>
          </div>
          <dl className={styles.rules}>
            {GUARDRAILS.map((g) => (
              <div key={g.title} className={styles.rule} data-pilot-say={`${g.title}. The server enforces this one.`}>
                <dt className={styles.h3}>{g.title}</dt>
                <dd className={styles.muted}>{g.text}{g.code && <> <code className={styles.inlineCode}>{g.code}</code>.</>}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="roles" className={styles.roles} aria-labelledby="roles-title"
          data-pilot-line="Your role decides what you see. The server checks it every time." data-pilot-mood="curious" data-pilot-side="right">
          <div className={styles.rolesHead}>
            <h2 id="roles-title" className={styles.h2}>Who can do what</h2>
            <p className={styles.muted}>
              Give a role for the whole organization or for one workspace. People see only what their role allows.
            </p>
          </div>
          <div className={styles.tableWrap} tabIndex={0} role="region" aria-labelledby="roles-title">
            <table className={styles.table}>
              <caption className={styles.sr}>What each role can do in OpsPilot</caption>
              <thead>
                <tr><th scope="col"><span className={styles.sr}>Permission</span></th>{ROLES.map((r) => <th key={r} scope="col">{r}</th>)}</tr>
              </thead>
              <tbody>
                {MATRIX.map(([label, cells]) => (
                  <tr key={label} data-pilot-say={sayFor(label, cells)}>
                    <th scope="row">{label}</th>
                    {cells.map((c, i) => <td key={ROLES[i]}><Cell value={c} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="closing-title"
          data-pilot-line="Got an invitation? Sign in and I'll meet you inside." data-pilot-mood="success" data-pilot-side="right">
          <h2 id="closing-title" className={styles.h2}>Have an invitation?</h2>
          <p className={styles.muted}>
            Accounts are created by invitation from your organization&apos;s administrator. Sign in with the email it
            was sent to.
          </p>
          <Link href="/login" className={styles.primary}>Sign in</Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.brand}><BrandMark size={22} /><span>OpsPilot</span></span>
        <span className={styles.muted}>DevOps automation with a human in the loop.</span>
      </footer>
    </div>
  );
}
