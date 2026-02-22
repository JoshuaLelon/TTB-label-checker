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
