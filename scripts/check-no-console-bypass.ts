import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const WHITELIST = ["lib/logger.ts"];
const PATTERN =
  /^\s*\/\/\s*biome-ignore\s+.*(?:noConsole|suspicious\/noConsole)/;

function walk(dir: string, exts: string[]): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      entry.name !== "node_modules"
    ) {
      files.push(...walk(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

const root = process.cwd();
const files = walk(root, [".ts", ".tsx"]).filter((f) => {
  const rel = relative(root, f);
  return !WHITELIST.includes(rel);
});

const violations: { file: string; line: number; text: string }[] = [];

for (const file of files) {
  const lines = readFileSync(file, "utf-8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (PATTERN.test(lines[i])) {
      violations.push({
        file: relative(root, file),
        line: i + 1,
        text: lines[i].trim(),
      });
    }
  }
}

if (violations.length > 0) {
  console.error(`❌ Found ${violations.length} noConsole bypass(es):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — ${v.text}`);
  }
  process.exit(1);
} else {
  console.log("✓ No console bypass comments found");
}
