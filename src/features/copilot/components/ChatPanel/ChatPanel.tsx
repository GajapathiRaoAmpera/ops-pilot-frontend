import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { suggestedQueries, transcript } from "../../mock-data";
import styles from "./ChatPanel.module.scss";

const NOT_CONNECTED = "Not connected to a backend. Nothing will be executed.";

export function ChatPanel() {
  return (
    <Card title="Copilot Session" actions={<StatusBadge tone="neutral" icon="science">Mock transcript</StatusBadge>}>
      <p className={styles.hint}>Static example conversation. No session, stream or model is connected, and tool results below are sample values.</p>
      <ul className={styles.chat} aria-label="Sample transcript">
        {transcript.map((t) => (
          <li key={t.time} className={t.who === "user" ? styles.user : styles.ai}>
            <span className={styles.who}>{t.name} - <time>{t.time}</time></span>
            <p>{t.text}</p>
            {t.tools && (
              <ul className={styles.tools} aria-label="Sample tool activity, not real events">
                {t.tools.map((x) => (
                  <li key={x.label}><span><Icon name="build" size={14} /> {x.label}</span><strong>{x.result}</strong></li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className={styles.queries}>
        {suggestedQueries.map((q) => <Button key={q} variant="ghost" disabled title={NOT_CONNECTED}>{q}</Button>)}
      </div>
      <form className={styles.compose} aria-label="Ask Copilot (unavailable)">
        <label htmlFor="copilot-input" className={styles.srOnly}>Message to Copilot</label>
        <input id="copilot-input" className={styles.input} disabled placeholder="Copilot chat is not connected to a backend" />
        <Button type="submit" disabled aria-label="Send message (unavailable)"><Icon name="arrow_upward" size={16} /></Button>
      </form>
      <p className={styles.hint}>{NOT_CONNECTED}</p>
    </Card>
  );
}
