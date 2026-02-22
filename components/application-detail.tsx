/**
 * @design-guard
 * role: Main application detail view — shows COLA data, label image, triggers verification, and handles pass/fail
 * layer: ui
 * non_goals:
 *   - Server-side data fetching (handled by page.tsx)
 *   - Verification logic (handled by API route + lib/compare.ts)
 * boundaries:
 *   depends_on: [components/status-badge, components/ui/*, lib/types.ts, lucide-react]
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

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildFields, FieldRow, ResultIcon } from "@/components/field-row";
import { useSessionStatus } from "@/components/session-status-provider";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Application, VerificationResult } from "@/lib/types";

interface Props {
  application: Application;
}

export function ApplicationDetail({ application }: Props) {
  const router = useRouter();
  const { setStatus: setSessionStatus } = useSessionStatus();
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decidedStatus, setDecidedStatus] = useState<
    "passed" | "failed" | null
  >(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  async function handleVerify() {
    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);
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
    setSessionStatus(application.id, status);
  }

  const fields = buildFields(application);

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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* App Data + Label Image side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Data</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {fields.map((f) => {
                  const result = f.fieldName
                    ? verificationResult?.fields.find(
                        (r) => r.fieldName === f.fieldName
                      )
                    : undefined;

                  return <FieldRow field={f} key={f.label} result={result} />;
                })}
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Label Image</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              className="relative w-full cursor-zoom-in"
              onClick={() => setIsImageEnlarged(true)}
              type="button"
            >
              <Image
                alt={`${application.brandName} label`}
                className="w-full rounded-lg"
                height={800}
                src={application.labelImagePath}
                width={600}
              />
            </button>
            <p className="mt-2 text-center text-muted-foreground text-xs">
              (click image to enlarge)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verify button — always visible, centered */}
      {!decidedStatus && (
        <div className="flex justify-center">
          <Button
            className="rounded-full px-6"
            disabled={isVerifying}
            onClick={handleVerify}
          >
            {isVerifying && "Analyzing..."}
            {!isVerifying && verificationResult && "Re-analyze Label"}
            {!(isVerifying || verificationResult) && "Analyze Label"}
          </Button>
        </div>
      )}

      {/* Pass/Fail buttons */}
      {!decidedStatus && (
        <div className="flex justify-center gap-3">
          <Button
            className="rounded-full bg-green-600 px-6 hover:bg-green-700"
            onClick={() => handleStatusUpdate("passed")}
          >
            Pass Application
          </Button>
          <Button
            className="rounded-full px-6"
            onClick={() => handleStatusUpdate("failed")}
            variant="destructive"
          >
            Fail Application
          </Button>
        </div>
      )}

      {/* Issues list */}
      {verificationResult &&
        (() => {
          const issues = verificationResult.fields.filter(
            (f) => f.result !== "pass"
          );
          if (issues.length === 0) {
            return null;
          }
          return (
            <div className="flex flex-col items-center space-y-2">
              {issues.map((f) => (
                <div
                  className="flex items-start gap-2 text-sm"
                  key={f.fieldName}
                >
                  <span className="mt-0.5 shrink-0">
                    <ResultIcon result={f.result} />
                  </span>
                  <p>
                    <span className="font-medium">{f.fieldName}:</span>{" "}
                    <span className="text-muted-foreground">{f.note}</span>
                  </p>
                </div>
              ))}
            </div>
          );
        })()}

      {/* Back button after decision */}
      {decidedStatus && (
        <div className="flex justify-center">
          <Button
            className="rounded-full px-6"
            onClick={() => router.push("/")}
            variant="outline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to All Applications
          </Button>
        </div>
      )}

      {/* Image lightbox */}
      <Dialog onOpenChange={setIsImageEnlarged} open={isImageEnlarged}>
        <DialogContent
          className="flex h-screen w-screen max-w-none items-center justify-center border-none bg-transparent p-0 shadow-none data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-none"
          onClick={() => setIsImageEnlarged(false)}
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {application.brandName} label
          </DialogTitle>
          <Image
            alt={`${application.brandName} label`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            height={1600}
            onClick={(e) => e.stopPropagation()}
            src={application.labelImagePath}
            width={1200}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
