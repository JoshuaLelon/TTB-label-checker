export interface Application {
  id: string;
  brandName: string;
  fancifulName: string | null;
  classType: string;
  abv: string;
  netContents: string;
  governmentWarning: string;
  bottlerName: string;
  bottlerAddress: string;
  countryOfOrigin: string | null;
  allergens: string[];
  ageStatement: string | null;
  status: "not_done" | "passed" | "failed";
  labelImagePath: string;
  notes: string | null;
}

export interface ExtractedLabelFields {
  brandName: string | null;
  fancifulName: string | null;
  classType: string | null;
  abv: string | null;
  netContents: string | null;
  governmentWarning: string | null;
  bottlerName: string | null;
  bottlerAddress: string | null;
  countryOfOrigin: string | null;
  ageStatement: string | null;
}

export type ComparisonResult = "pass" | "flag" | "fail" | "not_found";

export interface FieldComparison {
  fieldName: string;
  applicationValue: string | null;
  labelValue: string | null;
  result: ComparisonResult;
  note: string;
}

export interface VerificationResult {
  fields: FieldComparison[];
  overallResult: "pass" | "flag" | "fail";
  timestamp: string;
}

export interface VerifyRequest {
  applicationId: string;
}

export interface VerifyResponse {
  result: VerificationResult;
}

export interface StatusRequest {
  applicationId: string;
  status: "passed" | "failed";
  verificationResult: VerificationResult;
}

export interface StatusResponse {
  success: boolean;
}
