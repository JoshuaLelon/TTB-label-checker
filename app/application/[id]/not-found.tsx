/**
 * @design-guard
 * role: 404 page for invalid application IDs
 * layer: ui
 * non_goals:
 *   - Error recovery or suggestions
 *   - Search functionality
 * boundaries:
 *   depends_on: [next/link, components/ui/button]
 *   exposes: [NotFound]
 * invariants:
 *   - Always shows a back link to the applications list
 * authority:
 *   decides: [404 message copy, layout]
 *   delegates: [Navigation to Next.js Link]
 * extension_policy: Add search or suggestion links if needed
 * failure_contract: Pure render — no failure modes
 * testing_contract: Verify message and back link render correctly
 * references: [Next.js not-found convention]
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="font-semibold text-2xl">Application Not Found</h2>
      <p className="text-muted-foreground">
        The requested COLA application could not be found.
      </p>
      <Button asChild>
        <Link href="/">Back to Applications</Link>
      </Button>
    </div>
  );
}
