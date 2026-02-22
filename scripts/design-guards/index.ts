// biome-ignore lint/performance/noBarrelFile: internal module barrel for design-guards scripts
export { printErrors } from "./reporter";
export { findFiles } from "./scanner";
export type { FileResult } from "./types";
export { checkFile } from "./validator";
