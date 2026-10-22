"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Loader } from "@/components/ui/Loader/Loader";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import styles from "./Cloud.module.scss";
import { callBackend, messageFor, referenceFor } from "@/lib/backend-client";

interface Status { connected: boolean; projectId: string | null; serviceAccount: string | null; keySet: boolean }
interface Inventory {
  projectId: string; fetchedAt: string; errors: Record<string, string>;
  compute: { name: string; zone: string; machineType: string; status: string }[];
  cloudRun: { name: string; region: string; uri: string | null; status: string }[];
  gke: { name: string; location: string; status: string; nodeCount: number | null }[];
}

const TEST_REASONS: Record<string, string> = {
  unauthorized: "Google rejected the key (deleted or disabled).",
  forbidden: "The service account lacks viewer access to this project.",
  not_found: "The project was not found.",
  unreachable: "Google Cloud could not be reached.",
  error: "Google Cloud returned an error.",
};
const API_NAMES: Record<string, string> = { compute: "Compute Engine", cloudRun: "Cloud Run", gke: "Kubernetes Engine" };
const TONE = (s: string) => (["RUNNING", "ready", "RUNNING_OK"].includes(s) ? "success" : ["STOPPED", "TERMINATED", "ERROR", "not_ready"].includes(s) ? "error" : "neutral") as "success" | "error" | "neutral";

