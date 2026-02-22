import { promises as fs } from "node:fs";
import path from "node:path";
import { compareFields } from "../lib/compare";
import { extractFromLabel } from "../lib/extract";
import type { Application, ComparisonResult } from "../lib/types";

const RUNS_PER_APP = 10;

const FIELD_NAMES = [
  "Brand Name",
  "Fanciful Name",
  "Class/Type",
  "ABV",
  "Net Contents",
  "Government Warning",
  "Bottler Name",
  "Bottler Address",
  "Country of Origin",
  "Age Statement",
] as const;

type FieldName = (typeof FIELD_NAMES)[number];
type ExpectedResults = Record<string, Record<FieldName, ComparisonResult>>;

interface RunResult {
  appId: string;
  error?: string;
  fields: Record<FieldName, ComparisonResult>;
  overallResult: string;
  run: number;
}

async function loadApplications(): Promise<Application[]> {
  const raw = await fs.readFile(
    path.join(process.cwd(), "data", "applications.json"),
    "utf-8"
  );
  return JSON.parse(raw);
}

async function loadExpectedResults(): Promise<ExpectedResults> {
  const raw = await fs.readFile(
    path.join(process.cwd(), "data", "expected-results.json"),
    "utf-8"
  );
  const parsed = JSON.parse(raw);
  delete parsed._comment;
  return parsed;
}

async function readImage(
  labelImagePath: string
): Promise<{ base64: string; mediaType: "image/png" | "image/jpeg" }> {
  const imagePath = path.join(process.cwd(), "public", labelImagePath);
  const imageBuffer = await fs.readFile(imagePath);
  return {
    base64: imageBuffer.toString("base64"),
    mediaType: labelImagePath.endsWith(".png") ? "image/png" : "image/jpeg",
  };
}

function pct(n: number, total: number): string {
  return `${((n / total) * 100).toFixed(0)}%`;
}

async function runEval() {
  const applications = await loadApplications();
  const expected = await loadExpectedResults();

  console.log(
    `\nRunning ${applications.length} apps × ${RUNS_PER_APP} runs = ${applications.length * RUNS_PER_APP} total evaluations\n`
  );

  const allResults: RunResult[] = [];
  let completed = 0;
  const total = applications.length * RUNS_PER_APP;

  for (const app of applications) {
    const { base64, mediaType } = await readImage(app.labelImagePath);

    for (let run = 0; run < RUNS_PER_APP; run++) {
      completed++;
      process.stdout.write(
        `\r  [${completed}/${total}] ${app.brandName} (run ${run + 1}/${RUNS_PER_APP})...`
      );

      const extraction = await extractFromLabel(base64, mediaType);
      if (!extraction.ok) {
        allResults.push({
          appId: app.id,
          run,
          fields: Object.fromEntries(
            FIELD_NAMES.map((f) => [f, "fail" as ComparisonResult])
          ) as Record<FieldName, ComparisonResult>,
          overallResult: "error",
          error: extraction.error,
        });
        continue;
      }

      const result = compareFields(app, extraction.data);
      const fields = Object.fromEntries(
        result.fields.map((f) => [f.fieldName, f.result])
      ) as Record<FieldName, ComparisonResult>;

      allResults.push({
        appId: app.id,
        run,
        fields,
        overallResult: result.overallResult,
      });
    }
  }

  console.log("\n");

  const errors = allResults.filter((r) => r.error);
  if (errors.length > 0) {
    console.log(`⚠ ${errors.length} API errors encountered\n`);
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log(" PER-APPLICATION RESULTS");
  console.log("═══════════════════════════════════════════════════════\n");

  let totalAccurate = 0;
  let totalConsistent = 0;
  let totalFieldEvals = 0;

  for (const app of applications) {
    const appRuns = allResults.filter((r) => r.appId === app.id && !r.error);
    const appExpected = expected[app.id];
    if (!appExpected || appRuns.length === 0) {
      continue;
    }

    console.log(`── ${app.brandName} (${app.id}) ──`);
    console.log(`   ${appRuns.length}/${RUNS_PER_APP} successful runs\n`);

    let appAccurate = 0;
    let appConsistent = 0;

    for (const fieldName of FIELD_NAMES) {
      const results = appRuns.map((r) => r.fields[fieldName]);
      const expectedResult = appExpected[fieldName];

      const accurateCount = results.filter((r) => r === expectedResult).length;

      const counts = new Map<string, number>();
      for (const r of results) {
        counts.set(r, (counts.get(r) ?? 0) + 1);
      }
      const mostCommon = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      const consistencyCount = mostCommon[1];

      const isAccurate = accurateCount === results.length;
      const isConsistent = consistencyCount === results.length;
      const accuracyStr = pct(accurateCount, results.length);
      const consistencyStr = pct(consistencyCount, results.length);

      let icon = "✗";
      if (isAccurate && isConsistent) {
        icon = "✓";
      } else if (accurateCount > 0) {
        icon = "~";
      }

      const detail =
        expectedResult !== "pass" || !isAccurate
          ? ` (expected: ${expectedResult}, got: ${[...counts.entries()].map(([k, v]) => `${k}×${v}`).join(", ")})`
          : "";

      console.log(
        `   ${icon} ${fieldName.padEnd(20)} accuracy: ${accuracyStr.padStart(4)}  consistency: ${consistencyStr.padStart(4)}${detail}`
      );

      appAccurate += accurateCount;
      appConsistent += consistencyCount;
      totalFieldEvals += results.length;
    }

    totalAccurate += appAccurate;
    totalConsistent += appConsistent;

    console.log(
      `\n   Overall: accuracy ${pct(appAccurate, appRuns.length * FIELD_NAMES.length)}, consistency ${pct(appConsistent, appRuns.length * FIELD_NAMES.length)}\n`
    );
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log(" SUMMARY");
  console.log("═══════════════════════════════════════════════════════\n");
  console.log(`  Total field evaluations: ${totalFieldEvals}`);
  console.log(
    `  Accuracy:               ${pct(totalAccurate, totalFieldEvals)}`
  );
  console.log(
    `  Consistency:            ${pct(totalConsistent, totalFieldEvals)}`
  );
  console.log(`  API errors:             ${errors.length}/${total}`);
  console.log();
}

runEval().catch((err) => {
  console.error("Eval failed:", err);
  process.exit(1);
});
