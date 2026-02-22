/**
 * @design-guard
 * role: Application detail page — fetches COLA data and renders the detail view
 * layer: ui
 * non_goals:
 *   - Verification UI logic (handled by ApplicationDetail component)
 *   - Data mutation (handled by API routes)
 * boundaries:
 *   depends_on: [next/navigation, components/application-detail, lib/data.ts]
 *   exposes: [ApplicationPage]
 * invariants:
 *   - Calls notFound() if application ID doesn't exist
 *   - Passes application data to client component; no cached state
 * authority:
 *   decides: [Data fetching, 404 handling]
 *   delegates: [All UI to ApplicationDetail component]
 * extension_policy: Add metadata generation for SEO if needed
 * failure_contract: Server component — Next.js handles errors via not-found.tsx
 * testing_contract: Test 404 behavior and successful render with cached/uncached results
 * references: [components/application-detail.tsx]
 */
import { notFound } from "next/navigation";
import { ApplicationDetail } from "@/components/application-detail";
import { getApplication } from "@/lib/data";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  return <ApplicationDetail application={application} />;
}
