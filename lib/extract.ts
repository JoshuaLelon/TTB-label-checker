/**
 * @design-guard
 * role: AI label field extraction via Claude vision API
 * layer: service
 * non_goals:
 *   - Field comparison logic (handled by lib/compare.ts)
 *   - HTTP request/response handling (handled by API route)
 * boundaries:
 *   depends_on: [@anthropic-ai/sdk, lib/schemas.ts, lib/types.ts, lib/logger.ts]
 *   exposes: [extractFromLabel, ExtractResult]
 * invariants:
 *   - Claude response is validated against extractedLabelFieldsSchema
 *   - Markdown fences are stripped before JSON parsing
 * authority:
 *   decides: [Claude prompt, model selection, response parsing]
 *   delegates: [Schema validation to lib/schemas.ts]
 * extension_policy: Swap AI provider by changing this module
 * failure_contract: Returns {ok: false} with error string on any AI/parse failure
 * testing_contract: Test prompt output parsing, fence stripping, schema validation
 * references: [Anthropic Messages API, lib/schemas.ts]
 */
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "@/lib/logger";
import { extractedLabelFieldsSchema } from "@/lib/schemas";
import type { ExtractedLabelFields } from "@/lib/types";

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

export type ExtractResult =
  | { ok: true; data: ExtractedLabelFields }
  | { ok: false; error: string; status: number };

export async function extractFromLabel(
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
