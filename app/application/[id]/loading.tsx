/**
 * @design-guard
 * role: Loading skeleton for the application detail page during server-side data fetch
 * layer: ui
 * non_goals:
 *   - Actual data display
 *   - Error handling (handled by not-found.tsx and error boundary)
 * boundaries:
 *   depends_on: [components/ui/skeleton]
 *   exposes: [Loading]
 * invariants:
 *   - Skeleton layout mirrors the ApplicationDetail layout shape
 * authority:
 *   decides: [Skeleton dimensions and layout]
 *   delegates: [Skeleton rendering to shadcn Skeleton component]
 * extension_policy: Update skeleton when ApplicationDetail layout changes
 * failure_contract: Pure render — no failure modes
 * testing_contract: Verify skeleton renders without errors
 * references: [Next.js loading convention, components/application-detail.tsx]
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}
