import type {
  Application,
  ExtractedLabelFields,
  FieldComparison,
  ComparisonResult,
  VerificationResult,
} from "./types";

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

export function fuzzyMatch(
  appValue: string,
  labelValue: string
): { result: ComparisonResult; note: string } {
  const normApp = normalize(appValue);
  const normLabel = normalize(labelValue);

  if (normApp === normLabel) {
    return { result: "pass", note: "Exact match" };
  }

  // Check if only casing/whitespace differs
  if (
    normApp.replace(/\s/g, "") === normLabel.replace(/\s/g, "")
  ) {
    return {
      result: "flag",
      note: `Formatting difference: "${appValue}" vs "${labelValue}"`,
    };
  }

  return {
    result: "fail",
    note: `Mismatch: application says "${appValue}", label says "${labelValue}"`,
  };
}

export function numericMatch(
  appValue: string,
  labelValue: string
): { result: ComparisonResult; note: string } {
  const appNum = parseFloat(appValue.replace(/[^0-9.]/g, ""));
  const labelNum = parseFloat(labelValue.replace(/[^0-9.]/g, ""));

  if (isNaN(appNum) || isNaN(labelNum)) {
    return { result: "fail", note: "Could not parse numeric value" };
  }

  if (appNum === labelNum) {
    return { result: "pass", note: `${appNum}% matches` };
  }

  return {
    result: "fail",
    note: `ABV mismatch: application says ${appNum}%, label says ${labelNum}%`,
  };
}

export function strictMatch(
  appValue: string,
  labelValue: string
): { result: ComparisonResult; note: string } {
  if (appValue === labelValue) {
    return { result: "pass", note: "Exact match" };
  }

  // Find differing words
  const appWords = appValue.split(/\s+/);
  const labelWords = labelValue.split(/\s+/);
  const diffs: string[] = [];

  const maxLen = Math.max(appWords.length, labelWords.length);
  for (let i = 0; i < maxLen; i++) {
    const a = appWords[i] ?? "(missing)";
    const b = labelWords[i] ?? "(missing)";
    if (a !== b) {
      diffs.push(`"${a}" → "${b}"`);
    }
  }

  if (diffs.length === 0) {
    return { result: "pass", note: "Exact match" };
  }

  // If differences are minor (just casing), flag instead of fail
  const allCasingOnly = diffs.every((d) => {
    const parts = d.match(/"(.+)" → "(.+)"/);
    return parts && parts[1].toLowerCase() === parts[2].toLowerCase();
  });

  if (allCasingOnly) {
    return {
      result: "flag",
      note: `Minor differences: ${diffs.join(", ")}`,
    };
  }

  return {
    result: "fail",
    note: `Text differs: ${diffs.join(", ")}`,
  };
}

interface FieldDef {
  fieldName: string;
  appKey: keyof Application;
  labelKey: keyof ExtractedLabelFields;
  matcher: "fuzzy" | "numeric" | "strict";
}

const FIELD_DEFS: FieldDef[] = [
  { fieldName: "Brand Name", appKey: "brandName", labelKey: "brandName", matcher: "fuzzy" },
  { fieldName: "Fanciful Name", appKey: "fancifulName", labelKey: "fancifulName", matcher: "fuzzy" },
  { fieldName: "Class/Type", appKey: "classType", labelKey: "classType", matcher: "fuzzy" },
  { fieldName: "ABV", appKey: "abv", labelKey: "abv", matcher: "numeric" },
  { fieldName: "Net Contents", appKey: "netContents", labelKey: "netContents", matcher: "fuzzy" },
  { fieldName: "Government Warning", appKey: "governmentWarning", labelKey: "governmentWarning", matcher: "strict" },
  { fieldName: "Bottler Name", appKey: "bottlerName", labelKey: "bottlerName", matcher: "fuzzy" },
  { fieldName: "Bottler Address", appKey: "bottlerAddress", labelKey: "bottlerAddress", matcher: "fuzzy" },
  { fieldName: "Country of Origin", appKey: "countryOfOrigin", labelKey: "countryOfOrigin", matcher: "fuzzy" },
  { fieldName: "Age Statement", appKey: "ageStatement", labelKey: "ageStatement", matcher: "fuzzy" },
];

const matchers = {
  fuzzy: fuzzyMatch,
  numeric: numericMatch,
  strict: strictMatch,
};

export function compareFields(
  application: Application,
  extracted: ExtractedLabelFields
): VerificationResult {
  const fields: FieldComparison[] = FIELD_DEFS.map((def) => {
    const appValue = application[def.appKey] as string | null;
    const labelValue = extracted[def.labelKey] as string | null;

    // Both null/empty — not applicable, treat as pass
    if (!appValue && !labelValue) {
      return {
        fieldName: def.fieldName,
        applicationValue: appValue,
        labelValue,
        result: "pass" as ComparisonResult,
        note: "Not applicable — field empty in both",
      };
    }

    // App has value but label doesn't
    if (appValue && !labelValue) {
      return {
        fieldName: def.fieldName,
        applicationValue: appValue,
        labelValue,
        result: "not_found" as ComparisonResult,
        note: "Field not found on label",
      };
    }

    // Label has value but app doesn't — unexpected extra info
    if (!appValue && labelValue) {
      return {
        fieldName: def.fieldName,
        applicationValue: appValue,
        labelValue,
        result: "flag" as ComparisonResult,
        note: `Label shows "${labelValue}" but application has no value`,
      };
    }

    const { result, note } = matchers[def.matcher](appValue!, labelValue!);
    return {
      fieldName: def.fieldName,
      applicationValue: appValue,
      labelValue,
      result,
      note,
    };
  });

  // Determine overall result
  let overallResult: "pass" | "flag" | "fail" = "pass";
  for (const f of fields) {
    if (f.result === "fail" || f.result === "not_found") {
      overallResult = "fail";
      break;
    }
    if (f.result === "flag") {
      overallResult = "flag";
    }
  }

  return {
    fields,
    overallResult,
    timestamp: new Date().toISOString(),
  };
}
