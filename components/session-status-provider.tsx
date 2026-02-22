/**
 * @design-guard
 * role: React context provider for ephemeral pass/fail status shared across pages
 * layer: ui
 * non_goals:
 *   - Persistent storage — state resets on page refresh by design
 * boundaries:
 *   depends_on: [react]
 *   exposes: [SessionStatusProvider, useSessionStatus]
 * invariants:
 *   - Status map persists across client-side navigations only
 *   - Context value is memoized to prevent unnecessary re-renders
 * authority:
 *   decides: [In-memory status storage strategy]
 *   delegates: [Status display to StatusBadge]
 * extension_policy: Sealed — swap for persistent store if needed
 * failure_contract: Never throws — returns undefined for unknown IDs
 * testing_contract: Test get/set round-trip and reset on provider remount
 * references: [components/application-detail.tsx, components/session-status-badge.tsx]
 */
"use client";

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";

type Status = "passed" | "failed";

interface SessionStatusContextValue {
  getStatus: (id: string) => Status | undefined;
  setStatus: (id: string, status: Status) => void;
}

const SessionStatusContext = createContext<SessionStatusContextValue>({
  getStatus: () => undefined,
  setStatus: () => undefined,
});

export function SessionStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Map<string, Status>>(
    () => new Map()
  );

  const getStatus = useCallback((id: string) => statuses.get(id), [statuses]);

  const setStatus = useCallback((id: string, status: Status) => {
    setStatuses((prev) => new Map(prev).set(id, status));
  }, []);

  const value = useMemo(
    () => ({ getStatus, setStatus }),
    [getStatus, setStatus]
  );

  return <SessionStatusContext value={value}>{children}</SessionStatusContext>;
}

export function useSessionStatus() {
  return use(SessionStatusContext);
}