export function CloudView({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const base = `workspaces/${workspaceId}/cloud/gcp`;
  const { notify } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [inv, setInv] = useState<Inventory | null>(null);
  const [loadingInv, setLoadingInv] = useState(false);
  const [key, setKey] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState<"save" | "test" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoadingInv(true);
    const r = await callBackend<Inventory>("GET", `${base}/inventory`);
    setLoadingInv(false);
    if (r.ok) setInv(r.data);
    else notify({ tone: "error", title: "Could not load the inventory", message: messageFor(r.detail), reference: referenceFor(r) });
  }, [base, notify]);

  const loadStatus = useCallback(async () => {
    const r = await callBackend<Status>("GET", base);
    if (!r.ok) return setError(messageFor(r.detail));
    setStatus(r.data);
    if (r.data.connected) void loadInventory(); else setInv(null);
  }, [base, loadInventory]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await callBackend<Status>("GET", base);
      if (cancelled) return;
      if (!r.ok) return setError(messageFor(r.detail));
      setStatus(r.data);
      if (r.data.connected) void loadInventory();
    })();
    return () => { cancelled = true; };
  }, [base, loadInventory]);

  async function pick(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (file.size > 10_000) return setError("That file is too large to be a service-account key.");
    setKey(await file.text());
    setFileName(file.name);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy || !key) return;
    setBusy("save"); setError(null);
    const r = await callBackend<Status>("PUT", base, { key });
    setBusy(null);
    if (!r.ok) return setError(messageFor(r.detail));
    setKey(""); setFileName("");
    notify({ tone: "success", title: "Google Cloud connected", message: "The key is stored encrypted and will not be shown again." });
    void loadStatus();
  }

  async function test() {
    setBusy("test");
    const r = await callBackend<{ ok: boolean; reason?: string }>("POST", `${base}/test`, {});
    setBusy(null);
    if (!r.ok) return notify({ tone: "error", title: "Could not run the test", message: messageFor(r.detail), reference: referenceFor(r) });
    if (r.data.ok) notify({ tone: "success", title: "Connection works", message: "Google Cloud accepted the key for this project." });
    else notify({ tone: "error", title: "Google Cloud connection failed", message: TEST_REASONS[r.data.reason ?? "error"] ?? TEST_REASONS.error, reference: r.data.reason ?? "error" });
  }

  async function remove() {
    if (!window.confirm("Disconnect Google Cloud for this workspace and delete the stored key?")) return;
    setBusy("remove");
    const r = await callBackend("DELETE", base);
    setBusy(null);
    if (!r.ok) return setError(messageFor(r.detail));
    notify({ tone: "success", title: "Google Cloud disconnected", message: "The stored key was deleted." });
    void loadStatus();
  }

  return (
    <div className={styles.stack}>
      <Card title={`Google Cloud · ${workspaceName}`}
        actions={status && <StatusBadge tone={status.connected ? "success" : "warning"}>{status.connected ? "connected" : "not connected"}</StatusBadge>}>
        {!status && !error ? <Loader /> : (
          <div className={styles.stack}>
            {error && <Notice variant="error">{error}</Notice>}
            {status?.connected && <p className={styles.meta}>Project <strong>{status.projectId}</strong> · read as {status.serviceAccount}</p>}
            <form onSubmit={save} className={styles.stack} noValidate>
              <label className={styles.picker}>
                {status?.connected ? "Replace the service-account key" : "Service-account key"}
                <span className={styles.drop}>
                  <span className={styles.dropButton}>Choose JSON file</span>
                  <span className={styles.dropName}>{fileName || "No file chosen"}</span>
                </span>
                <input className={styles.file} type="file" accept="application/json,.json" onChange={(e) => void pick(e.target.files?.[0])} />
              </label>
              <p className={styles.hint}>
                Create a service account in your project and grant it only the Viewer role, then create a JSON key for it.
                The key is encrypted at rest, cannot be viewed again, and OpsPilot only reads.
              </p>
              <div className={styles.actions}>
                <Button type="submit" loading={busy === "save"} disabled={busy !== null || !key}>{status?.connected ? "Replace key" : "Connect"}</Button>
                <Button type="button" variant="ghost" loading={busy === "test"} disabled={busy !== null || !status?.connected} onClick={() => void test()}>Test connection</Button>
                <Button type="button" variant="ghost" disabled={busy !== null || !status?.connected} onClick={() => void remove()}>Disconnect</Button>
              </div>
            </form>
          </div>
        )}
      </Card>

      {status?.connected && (
        <Card title="Inventory" actions={<Button variant="ghost" loading={loadingInv} disabled={loadingInv} onClick={() => void loadInventory()}>Refresh</Button>} flush>
          {!inv ? <Loader label="Reading your Google Cloud project…" /> : (
            <div>
              {Object.keys(inv.errors).length > 0 && <div className={styles.notices}>{Object.entries(inv.errors).map(([api, reason]) => (
                <Notice key={api} variant="info">{API_NAMES[api] ?? api} could not be read ({reason}). The API may be disabled or the account lacks access.</Notice>
              ))}</div>}
              <Section title="Virtual machines" empty="No virtual machines." skip={"compute" in inv.errors} rows={inv.compute.length}>
                <Table caption="Compute Engine instances">
                  <thead><tr><th scope="col">Name</th><th scope="col">Zone</th><th scope="col">Type</th><th scope="col">Status</th></tr></thead>
                  <tbody>{inv.compute.map((v) => <tr key={`${v.zone}/${v.name}`}><td>{v.name}</td><td>{v.zone}</td><td>{v.machineType}</td><td><StatusBadge tone={TONE(v.status)}>{v.status.toLowerCase()}</StatusBadge></td></tr>)}</tbody>
                </Table>
              </Section>
              <Section title="Cloud Run services" empty="No Cloud Run services." skip={"cloudRun" in inv.errors} rows={inv.cloudRun.length}>
                <Table caption="Cloud Run services">
                  <thead><tr><th scope="col">Name</th><th scope="col">Region</th><th scope="col">Address</th><th scope="col">Status</th></tr></thead>
                  <tbody>{inv.cloudRun.map((s) => <tr key={`${s.region}/${s.name}`}><td>{s.name}</td><td>{s.region}</td><td>{s.uri ?? "-"}</td><td><StatusBadge tone={TONE(s.status)}>{s.status.replace("_", " ")}</StatusBadge></td></tr>)}</tbody>
                </Table>
              </Section>
              <Section title="Kubernetes clusters" empty="No Kubernetes clusters." skip={"gke" in inv.errors} rows={inv.gke.length}>
                <Table caption="Kubernetes Engine clusters">
                  <thead><tr><th scope="col">Name</th><th scope="col">Location</th><th scope="col">Nodes</th><th scope="col">Status</th></tr></thead>
                  <tbody>{inv.gke.map((c) => <tr key={`${c.location}/${c.name}`}><td>{c.name}</td><td>{c.location}</td><td>{c.nodeCount ?? "-"}</td><td><StatusBadge tone={TONE(c.status)}>{c.status.toLowerCase()}</StatusBadge></td></tr>)}</tbody>
                </Table>
              </Section>
              <p className={styles.read}>Read {new Date(inv.fetchedAt).toLocaleString()}</p>
            </div>
          )}
        </Card>
      )}

      <Card title="Other clouds" flush>
        <div className={styles.providers}>
          {[["Amazon Web Services", "AWS"], ["Microsoft Azure", "Azure"]].map(([n, short]) => (
            <div key={n} className={styles.provider}>
              <span className={styles.providerName}>{n}<small>{short} connection is not available yet</small></span>
              <StatusBadge tone="neutral">Coming soon</StatusBadge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Section({ title, empty, rows, skip, children }: { title: string; empty: string; rows: number; skip: boolean; children: React.ReactNode }) {
  if (skip) return null;
  return (
    <section aria-label={title} className={styles.section}>
      <h3>{title} ({rows})</h3>
      {rows === 0 ? <EmptyState title={empty}>Nothing was found in this project.</EmptyState> : children}
    </section>
  );
}
