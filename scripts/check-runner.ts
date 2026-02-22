import { type ChildProcess, spawn } from "node:child_process";

interface CheckResult {
  duration: number;
  name: string;
  output: string;
  status: "passed" | "failed" | "warning";
}

const isCI = process.argv.includes("--ci");
const SOURCE_DIRS = "app components lib scripts";

const KEY_LINE_RE = /error|warning|❌|⚠|✗|violation|found \d+/i;
const WARN_RE = /clones? found/i;
const WARN_COUNT_RE = /\d+\s+warning/i;

// biome-ignore lint/style/useNamingConvention: environment variable
const SPAWN_ENV = { ...process.env, FORCE_COLOR: "0" };

function extractKeyLines(output: string, max: number): string[] {
  return output
    .split("\n")
    .filter((line) => KEY_LINE_RE.test(line))
    .slice(0, max);
}

function hasWarnings(output: string): boolean {
  return (
    WARN_RE.test(output) || WARN_COUNT_RE.test(output) || output.includes("⚠")
  );
}

function spawnCommand(
  command: string
): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child: ChildProcess = spawn(command, {
      env: SPAWN_ENV,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const chunks: string[] = [];
    child.stdout?.on("data", (data: Buffer) => chunks.push(data.toString()));
    child.stderr?.on("data", (data: Buffer) => chunks.push(data.toString()));

    child.on("close", (code) => {
      resolve({ code: code ?? 1, output: chunks.join("") });
    });
  });
}

async function runCheck(name: string, command: string): Promise<CheckResult> {
  const start = Date.now();
  const { code, output } = await spawnCommand(command);
  const duration = Date.now() - start;

  if (code !== 0) {
    return { name, status: "failed", output, duration };
  }
  const status = hasWarnings(output) ? "warning" : "passed";
  return { name, status, output, duration };
}

function getChecks() {
  return [
    { name: "TypeScript", command: "npx tsc --noEmit" },
    {
      name: "ESLint",
      command: isCI
        ? "npx eslint --max-warnings=0 ."
        : "npx eslint --fix --max-warnings=0 .",
    },
    {
      name: "Dep Cruiser",
      command: `npx depcruise ${SOURCE_DIRS} --config .dependency-cruiser.js`,
    },
    { name: "Knip", command: "npx knip" },
    { name: "jscpd", command: `npx jscpd ${SOURCE_DIRS}` },
    {
      name: "No Console Bypass",
      command: "npx tsx scripts/check-no-console-bypass.ts",
    },
    {
      name: "Unnecessary Memo",
      command: "npx tsx scripts/check-unnecessary-memo.ts",
    },
    { name: "HTML Links", command: "npx tsx scripts/check-html-links.ts" },
    {
      name: "Design Guards",
      command: "npx tsx scripts/check-design-guards.ts",
    },
  ];
}

function printResultDetail(r: CheckResult, keyLineLimit: number) {
  const keyLines = extractKeyLines(r.output, keyLineLimit);
  const lines =
    keyLines.length > 0
      ? keyLines
      : r.output.trim().split("\n").slice(-keyLineLimit);
  for (const l of lines) {
    console.log(`  ${l.trim()}`);
  }
}

function printSection(
  label: string,
  items: CheckResult[],
  icon: string,
  keyLineLimit: number
) {
  if (items.length === 0) {
    return;
  }
  console.log(`\n── ${label} ──────────────────────────────────`);
  for (const r of items) {
    console.log(`\n${icon} ${r.name} (${r.duration}ms)`);
    printResultDetail(r, keyLineLimit);
  }
}

function printSummary(results: CheckResult[]) {
  const errors = results.filter((r) => r.status === "failed");
  const warnings = results.filter((r) => r.status === "warning");
  const passed = results.filter((r) => r.status === "passed");

  printSection("ERRORS", errors, "❌", 5);
  printSection("WARNINGS", warnings, "⚠", 3);

  if (passed.length > 0) {
    console.log("\n── PASSED ──────────────────────────────────");
    console.log(
      passed.map((r) => `  ✓ ${r.name} (${r.duration}ms)`).join("\n")
    );
  }

  console.log("\n────────────────────────────────────────────");
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} check(s) failed\n`);
  } else if (warnings.length > 0) {
    console.log(`\n⚠ All checks passed with ${warnings.length} warning(s)\n`);
  } else {
    console.log("\n✓ All checks passed\n");
  }
}

async function main() {
  console.log(
    `\n🔍 Running code quality checks (${isCI ? "CI" : "dev"} mode)...\n`
  );

  const allResults: CheckResult[] = [];

  if (isCI) {
    // CI mode: all checks in parallel, no auto-fix
    const ciChecks = [
      { name: "Biome", command: `npx biome check ${SOURCE_DIRS}` },
      ...getChecks(),
    ];
    const results = await Promise.all(
      ciChecks.map((c) => runCheck(c.name, c.command))
    );
    allResults.push(...results);
  } else {
    // Dev mode: biome first with --write (auto-fix), then parallel
    const biome = await runCheck(
      "Biome",
      `npx biome check --write ${SOURCE_DIRS}`
    );
    allResults.push(biome);

    if (biome.status === "failed") {
      console.error("❌ Biome failed — fix errors before continuing.\n");
      printSummary(allResults);
      process.exit(1);
    }

    const results = await Promise.all(
      getChecks().map((c) => runCheck(c.name, c.command))
    );
    allResults.push(...results);
  }

  printSummary(allResults);

  const hasErrors = allResults.some((r) => r.status === "failed");
  if (hasErrors) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Check runner failed:", err);
  process.exit(1);
});
