/**
 * @design-guard
 * role: Reusable field row component with animated verification result icons
 * layer: ui
 * non_goals:
 *   - Verification logic or API calls
 * boundaries:
 *   depends_on: [lucide-react, lib/types.ts]
 *   exposes: [FieldRow, ResultIcon, DisplayField, buildFields]
 * invariants:
 *   - ResultIcon covers all ComparisonResult values exhaustively
 *   - buildFields returns one entry per verifiable application field
 * authority:
 *   decides: [Field display layout, icon color mapping, N/A detection]
 *   delegates: [Comparison result data to lib/compare.ts]
 * extension_policy: Add new fields to buildFields as application schema grows
 * failure_contract: Pure render — no failure modes
 * testing_contract: Verify icon mapping and N/A detection
 * references: [lib/types.ts FieldComparison, lib/compare.ts FIELD_DEFS]
 */
"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type {
  Application,
  ComparisonResult,
  FieldComparison,
} from "@/lib/types";

export interface DisplayField {
  fieldName?: string;
  label: string;
  value: string;
}

export function ResultIcon({ result }: { result: ComparisonResult }) {
  switch (result) {
    case "pass":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "flag":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case "fail":
    case "not_found":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default: {
      const Exhaustive: never = result;
      return Exhaustive;
    }
  }
}

export function FieldRow({
  field,
  result,
}: {
  field: DisplayField;
  result: FieldComparison | undefined;
}) {
  const hasResult = !!result;
  const isNA = hasResult && !result.applicationValue && !result.labelValue;

  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 font-medium text-muted-foreground text-sm">
        {field.label}
      </dt>
      <dd className="flex min-w-0 items-center justify-end text-sm">
        {field.value === "?" ? (
          <HelpCircle
            className={`h-4 w-4 text-muted-foreground/50 transition-opacity duration-300 ${hasResult ? "hidden" : ""}`}
          />
        ) : (
          <span
            className={`truncate ${field.value === "N/A" && hasResult ? "hidden" : ""}`}
          >
            {field.value}
          </span>
        )}
        {field.fieldName !== undefined && (
          <span
            className={`inline-flex shrink-0 overflow-hidden transition-all duration-300 ease-out ${
              hasResult
                ? `${isNA ? "ml-2 w-6" : "ml-2 w-4"} opacity-100`
                : "ml-0 w-0 opacity-0"
            }`}
          >
            {hasResult &&
              (isNA ? (
                <span className="text-muted-foreground text-xs">N/A</span>
              ) : (
                <ResultIcon result={result.result} />
              ))}
          </span>
        )}
      </dd>
    </div>
  );
}

export function buildFields(app: Application): DisplayField[] {
  return [
    { label: "COLA ID", value: app.id },
    { label: "Brand Name", value: app.brandName, fieldName: "Brand Name" },
    {
      label: "Fanciful Name",
      value: app.fancifulName ?? "N/A",
      fieldName: "Fanciful Name",
    },
    { label: "Class/Type", value: app.classType, fieldName: "Class/Type" },
    { label: "ABV", value: `${app.abv}%`, fieldName: "ABV" },
    {
      label: "Net Contents",
      value: app.netContents,
      fieldName: "Net Contents",
    },
    { label: "Bottler", value: app.bottlerName, fieldName: "Bottler Name" },
    {
      label: "Address",
      value: app.bottlerAddress,
      fieldName: "Bottler Address",
    },
    {
      label: "Country of Origin",
      value: app.countryOfOrigin ?? "N/A",
      fieldName: "Country of Origin",
    },
    {
      label: "Age Statement",
      value: app.ageStatement ?? "N/A",
      fieldName: "Age Statement",
    },
    {
      label: "Gov. Warning",
      value: "?",
      fieldName: "Government Warning",
    },
  ];
}
