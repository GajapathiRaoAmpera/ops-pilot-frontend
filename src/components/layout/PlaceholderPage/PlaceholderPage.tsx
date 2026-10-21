import styles from "./PlaceholderPage.module.scss";

export function PlaceholderPage({ title, stitchScreen }: { title: string; stitchScreen: string }) {
  return (
    <section>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.note}>
        Placeholder: this screen is not yet implemented and no backend endpoint exists for it.
        Visual reference: Stitch <code>{stitchScreen}</code>.
      </p>
    </section>
  );
}
