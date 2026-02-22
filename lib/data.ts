/**
 * @design-guard
 * role: Data access layer for reading COLA applications from JSON file
 * layer: service
 * non_goals:
 *   - Database management or migration
 *   - Data validation (handled by lib/schemas.ts)
 * boundaries:
 *   depends_on: [node:fs, node:path, lib/types.ts]
 *   exposes: [getApplications, getApplication]
 * invariants:
 *   - applications.json is read-only at runtime
 * authority:
 *   decides: [File read strategy]
 *   delegates: [Data shape to lib/types.ts, validation to API layer]
 * extension_policy: Replace with database if scaling beyond prototype
 * failure_contract: Throws Error on file read failure or corrupt JSON
 * testing_contract: Test read and not-found
 * references: [data/applications.json]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Application } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "applications.json");

export async function getApplications(): Promise<Application[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Corrupted applications.json — failed to parse JSON");
  }
}

export async function getApplication(
  id: string
): Promise<Application | undefined> {
  const apps = await getApplications();
  return apps.find((a) => a.id === id);
}
