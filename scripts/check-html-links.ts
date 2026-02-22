import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

// Matches <a with href="/..." (internal links that should use next/link)
// Excludes /api/ and /auth/ routes which are legitimate <a> targets
const PATTERN = /<a\s[^>]*href\s*=\s*["']\/(?!api\/|auth\/)[^"']*["']/gi;

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
const files = walk(root, [".tsx"]);

const violations: { file: string; line: number; text: string }[] = [];

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(PATTERN);
    if (matches) {
      for (const match of matches) {
        violations.push({
          file: relative(root, file),
          line: i + 1,
          text: match,
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(
    `❌ Found ${violations.length} internal <a> link(s) — use next/link instead:\n`
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — ${v.text}`);
  }
  process.exit(1);
} else {
  console.log("✓ No internal HTML links found");
}
