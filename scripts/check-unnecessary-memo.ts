import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const PATTERN = /useMemo\(\s*\(\)\s*=>\s*(\w+)\s*,\s*\[\s*(\w+)\s*\]\s*\)/g;

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
const files = walk(root, [".ts", ".tsx"]);

const violations: { file: string; line: number; text: string }[] = [];

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  for (const match of content.matchAll(PATTERN)) {
    if (match[1] === match[2]) {
      const lineNum = content.substring(0, match.index).split("\n").length;
      violations.push({
        file: relative(root, file),
        line: lineNum,
        text: match[0],
      });
    }
  }
}

if (violations.length > 0) {
  console.error(`❌ Found ${violations.length} unnecessary useMemo(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — ${v.text}`);
  }
  process.exit(1);
} else {
  console.log("✓ No unnecessary useMemo found");
}
