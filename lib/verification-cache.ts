/**
 * @design-guard
 * role: In-memory cache for AI verification results to avoid redundant API calls
 * layer: core
 * non_goals:
 *   - Persistence across server restarts
 *   - Cache invalidation or TTL
 * boundaries:
 *   depends_on: [lib/types.ts]
 *   exposes: [getCachedResult, setCachedResult]
 * invariants:
 *   - Cache is keyed by applicationId
 *   - Cached results are immutable once stored
 * authority:
 *   decides: [Cache storage strategy (in-memory Map)]
 *   delegates: [Cache usage decisions to API routes]
 * extension_policy: Replace with Redis/persistent cache if needed
 * failure_contract: Never throws — returns undefined on cache miss
 * testing_contract: Test get/set round-trip and cache miss behavior
 * references: [app/api/verify/route.ts]
 */
import type { VerificationResult } from "./types";

const cache = new Map<string, VerificationResult>();

export function getCachedResult(
  applicationId: string
): VerificationResult | undefined {
  return cache.get(applicationId);
}

export function setCachedResult(
  applicationId: string,
  result: VerificationResult
): void {
  cache.set(applicationId, result);
}
