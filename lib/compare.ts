/**
 * @design-guard
 * role: Field-by-field comparison of COLA application data against AI-extracted label text
 * layer: core
 * non_goals:
 *   - Label image processing or OCR (handled by API route + Claude)
 *   - Data persistence or caching
 * boundaries:
 *   depends_on: [lib/types.ts]
 *   exposes: [compareFields, fuzzyMatch, numericMatch, strictMatch]
 * invariants:
 *   - compareFields always returns a result for every field in FIELD_DEFS
 *   - overallResult is "fail" if any field fails, "flag" if any flags, else "pass"
 *   - Pure function — no side effects
 * authority:
 *   decides: [Match strategy per field, overall pass/fail logic]
 *   delegates: [Field definitions to FIELD_DEFS constant]
 * extension_policy: Add new matchers or field definitions as label requirements grow
 * failure_contract: Never throws — always returns a VerificationResult
 * testing_contract: Test each matcher (fuzzy, numeric, strict) and edge cases (nulls, empty strings)
 * references: [TTB COLA label requirements]
 */
import type {
  Application,
  ComparisonResult,
  ExtractedLabelFields,
  FieldComparison,
  VerificationResult,
} from "./types";

const WHITESPACE_RE = /\s+/g;
const ALL_WHITESPACE_RE = /\s/g;
const WORD_SPLIT_RE = /\s+/;
const CASING_DIFF_RE = /"(.+)" → "(.+)"/;

function normalize(s: string): string {
  return s.replace(WHITESPACE_RE, " ").trim().toLowerCase();
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
    normApp.replace(ALL_WHITESPACE_RE, "") ===
    normLabel.replace(ALL_WHITESPACE_RE, "")
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
  const appNum = Number.parseFloat(appValue.replace(/[^0-9.]/g, ""));
  const labelNum = Number.parseFloat(labelValue.replace(/[^0-9.]/g, ""));

  if (Number.isNaN(appNum) || Number.isNaN(labelNum)) {
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
  const appWords = appValue.split(WORD_SPLIT_RE);
  const labelWords = labelValue.split(WORD_SPLIT_RE);
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
    const parts = d.match(CASING_DIFF_RE);
    return parts !== null && parts[1].toLowerCase() === parts[2].toLowerCase();
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
  appKey: keyof Application;
  fieldName: string;
  labelKey: keyof ExtractedLabelFields;
  matcher: "fuzzy" | "numeric" | "strict";
}

const FIELD_DEFS: FieldDef[] = [
  {
    fieldName: "Brand Name",
    appKey: "brandName",
    labelKey: "brandName",
    matcher: "fuzzy",
  },
  {
    fieldName: "Fanciful Name",
    appKey: "fancifulName",
    labelKey: "fancifulName",
    matcher: "fuzzy",
  },
  {
    fieldName: "Class/Type",
    appKey: "classType",
    labelKey: "classType",
    matcher: "fuzzy",
  },
  { fieldName: "ABV", appKey: "abv", labelKey: "abv", matcher: "numeric" },
  {
    fieldName: "Net Contents",
    appKey: "netContents",
    labelKey: "netContents",
    matcher: "fuzzy",
  },
  {
    fieldName: "Government Warning",
    appKey: "governmentWarning",
    labelKey: "governmentWarning",
    matcher: "strict",
  },
  {
    fieldName: "Bottler Name",
    appKey: "bottlerName",
    labelKey: "bottlerName",
    matcher: "fuzzy",
  },
  {
    fieldName: "Bottler Address",
    appKey: "bottlerAddress",
    labelKey: "bottlerAddress",
    matcher: "fuzzy",
  },
  {
    fieldName: "Country of Origin",
    appKey: "countryOfOrigin",
    labelKey: "countryOfOrigin",
    matcher: "fuzzy",
  },
  {
    fieldName: "Age Statement",
    appKey: "ageStatement",
    labelKey: "ageStatement",
    matcher: "fuzzy",
  },
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
    if (!(appValue || labelValue)) {
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

    // Both values are confirmed non-null by the guards above
    const { result, note } = matchers[def.matcher](
      appValue as string,
      labelValue as string
    );
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
