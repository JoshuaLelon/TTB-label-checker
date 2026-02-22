import {
  DESIGN_GUARD_MARKER,
  LAYER_VALUE_PATTERN,
  REQUIRED_PROPERTIES,
} from "./constants";
import type { GuardBlock, GuardLocation, ParsedGuard } from "./types";

export function findGuardLocation(lines: string[]): GuardLocation | null {
  let guardMarkerLine = -1;

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes(DESIGN_GUARD_MARKER)) {
      guardMarkerLine = i;
      break;
    }
  }

  if (guardMarkerLine === -1) {
    return null;
  }

  let guardStartLine = -1;
  for (let j = guardMarkerLine; j >= 0; j -= 1) {
    if (lines[j].trim().startsWith("/**")) {
      guardStartLine = j;
      break;
    }
  }

  if (guardStartLine === -1) {
    return null;
  }

  return { startLine: guardStartLine, markerLine: guardMarkerLine };
}

export function extractDesignGuardBlock(
  lines: string[],
  startLine: number
): GuardBlock | null {
  if (!lines[startLine].includes("/**")) {
    return null;
  }

  let block = "";
  let i = startLine;
  while (i < lines.length) {
    block += `${lines[i]}\n`;
    if (lines[i].includes("*/")) {
      return { block, endLine: i };
    }
    i += 1;
  }

  return null;
}

export function parseDesignGuard(block: string): ParsedGuard {
  const properties = new Set<string>();
  let layerValue: string | null = null;

  for (const prop of REQUIRED_PROPERTIES) {
    const propPattern = new RegExp(`\\*\\s*${prop}\\s*[:\\[]`, "m");
    if (propPattern.test(block)) {
      properties.add(prop);

      if (prop === "layer") {
        const layerMatch = block.match(LAYER_VALUE_PATTERN);
        if (layerMatch) {
          layerValue = layerMatch[1];
        }
      }
    }
  }

  return { properties, layerValue };
}
