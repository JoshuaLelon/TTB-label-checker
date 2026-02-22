"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { VerificationResults } from "@/components/verification-results";
import type { Application, VerificationResult } from "@/lib/types";
import { Loader2, ArrowLeft } from "lucide-react";

interface Props {
  application: Application;
  cachedResult?: VerificationResult | null;
}

export function ApplicationDetail({ application, cachedResult }: Props) {
  const router = useRouter();
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(cachedResult ?? null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isReadOnly = application.status !== "not_done";

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
    } catch {
      setError("Network error — please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleStatusUpdate(status: "passed" | "failed") {
    if (!verificationResult) return;
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          status,
          verificationResult,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error ?? "Failed to update status";
        setError(res.status >= 500 ? `${msg}. Please try again.` : msg);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    }
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
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-semibold">{application.brandName}</h1>
        <StatusBadge status={application.status} />
      </div>

      {/* Verification Results */}
      {verificationResult && (
        <>
          <VerificationResults fields={verificationResult.fields} />
          {!isReadOnly && (
            <div className="flex gap-3">
              <Button
                onClick={() => handleStatusUpdate("passed")}
                className="bg-green-600 hover:bg-green-700"
              >
                Pass Application
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate("failed")}
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
              <p className="text-muted-foreground">Analyzing label with AI...</p>
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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
                <div key={f.label} className="flex justify-between gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">
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
                src={application.labelImagePath}
                alt={`${application.brandName} label`}
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verify button */}
      {!isVerifying && !verificationResult && !isReadOnly && (
        <Button size="lg" onClick={handleVerify}>
          Verify Label
        </Button>
      )}

      {/* Read-only notes for already-decided applications */}
      {isReadOnly && application.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{application.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
