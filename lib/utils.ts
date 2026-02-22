/**
 * @design-guard
 * role: Tailwind CSS class name utility (cn helper)
 * layer: core
 * non_goals:
 *   - Styling logic or design tokens
 *   - Component-specific class generation
 * boundaries:
 *   depends_on: [clsx, tailwind-merge]
 *   exposes: [cn]
 * invariants:
 *   - cn merges class names without duplicates via tailwind-merge
 * authority:
 *   decides: [Class name merging strategy]
 *   delegates: [Conflict resolution to tailwind-merge]
 * extension_policy: Sealed — single utility, no extension needed
 * failure_contract: Never throws — returns empty string on no input
 * testing_contract: No tests needed — thin wrapper over well-tested libraries
 * references: [shadcn/ui lib/utils.ts convention]
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
