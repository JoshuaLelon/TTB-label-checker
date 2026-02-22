/**
 * @design-guard
 * role: Shared type definitions for the TTB label checker domain
 * layer: core
 * non_goals:
 *   - Runtime validation (handled by lib/schemas.ts)
 *   - Business logic (handled by lib/compare.ts)
 * boundaries:
 *   depends_on: []
 *   exposes: [Application, ExtractedLabelFields, ComparisonResult, FieldComparison, VerificationResult]
 * invariants:
 *   - Types are the single source of truth for domain shapes
 *   - No runtime code — types only
 * authority:
 *   decides: [Domain model shape]
 *   delegates: [Validation to schemas, comparison logic to compare]
 * extension_policy: Add new interfaces/types as domain grows
 * failure_contract: No runtime failures — compile-time only
 * testing_contract: No tests needed — type-only module
 * references: [data/applications.json schema]
 */
export interface Application {
  abv: string;
  ageStatement: string | null;
  allergens: string[];
  bottlerAddress: string;
  bottlerName: string;
  brandName: string;
  classType: string;
  countryOfOrigin: string | null;
  fancifulName: string | null;
  governmentWarning: string;
  id: string;
  labelImagePath: string;
  netContents: string;
  notes: string | null;
  status: "not_done" | "passed" | "failed";
}

export interface ExtractedLabelFields {
  abv: string | null;
  ageStatement: string | null;
  bottlerAddress: string | null;
  bottlerName: string | null;
  brandName: string | null;
  classType: string | null;
  countryOfOrigin: string | null;
  fancifulName: string | null;
  governmentWarning: string | null;
  netContents: string | null;
}

export type ComparisonResult = "pass" | "flag" | "fail" | "not_found";

export interface FieldComparison {
  applicationValue: string | null;
  fieldName: string;
  labelValue: string | null;
  note: string;
  result: ComparisonResult;
}

export interface VerificationResult {
  fields: FieldComparison[];
  overallResult: "pass" | "flag" | "fail";
  timestamp: string;
}
