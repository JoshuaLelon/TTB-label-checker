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
