import Link from "next/link";
import { getApplications } from "@/lib/data";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function Home() {
  const applications = await getApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">COLA Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {applications.length} applications &middot;{" "}
          {applications.filter((a) => a.status === "not_done").length} pending review
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>COLA ID</TableHead>
              <TableHead>Brand Name</TableHead>
              <TableHead>Class/Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <Link
                    href={`/application/${app.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {app.id}
                  </Link>
                </TableCell>
                <TableCell>{app.brandName}</TableCell>
                <TableCell>{app.classType}</TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
