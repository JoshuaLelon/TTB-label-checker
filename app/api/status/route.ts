/**
 * @design-guard
 * role: API endpoint to update an application's pass/fail status after verification
 * layer: service
 * non_goals:
 *   - Verification logic (handled by /api/verify)
 *   - Email notifications or audit logging
 * boundaries:
 *   depends_on: [lib/data.ts, lib/schemas.ts]
 *   exposes: [POST handler]
 * invariants:
 *   - Request body is validated via Zod before processing
 *   - Status update is atomic via write mutex in lib/data.ts
 * authority:
 *   decides: [Status update validation, HTTP response codes]
 *   delegates: [Data persistence to lib/data.ts, validation to lib/schemas.ts]
 * extension_policy: Add audit logging or webhook notifications as needed
 * failure_contract: Returns 400 (bad request), 404 (not found), or 500 (write failure)
 * testing_contract: Test request validation, not-found, and successful update
 * references: [lib/schemas.ts statusRequestSchema]
 */
import { NextResponse } from "next/server";
import { updateApplicationStatus } from "@/lib/data";
import { statusRequestSchema } from "@/lib/schemas";

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

  const parsed = statusRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { applicationId, status, verificationResult } = parsed.data;

  try {
    await updateApplicationStatus(applicationId, status, verificationResult);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }
    const message = error.message;
    const isNotFound = message.includes("not found");
    return NextResponse.json(
      { error: message },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
