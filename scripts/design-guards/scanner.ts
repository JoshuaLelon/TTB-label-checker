import { readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { EXCLUDE_PATTERNS, RELEVANT_EXTENSIONS } from "./constants";

export function shouldCheckFile(filePath: string): boolean {
  const ext = extname(filePath);
  if (!RELEVANT_EXTENSIONS.includes(ext)) {
    return false;
  }
  return !EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

export async function findFiles(
  dir: string,
  baseDir: string = dir
): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = relative(baseDir, fullPath);

    if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(relativePath))) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await findFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}
