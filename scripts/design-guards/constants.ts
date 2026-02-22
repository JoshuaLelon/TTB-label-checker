export const DESIGN_GUARD_MARKER = "@design-guard";

export const REQUIRED_PROPERTIES = [
  "role",
  "layer",
  "non_goals",
  "boundaries",
  "invariants",
  "authority",
  "extension_policy",
  "failure_contract",
  "testing_contract",
  "references",
];

// MECE layer taxonomy:
// - core: Pure logic, types, no I/O, no React, no Node.js modules
// - service: Server-side I/O (APIs, storage, auth) — must use "server-only"
// - ui: Client-side React (components, hooks, client utils)
export const VALID_LAYERS = new Set(["core", "service", "ui"]);

export const DIRECTIVE_PATTERN = /^["']use (client|server)["'];?\s*$/;

export const LAYER_VALUE_PATTERN = /\*\s*layer\s*:\s*(\w+)/;

export const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /\.config\.(js|ts|mjs|cjs)$/,
  /\.dependency-cruiser\.js$/,
  /scripts\//,
  /\.test\.(ts|tsx|js|jsx)$/,
  /\.spec\.(ts|tsx|js|jsx)$/,
  /next-env\.d\.ts/,
  /components\/ui\//, // shadcn/ui generated code
];

export const RELEVANT_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
