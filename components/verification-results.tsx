/**
 * @design-guard
 * role: Table displaying field-by-field verification results with pass/fail/flag indicators
 * layer: ui
 * non_goals:
 *   - Verification logic (handled by lib/compare.ts)
 *   - Data fetching or API calls
 * boundaries:
 *   depends_on: [components/ui/table, lib/types.ts, lucide-react]
 *   exposes: [VerificationResults]
 * invariants:
 *   - Renders one row per FieldComparison
 *   - Row background color reflects result severity
 * authority:
 *   decides: [Result icon mapping, row styling]
 *   delegates: [Table rendering to shadcn Table, comparison logic to lib/compare.ts]
 * extension_policy: Add columns or result types as verification evolves
 * failure_contract: Pure render — no failure modes
 * testing_contract: Verify correct icon and background for each result type
 * references: [lib/types.ts FieldComparison]
 */
"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FieldComparison } from "@/lib/types";

const RESULT_ICONS = {
  pass: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  flag: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  fail: <XCircle className="h-5 w-5 text-red-600" />,
  not_found: <HelpCircle className="h-5 w-5 text-red-600" />,
};

const RESULT_BG = {
  pass: "",
  flag: "bg-yellow-50",
  fail: "bg-red-50",
  not_found: "bg-red-50",
};

export function VerificationResults({ fields }: { fields: FieldComparison[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Field</TableHead>
            <TableHead>Application Value</TableHead>
            <TableHead>Label Value</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow className={RESULT_BG[field.result]} key={field.fieldName}>
              <TableCell>{RESULT_ICONS[field.result]}</TableCell>
              <TableCell className="font-medium">{field.fieldName}</TableCell>
              <TableCell className="max-w-48 truncate text-muted-foreground text-sm">
                {field.applicationValue ?? "—"}
              </TableCell>
              <TableCell className="max-w-48 truncate text-muted-foreground text-sm">
                {field.labelValue ?? "—"}
              </TableCell>
              <TableCell className="text-sm">{field.note}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
