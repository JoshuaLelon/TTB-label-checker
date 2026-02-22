/**
 * @design-guard
 * role: Client component that renders a StatusBadge using session-level status
 * layer: ui
 * non_goals:
 *   - Status mutation
 * boundaries:
 *   depends_on: [components/session-status-provider, components/status-badge]
 *   exposes: [SessionStatusBadge]
 * invariants:
 *   - Falls back to "not_done" when no session status exists
 * authority:
 *   decides: [Fallback status display]
 *   delegates: [Status lookup to useSessionStatus, rendering to StatusBadge]
 * extension_policy: Sealed
 * failure_contract: Pure render — no failure modes
 * testing_contract: Verify fallback and override behavior
 * references: [app/page.tsx]
 */
"use client";

import { useSessionStatus } from "@/components/session-status-provider";
import { StatusBadge } from "@/components/status-badge";

export function SessionStatusBadge({ id }: { id: string }) {
  const { getStatus } = useSessionStatus();
  const sessionStatus = getStatus(id);

  return <StatusBadge status={sessionStatus ?? "not_done"} />;
}
