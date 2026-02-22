/**
 * @design-guard
 * role: Main application detail view — shows COLA data, label image, triggers verification, and handles pass/fail
 * layer: ui
 * non_goals:
 *   - Server-side data fetching (handled by page.tsx)
 *   - Verification logic (handled by API route + lib/compare.ts)
 * boundaries:
 *   depends_on: [components/status-badge, components/verification-results, components/ui/*, lib/types.ts]
 *   exposes: [ApplicationDetail]
 * invariants:
 *   - Verify button always available until user decides pass/fail
 *   - Pass/Fail buttons only show after verification completes
 *   - All state is ephemeral — page refresh resets everything
 * authority:
 *   decides: [UI state machine for verification flow]
 *   delegates: [Verification to /api/verify, routing to Next.js]
 * extension_policy: Extract sub-sections into components if complexity grows
 * failure_contract: Catches fetch errors and displays user-friendly messages
 * testing_contract: Test verification flow and error handling
 * references: [app/api/verify/route.ts]
 */
"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationResults } from "@/components/verification-results";
import type { Application, VerificationResult } from "@/lib/types";

interface Props {
  application: Application;
}

export function ApplicationDetail({ application }: Props) {
  const router = useRouter();
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decidedStatus, setDecidedStatus] = useState<
    "passed" | "failed" | null
  >(null);

  async function handleVerify() {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error ?? "Verification failed";
        setError(res.status >= 500 ? `${msg}. Please try again.` : msg);
        return;
      }
      const data = await res.json();
      setVerificationResult(data.result);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }
      setError("Network error — please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  function handleStatusUpdate(status: "passed" | "failed") {
    setDecidedStatus(status);
  }

  const fields = [
    { label: "COLA ID", value: application.id },
    { label: "Brand Name", value: application.brandName },
    { label: "Fanciful Name", value: application.fancifulName ?? "—" },
    { label: "Class/Type", value: application.classType },
    { label: "ABV", value: `${application.abv}%` },
    { label: "Net Contents", value: application.netContents },
    { label: "Bottler", value: application.bottlerName },
    { label: "Address", value: application.bottlerAddress },
    { label: "Country of Origin", value: application.countryOfOrigin ?? "—" },
    { label: "Age Statement", value: application.ageStatement ?? "—" },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Button onClick={() => router.push("/")} size="sm" variant="ghost">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h1 className="font-semibold text-2xl">{application.brandName}</h1>
        <StatusBadge status={decidedStatus ?? "not_done"} />
      </div>

      {/* Verification Results */}
      {verificationResult && (
        <>
          <VerificationResults fields={verificationResult.fields} />
          {!decidedStatus && (
            <div className="flex gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusUpdate("passed")}
              >
                Pass Application
              </Button>
              <Button
                onClick={() => handleStatusUpdate("failed")}
                variant="destructive"
              >
                Fail Application
              </Button>
            </div>
          )}
          <Separator />
        </>
      )}

      {/* Verifying skeleton */}
      {isVerifying && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Analyzing label with AI...
              </p>
              <div className="w-full max-w-md space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* App Data + Label Image side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Data</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {fields.map((f) => (
                <div className="flex justify-between gap-4" key={f.label}>
                  <dt className="font-medium text-muted-foreground text-sm">
                    {f.label}
                  </dt>
                  <dd className="text-right text-sm">{f.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Label Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border">
              <Image
                alt={`${application.brandName} label`}
                className="object-contain"
                fill
                src={application.labelImagePath}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verify button */}
      {!(isVerifying || decidedStatus) && (
        <Button onClick={handleVerify} size="lg">
          {verificationResult ? "Re-verify Label" : "Verify Label"}
        </Button>
      )}
    </div>
  );
}
