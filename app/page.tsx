/**
 * @design-guard
 * role: Home page showing the COLA applications table with status and links
 * layer: ui
 * non_goals:
 *   - Application filtering or search
 *   - Inline editing of applications
 * boundaries:
 *   depends_on: [next/link, components/status-badge, components/ui/table, lib/data.ts]
 *   exposes: [Home page component, dynamic export]
 * invariants:
 *   - Always shows all applications from data source
 *   - force-dynamic ensures fresh data on every request
 * authority:
 *   decides: [Table columns, application display format]
 *   delegates: [Data fetching to lib/data.ts, status display to StatusBadge]
 * extension_policy: Add sorting, filtering, or pagination as dataset grows
 * failure_contract: Server component — Next.js handles data fetch errors
 * testing_contract: Verify table renders with correct columns and links
 * references: [lib/data.ts getApplications]
 */
import Link from "next/link";
import { SessionStatusBadge } from "@/components/session-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApplications } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const applications = await getApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">COLA Applications</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {applications.length} applications &middot;{" "}
          {applications.filter((a) => a.status === "not_done").length} pending
          review
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    href={`/application/${app.id}`}
                  >
                    {app.brandName}{" "}
                    <span className="text-muted-foreground">
                      ({app.classType})
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <SessionStatusBadge id={app.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
