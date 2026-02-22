/**
 * @design-guard
 * role: API endpoint that verifies a label image against COLA application data using Claude AI
 * layer: service
 * non_goals:
 *   - Label comparison logic (handled by lib/compare.ts)
 *   - Data persistence (handled by lib/data.ts)
 * boundaries:
 *   depends_on: [node:fs, node:path, lib/compare.ts, lib/data.ts, lib/extract.ts, lib/schemas.ts]
 *   exposes: [POST handler]
 * invariants:
 *   - Request body is validated via Zod before processing
 *   - Claude API response is validated against extractedLabelFieldsSchema
 *   - Every request re-runs the AI extraction (no caching)
 * authority:
 *   decides: [Image encoding, request orchestration]
 *   delegates: [Field comparison to lib/compare.ts]
 * extension_policy: Swap AI provider by changing extractFromLabel implementation
 * failure_contract: Returns 400 (bad request), 404 (not found), 500 (file read), or 502 (AI error)
 * testing_contract: Test request validation, cache hit, extraction parsing, and error responses
 * references: [Anthropic Messages API, lib/schemas.ts]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { compareFields } from "@/lib/compare";
import { getApplication } from "@/lib/data";
import { extractFromLabel } from "@/lib/extract";
import { verifyRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parsed = verifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { applicationId } = parsed.data;

  const application = await getApplication(applicationId);
  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  let base64Image: string;
  const imagePath = path.join(
    process.cwd(),
    "public",
    application.labelImagePath
  );
  try {
    const imageBuffer = await fs.readFile(imagePath);
    base64Image = imageBuffer.toString("base64");
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }
    return NextResponse.json(
      { error: "Failed to read label image" },
      { status: 500 }
    );
  }

  const mediaType = application.labelImagePath.endsWith(".png")
    ? ("image/png" as const)
    : ("image/jpeg" as const);

  const extraction = await extractFromLabel(base64Image, mediaType);
  if (!extraction.ok) {
    return NextResponse.json(
      { error: extraction.error },
      { status: extraction.status }
    );
  }

  const result = compareFields(application, extraction.data);

  return NextResponse.json({ result });
}
