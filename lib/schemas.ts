/**
 * @design-guard
 * role: Zod schemas for API request/response validation at system boundaries
 * layer: core
 * non_goals:
 *   - Domain type definitions (handled by lib/types.ts)
 *   - Business logic or data transformation
 * boundaries:
 *   depends_on: [zod]
 *   exposes: [verifyRequestSchema, statusRequestSchema, extractedLabelFieldsSchema]
 * invariants:
 *   - Schemas mirror the shapes in lib/types.ts
 *   - All API inputs are validated through these schemas before use
 * authority:
 *   decides: [Input validation rules, required fields]
 *   delegates: [Type definitions to lib/types.ts]
 * extension_policy: Add new schemas as API endpoints are added
 * failure_contract: safeParse returns success: false with structured error issues
 * testing_contract: Test that valid inputs pass and invalid inputs fail with correct messages
 * references: [Zod docs, lib/types.ts]
 */
import { z } from "zod";

export const verifyRequestSchema = z.object({
  applicationId: z.string().min(1, "applicationId is required"),
});

export const statusRequestSchema = z.object({
  applicationId: z.string().min(1, "applicationId is required"),
  status: z.enum(["passed", "failed"]),
  verificationResult: z.object({
    fields: z.array(
      z.object({
        fieldName: z.string(),
        applicationValue: z.string().nullable(),
        labelValue: z.string().nullable(),
        result: z.enum(["pass", "flag", "fail", "not_found"]),
        note: z.string(),
      })
    ),
    overallResult: z.enum(["pass", "flag", "fail"]),
    timestamp: z.string(),
  }),
});

export const extractedLabelFieldsSchema = z.object({
  brandName: z.string().nullable(),
  fancifulName: z.string().nullable(),
  classType: z.string().nullable(),
  abv: z.string().nullable(),
  netContents: z.string().nullable(),
  governmentWarning: z.string().nullable(),
  bottlerName: z.string().nullable(),
  bottlerAddress: z.string().nullable(),
  countryOfOrigin: z.string().nullable(),
  ageStatement: z.string().nullable(),
});
