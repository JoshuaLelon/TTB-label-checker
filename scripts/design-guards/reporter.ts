import { relative } from "node:path";
import { VALID_LAYERS } from "./constants";
import type { FileResult, ValidationError } from "./types";

function formatErrorDetails(error: ValidationError): string {
  const lineInfo = error.line ? ` (line ${error.line})` : "";
  let output = `    - ${error.message}${lineInfo}`;

  if (error.missing && error.missing.length > 0) {
    output += `\n      Add these properties: ${error.missing.join(", ")}`;
  }

  if (error.found) {
    output += `\n      Found: "${error.found}"`;
    output += `\n      Valid layers: ${Array.from(VALID_LAYERS).join(", ")}`;
  }

  return output;
}

export function printErrors(
  invalidFiles: FileResult[],
  projectRoot: string
): void {
  console.error(
    `\n❌ Found ${invalidFiles.length} file(s) with design guard issues:\n`
  );

  for (const file of invalidFiles) {
    const relativePath = relative(projectRoot, file.path);
    console.error(`\n  ${relativePath}:`);

    for (const error of file.errors) {
      console.error(formatErrorDetails(error));
    }
  }

  console.error("");
}
