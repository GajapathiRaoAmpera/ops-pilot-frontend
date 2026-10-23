"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cx } from "@/lib/cx";
import styles from "./Landing.module.scss";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * Turns on the page's scroll reveals: anything marked `data-reveal` gets `data-shown` as it enters the viewport, and
 * `data-tilt` cards lean toward the pointer. Without JS, or with reduced motion, everything simply stays visible.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (reducedMotion() || typeof IntersectionObserver === "undefined") return;
    const root = document.documentElement;
    root.dataset.reveal = "on";
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).dataset.shown = "true";
        io.unobserve(e.target);
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>("[data-tilt]");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
      card.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
    };
    const onLeave = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>("[data-tilt]");
      if (card && !card.contains(e.relatedTarget as Node | null)) { card.style.removeProperty("--mx"); card.style.removeProperty("--my"); }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave);
    return () => {
      io.disconnect();
      delete root.dataset.reveal;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
    };
  }, []);
  return null;
}

/** A line of type whose words rise in one after another when it scrolls into view. */
export function Words({ text }: { text: string }) {
  return (
    <span data-reveal="" className={styles.words} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true" style={{ "--i": i } as CSSProperties}>{w} </span>
      ))}
    </span>
  );
}

const CAUSES = ["a flaky test", "a missing env var", "lockfile drift", "an expired token", "a typo in the YAML"];

/** The hero's terminal chip: it types a few real kinds of failure, one after another. Decorative. */
export function TypedCause() {
  const [text, setText] = useState(CAUSES[0]);
  useEffect(() => {
    if (reducedMotion()) return;
    // Erase the shown cause, type the next one, hold it, repeat.
    let word = 0, len = CAUSES[0].length, deleting = true, timer = 0;
    const tick = () => {
      let delay = deleting ? 28 : 55;
      if (deleting && --len === 0) { deleting = false; word = (word + 1) % CAUSES.length; }
      else if (!deleting && ++len === CAUSES[word].length) { deleting = true; delay = 2200; }
      setText(CAUSES[word].slice(0, len));
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, 2600);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <p className={styles.terminal} aria-hidden="true">
      <span className={styles.fail}>✗ test</span>
      <span className={styles.prompt}>pilot: caused by</span>
      <span className={styles.typed}>{text}</span><span className={styles.caret} />
    </p>
  );
}

const LOG = [
  { n: 212, text: "$ npm test -- --ci" },
  { n: 213, text: "PASS  src/cart/total.test.ts" },
  { n: 214, text: "FAIL  src/checkout/pay.test.ts", bad: true },
  { n: 215, text: "  ● pay › charges the saved card" },
  { n: 216, text: "    TypeError: Cannot read properties of undefined (reading 'id')", bad: true, key: true },
  { n: 217, text: "      at chargeCard (src/checkout/pay.ts:41:23)" },
  { n: 218, text: "Tests: 1 failed, 147 passed" },
];

/**
 * A sample failed log, the kind Pilot reads. Point at (or tap) the error line and Pilot explains it, the way the
 * AI Copilot does for a real run. The example is illustrative; the explanation style is the product's.
 */
export function LogCard() {
  const [open, setOpen] = useState(false);
  return (
    <figure className={styles.log} data-reveal="">
      <figcaption className={styles.logHead}>
        <span className={styles.logDots} aria-hidden="true"><i /><i /><i /></span>
        <span>ci / test · run #4182</span>
        <span className={styles.logFail}>failed</span>
      </figcaption>
      <ol className={styles.logBody}>
        {LOG.map((l) => (
          <li key={l.n} className={cx(l.bad && styles.logBad)}>
            <span className={styles.logNum} aria-hidden="true">{l.n}</span>
            {l.key ? (
              <button type="button" className={cx(styles.logKey, open && styles.logKeyOpen)} aria-expanded={open}
                aria-controls="log-explain" onClick={() => setOpen(!open)} onMouseEnter={() => setOpen(true)}
                data-pilot-say="That's the line. pay.ts reads card.id before the card has loaded.">
                {l.text}
              </button>
            ) : <code>{l.text}</code>}
          </li>
        ))}
      </ol>
      <div id="log-explain" className={styles.explain} data-open={open}>
        <div>
          <span className={styles.explainTag}>Pilot</span>
          <p>
            <strong>card is undefined at pay.ts:41.</strong> The test stubs no saved card, so <code>card.id</code> throws.
            Guard for a missing card, or add one to the fixture. I can draft either fix for review.
          </p>
        </div>
      </div>
      {!open && <p className={styles.logHint} aria-hidden="true">↑ Point at (or tap) the red line</p>}
    </figure>
  );
}
