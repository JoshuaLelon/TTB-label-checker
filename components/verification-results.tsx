"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
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
            <TableHead className="w-10"></TableHead>
            <TableHead>Field</TableHead>
            <TableHead>Application Value</TableHead>
            <TableHead>Label Value</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.fieldName} className={RESULT_BG[field.result]}>
              <TableCell>{RESULT_ICONS[field.result]}</TableCell>
              <TableCell className="font-medium">{field.fieldName}</TableCell>
              <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
                {field.applicationValue ?? "—"}
              </TableCell>
              <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
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
