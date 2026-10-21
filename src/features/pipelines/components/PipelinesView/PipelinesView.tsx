"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Icon } from "@/components/ui/Icon/Icon";
import { MOCK_CLOUD_ENDPOINTS, MOCK_LOG_LINES, MOCK_PIPELINES, MOCK_THROUGHPUT, MOCK_WIZARD_STEPS } from "../../mock-data";
import type { EnvironmentName } from "../../types";
import { ActionButton } from "../ActionButton/ActionButton";
import { CloudEndpoints } from "../CloudEndpoints/CloudEndpoints";
import { ConnectionWizard } from "../ConnectionWizard/ConnectionWizard";
import { EventLogPanel } from "../EventLogPanel/EventLogPanel";
import { PipelinesPanel } from "../PipelinesPanel/PipelinesPanel";
import { ThroughputTile } from "../ThroughputTile/ThroughputTile";
import styles from "./PipelinesView.module.scss";

type EnvFilter = "all" | EnvironmentName;

export function PipelinesView() {
  const [env, setEnv] = useState<EnvFilter>("all");
  const clouds = useMemo(() => MOCK_CLOUD_ENDPOINTS.filter((c) => env === "all" || c.environment === env), [env]);
  const pipelines = useMemo(() => MOCK_PIPELINES.filter((p) => env === "all" || p.environment === env), [env]);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Fabric Orchestration // Multi-Cloud Mesh"
        title="Connected Clouds & Deployment Fabric"
        description="Multi-tenant cloud provider meshes, federated IAM credentials, and active deployment tracks across high-availability clusters."
        actions={
          <div className={styles.actions}>
            <label className={styles.select}>
              <Icon name="tune" size={16} />
              <span>Environment</span>
              <select value={env} onChange={(e) => setEnv(e.target.value as EnvFilter)}>
                <option value="all">All environments</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
              </select>
            </label>
            <ActionButton label="Sync Mesh Status" />
            <ActionButton label="Connect New Cloud Provider" kind="primary" />
          </div>
        }
      />
      <ConnectionWizard steps={MOCK_WIZARD_STEPS} />
      <CloudEndpoints clouds={clouds} />
      <PipelinesPanel pipelines={pipelines} />
      <div className={styles.bottom}>
        <EventLogPanel lines={MOCK_LOG_LINES} />
        <ThroughputTile {...MOCK_THROUGHPUT} />
      </div>
    </div>
  );
}
