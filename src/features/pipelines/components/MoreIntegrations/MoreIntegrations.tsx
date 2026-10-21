import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";

/** Roadmap, stated plainly: nothing here is connected and no numbers are shown for it. */
export function MoreIntegrations() {
  return (
    <Card title="More integrations" flush>
      <EmptyState title="GitHub Actions is the only integration today">
        Jenkins, Argo CD and metrics sources are planned. They will appear here once they can be connected and tested.
      </EmptyState>
    </Card>
  );
}
