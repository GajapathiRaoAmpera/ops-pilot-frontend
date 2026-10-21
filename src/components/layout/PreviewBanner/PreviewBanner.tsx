import styles from "./PreviewBanner.module.scss";

export function PreviewBanner() {
  return (
    <div role="status" className={styles.banner}>
      UI preview: authentication and permission guards are OFF (OPSPILOT_AUTH_GUARD=off). Development only.
    </div>
  );
}
