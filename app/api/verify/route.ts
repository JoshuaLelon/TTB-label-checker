/**
 * @design-guard
 * role: API endpoint that verifies a label image against COLA application data using Claude AI
 * layer: service
 * non_goals:
 *   - Label comparison logic (handled by lib/compare.ts)
 *   - Data persistence (handled by lib/data.ts)
 * boundaries:
 *   depends_on: [node:fs, node:path, @anthropic-ai/sdk, lib/compare.ts, lib/data.ts, lib/schemas.ts, lib/types.ts, lib/verification-cache.ts, lib/logger.ts]
 *   exposes: [POST handler]
 * invariants:
 *   - Request body is validated via Zod before processing
 *   - Claude API response is validated against extractedLabelFieldsSchema
 *   - Results are cached to avoid redundant API calls
 * authority:
 *   decides: [Claude prompt, image encoding, response parsing]
 *   delegates: [Field comparison to lib/compare.ts, caching to lib/verification-cache.ts]
 * extension_policy: Swap AI provider by changing extractFromLabel implementation
 * failure_contract: Returns 400 (bad request), 404 (not found), 500 (file read), or 502 (AI error)
 * testing_contract: Test request validation, cache hit, extraction parsing, and error responses
 * references: [Anthropic Messages API, lib/schemas.ts]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { compareFields } from "@/lib/compare";
import { getApplication } from "@/lib/data";
import { logger } from "@/lib/logger";
import { extractedLabelFieldsSchema, verifyRequestSchema } from "@/lib/schemas";
import type { ExtractedLabelFields } from "@/lib/types";
import { getCachedResult, setCachedResult } from "@/lib/verification-cache";

const anthropic = new Anthropic();

const MARKDOWN_FENCE_START = /^```json?\s*\n?/m;
const MARKDOWN_FENCE_END = /\n?```\s*$/m;

const EXTRACTION_PROMPT = `You are analyzing an alcohol beverage label image. Extract the following fields exactly as they appear on the label. Do NOT correct any text — transcribe exactly what is printed.

Return a JSON object with these fields:
- brandName: The brand name (e.g., "Eagle Ridge")
- fancifulName: Any fanciful/trade name (e.g., "Napa Valley Reserve"), or null if none
- classType: The class/type of beverage (e.g., "Straight Bourbon Whiskey")
- abv: The alcohol by volume as a number only (e.g., "45" not "45%")
- netContents: The net contents (e.g., "750 mL")
- governmentWarning: The full government warning text, transcribed EXACTLY as printed — do not fix typos or spelling
- bottlerName: The bottler/producer name
- bottlerAddress: The bottler/producer address
- countryOfOrigin: Country of origin if stated (e.g., "Product of Mexico" → "Mexico"), or null if not present
- ageStatement: Age statement if present (e.g., "4 years old"), or null if not present

Return ONLY valid JSON, no markdown fences or extra text.`;

type ExtractResult =
  | { ok: true; data: ExtractedLabelFields }
  | { ok: false; error: string; status: number };

async function extractFromLabel(
  base64Image: string,
  mediaType: "image/png" | "image/jpeg"
): Promise<ExtractResult> {
  let responseText: string;
  try {
    const message = await anthropic.messages.create(
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          },
        ],
      },
      { timeout: 10_000 }
    );
    responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      throw err;
    }
    logger.error("Anthropic API error:", err);
    return {
      ok: false,
      error: "AI service error — please try again",
      status: 502,
    };
  }

  const jsonStr = responseText
    .replace(MARKDOWN_FENCE_START, "")
    .replace(MARKDOWN_FENCE_END, "")
    .trim();

  let rawParsed: unknown;
  try {
    rawParsed = JSON.parse(jsonStr);
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }
    logger.error("Failed to parse AI response JSON:", jsonStr);
    return { ok: false, error: "Failed to parse AI response", status: 502 };
  }

  const labelFields = extractedLabelFieldsSchema.safeParse(rawParsed);
  if (!labelFields.success) {
    logger.error("AI response schema mismatch:", labelFields.error.issues);
    return {
      ok: false,
      error: "AI returned unexpected response shape",
      status: 502,
    };
  }

  return { ok: true, data: labelFields.data };
}

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

  const cached = getCachedResult(applicationId);
  if (cached) {
    return NextResponse.json({ result: cached });
  }

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
  setCachedResult(applicationId, result);

  return NextResponse.json({ result });
}
