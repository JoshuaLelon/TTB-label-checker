export interface ValidationError {
  found?: string;
  line?: number;
  message: string;
  missing?: string[];
  type: "missing" | "placement" | "incomplete" | "invalid_layer";
}

export interface FileResult {
  errors: ValidationError[];
  path: string;
  valid: boolean;
}

export interface GuardLocation {
  markerLine: number;
  startLine: number;
}

export interface GuardBlock {
  block: string;
  endLine: number;
}

export interface ParsedGuard {
  layerValue: string | null;
  properties: Set<string>;
}
