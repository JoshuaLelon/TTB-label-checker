import { readFile } from "node:fs/promises";
import {
  DIRECTIVE_PATTERN,
  REQUIRED_PROPERTIES,
  VALID_LAYERS,
} from "./constants";
import {
  extractDesignGuardBlock,
  findGuardLocation,
  parseDesignGuard,
} from "./parser";
import { shouldCheckFile } from "./scanner";
import type { FileResult, ValidationError } from "./types";

function isAllowedBeforeGuard(trimmedLine: string): boolean {
  return (
    trimmedLine === "" ||
    trimmedLine.startsWith("//") ||
    trimmedLine.startsWith("/*") ||
    DIRECTIVE_PATTERN.test(trimmedLine)
  );
}

function checkPlacement(
  lines: string[],
  guardStartLine: number
): ValidationError | null {
  for (let i = 0; i < guardStartLine; i += 1) {
    const trimmed = lines[i].trim();
    if (!isAllowedBeforeGuard(trimmed)) {
      return {
        type: "placement",
        message: `Design guard must appear at top of file (after directives if present). Found code at line ${i + 1}`,
        line: i + 1,
      };
    }
  }
  return null;
}

function checkProperties(
  properties: Set<string>,
  startLine: number
): ValidationError | null {
  const missing = REQUIRED_PROPERTIES.filter((prop) => !properties.has(prop));
  if (missing.length > 0) {
    return {
      type: "incomplete",
      message: `Missing required properties: ${missing.join(", ")}`,
      line: startLine + 1,
      missing,
    };
  }
  return null;
}

function checkLayerValue(
  layerValue: string | null,
  startLine: number
): ValidationError | null {
  if (!layerValue) {
    return {
      type: "incomplete",
      message: "Layer property has no value",
      line: startLine + 1,
    };
  }

  if (!VALID_LAYERS.has(layerValue)) {
    return {
      type: "invalid_layer",
      message: `Invalid layer value: "${layerValue}". Must be one of: ${Array.from(VALID_LAYERS).join(", ")}`,
      line: startLine + 1,
      found: layerValue,
    };
  }

  return null;
}

export async function checkFile(filePath: string): Promise<FileResult | null> {
  if (!shouldCheckFile(filePath)) {
    return null;
  }

  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const errors: ValidationError[] = [];

  const location = findGuardLocation(lines);
  if (!location) {
    return {
      path: filePath,
      valid: false,
      errors: [{ type: "missing", message: "No design guard found" }],
    };
  }

  const { startLine } = location;

  const placementError = checkPlacement(lines, startLine);
  if (placementError) {
    errors.push(placementError);
  }

  const guardBlock = extractDesignGuardBlock(lines, startLine);
  if (!guardBlock) {
    errors.push({
      type: "incomplete",
      message: "Malformed design guard comment block",
      line: startLine + 1,
    });
    return { path: filePath, valid: false, errors };
  }

  const { properties, layerValue } = parseDesignGuard(guardBlock.block);

  const propsError = checkProperties(properties, startLine);
  if (propsError) {
    errors.push(propsError);
  }

  const layerError = checkLayerValue(layerValue, startLine);
  if (layerError) {
    errors.push(layerError);
  }

  return {
    path: filePath,
    valid: errors.length === 0,
    errors,
  };
}
