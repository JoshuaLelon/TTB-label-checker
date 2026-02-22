/**
 * @design-guard
 * role: Data access layer for reading/writing COLA applications from JSON file
 * layer: service
 * non_goals:
 *   - Database management or migration
 *   - Data validation (handled by lib/schemas.ts)
 * boundaries:
 *   depends_on: [node:fs, node:path, lib/types.ts]
 *   exposes: [getApplications, getApplication, updateApplicationStatus]
 * invariants:
 *   - Concurrent writes are serialized via writeChain mutex
 *   - applications.json is always valid JSON after write
 * authority:
 *   decides: [File read/write strategy, write serialization]
 *   delegates: [Data shape to lib/types.ts, validation to API layer]
 * extension_policy: Replace with database if scaling beyond prototype
 * failure_contract: Throws Error on file read failure or corrupt JSON
 * testing_contract: Test read, write, concurrent write serialization, and not-found
 * references: [data/applications.json]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Application, VerificationResult } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "applications.json");

// Simple mutex: serializes writes so concurrent requests don't clobber each other
let writeChain = Promise.resolve();

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

export function updateApplicationStatus(
  id: string,
  status: "passed" | "failed",
  result: VerificationResult
): Promise<void> {
  // Enqueue this write behind any in-flight write
  const pending = writeChain.then(async () => {
    const apps = await getApplications();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new Error(`Application ${id} not found`);
    }

    const summaries = result.fields
      .filter((f) => f.result !== "pass")
      .map((f) => `${f.fieldName}: ${f.note}`);

    apps[idx].status = status;
    apps[idx].notes =
      summaries.length > 0
        ? summaries.join("; ")
        : "All fields verified — exact match.";

    await fs.writeFile(DATA_PATH, `${JSON.stringify(apps, null, 2)}\n`);
  });
  // Update chain (swallow rejections so future writes aren't blocked by a stuck chain)
  writeChain = pending.catch((_e: unknown) => undefined);
  return pending;
}
