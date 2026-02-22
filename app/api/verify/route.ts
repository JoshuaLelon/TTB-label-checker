import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { getApplication } from "@/lib/data";
import { compareFields } from "@/lib/compare";
import { getCachedResult, setCachedResult } from "@/lib/verification-cache";
import { verifyRequestSchema, extractedLabelFieldsSchema } from "@/lib/schemas";

const anthropic = new Anthropic();

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

export async function POST(request: Request) {
  // Validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
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

  // Check cache first
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

  // Read label image as base64
  let base64Image: string;
  const imagePath = path.join(
    process.cwd(),
    "public",
    application.labelImagePath
  );
  try {
    const imageBuffer = await fs.readFile(imagePath);
    base64Image = imageBuffer.toString("base64");
  } catch {
    return NextResponse.json(
      { error: "Failed to read label image" },
      { status: 500 }
    );
  }

  const mediaType = application.labelImagePath.endsWith(".png")
    ? "image/png"
    : "image/jpeg";

  // Call Claude Haiku Vision
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
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json(
      { error: "AI service error — please try again" },
      { status: 502 }
    );
  }

  // Parse the response
  const jsonStr = responseText
    .replace(/^```json?\s*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();

  let rawParsed: unknown;
  try {
    rawParsed = JSON.parse(jsonStr);
  } catch {
    console.error("Failed to parse AI response JSON:", jsonStr);
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 502 }
    );
  }

  const labelFields = extractedLabelFieldsSchema.safeParse(rawParsed);
  if (!labelFields.success) {
    console.error("AI response schema mismatch:", labelFields.error.issues);
    return NextResponse.json(
      { error: "AI returned unexpected response shape" },
      { status: 502 }
    );
  }

  // Compare fields
  const result = compareFields(application, labelFields.data);

  // Cache the result
  setCachedResult(applicationId, result);

  return NextResponse.json({ result });
}
