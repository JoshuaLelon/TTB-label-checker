/**
 * @design-guard
 * role: Client component displaying pending review count adjusted for session decisions
 * layer: ui
 * non_goals:
 *   - Data fetching or status mutation
 * boundaries:
 *   depends_on: [components/session-status-provider]
 *   exposes: [PendingCount]
 * invariants:
 *   - Pending count = total - decided count from session context
 * authority:
 *   decides: [Pending count display]
 *   delegates: [Decision tracking to SessionStatusProvider]
 * extension_policy: Sealed
 * failure_contract: Pure render — no failure modes
 * testing_contract: Verify count decrements as statuses are set
 * references: [app/page.tsx]
 */
"use client";

import { useSessionStatus } from "@/components/session-status-provider";

export function PendingCount({ total }: { total: number }) {
  const { decidedCount } = useSessionStatus();
  const pending = total - decidedCount;

  return (
    <p className="mt-1 text-muted-foreground text-sm">
      {total} applications &middot; {pending} pending review
    </p>
  );
}
