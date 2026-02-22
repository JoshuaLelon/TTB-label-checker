import { notFound } from "next/navigation";
import { getApplication } from "@/lib/data";
import { getCachedResult } from "@/lib/verification-cache";
import { ApplicationDetail } from "@/components/application-detail";

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

  const cachedResult = getCachedResult(id) ?? null;

  return <ApplicationDetail application={application} cachedResult={cachedResult} />;
}
