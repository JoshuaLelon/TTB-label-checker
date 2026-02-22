/**
 * @design-guard
 * role: Visual badge showing application review status (not_done, passed, failed)
 * layer: ui
 * non_goals:
 *   - Status mutation or business logic
 *   - Status transition validation
 * boundaries:
 *   depends_on: [components/ui/badge]
 *   exposes: [StatusBadge]
 * invariants:
 *   - Renders correct label and color for each status value
 *   - STATUS_CONFIG is exhaustive over all status values
 * authority:
 *   decides: [Badge color mapping, display labels]
 *   delegates: [Badge rendering to shadcn Badge component]
 * extension_policy: Add new status values to STATUS_CONFIG as needed
 * failure_contract: Pure render — no failure modes
 * testing_contract: Verify each status renders with correct label and className
 * references: [lib/types.ts Application.status]
 */
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  not_done: {
    label: "Not Done",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
  passed: {
    label: "Passed",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
} as const;

export function StatusBadge({
  status,
}: {
  status: "not_done" | "passed" | "failed";
}) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={config.className} variant="secondary">
      {config.label}
    </Badge>
  );
}
