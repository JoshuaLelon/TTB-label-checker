import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load .env manually
const envContent = readFileSync(resolve(ROOT, ".env"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

// Key #1 has no image gen quota — start with keys 2 and 3
const API_KEYS = [
  env.GEMINI_API_KEY_2,
  env.GEMINI_API_KEY_3,
  env.GEMINI_API_KEY,
].filter(Boolean);

const MODEL = "gemini-3-pro-image-preview";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const OUTPUT_DIR = resolve(ROOT, "public/labels");

mkdirSync(OUTPUT_DIR, { recursive: true });

// Shared gov warning formatting instruction used in every prompt.
// "GOVERNMENT WARNING:" = ALL CAPS + BOLD. Everything after = sentence case, regular weight.
const GOV_WARNING_INSTRUCTION = `The label must include a government warning text block. This is a LEGAL REQUIREMENT — every word must be perfectly spelled, real English. No garbled or fake text.

The warning must be formatted EXACTLY as follows:
- The words "GOVERNMENT WARNING:" must be in ALL CAPS and BOLD.
- Everything after "GOVERNMENT WARNING:" must be in regular sentence case (NOT all caps) and regular weight (NOT bold).
- The full text is:

GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.

Render this warning in a clean sans-serif font on a light/contrasting background area so every word is legible.`;

// Intentionally wrong gov warning for label #5 — "woman" instead of "women"
const GOV_WARNING_TYPO_INSTRUCTION = `The label must include a government warning text block. This is a LEGAL REQUIREMENT — every word must be perfectly spelled, real English. No garbled or fake text.

The warning must be formatted EXACTLY as follows:
- The words "GOVERNMENT WARNING:" must be in ALL CAPS and BOLD.
- Everything after "GOVERNMENT WARNING:" must be in regular sentence case (NOT all caps) and regular weight (NOT bold).
- The full text is (render EXACTLY as written — note "woman" not "women"):

GOVERNMENT WARNING: (1) According to the Surgeon General, woman should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.

Render this warning in a clean sans-serif font on a light/contrasting background area so every word is legible.`;

const labels = [
  {
    filename: "01-eagle-ridge-bourbon.png",
    prompt: `Create a flat, high-quality label design for a premium bourbon whiskey bottle. This is a professional COLA (Certificate of Label Approval) submission — the label should be rendered front-facing on a white background as a product mock-up.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Eagle Ridge"
- Class/type: "Straight Bourbon Whiskey"
- Alcohol content: "45% Alc/Vol"
- Net contents: "750 mL"
- Age statement: "Aged 4 Years"
- Producer: "Distilled and Bottled by Eagle Ridge Distillery, Louisville, KY"

${GOV_WARNING_INSTRUCTION}

Design style: Classic American whiskey aesthetic — warm amber/brown tones, serif typography, subtle eagle emblem or mountain ridge motif. The label should look like a real product you'd find on a shelf.`,
  },
  {
    filename: "02-silverstone-cabernet.png",
    prompt: `Create a single flat wine bottle label design — ONE label only, not multiple views or angles. This is a professional COLA submission — show only the front label on a white background.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Silverstone"
- Fanciful name: "Napa Valley Reserve"
- Class/type: "Cabernet Sauvignon"
- Vintage year: "2021"
- Alcohol content: "13.5% Alc/Vol"
- Net contents: "750 mL"
- Allergen: "Contains Sulfites"
- Producer: "Vinted and Bottled by Silverstone Vineyards, Napa, CA"

${GOV_WARNING_INSTRUCTION}

Design style: Elegant California wine label — deep burgundy/maroon accents, clean serif typography, minimal vineyard illustration. Upscale but not gaudy.`,
  },
  {
    filename: "03-golden-gate-lager.png",
    prompt: `Create a flat, high-quality beer can or bottle label design. This is a professional COLA submission — the label should be rendered front-facing on a white background as a product mock-up.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent, IN ALL CAPITAL LETTERS): "GOLDEN GATE"
- Class/type: "Lager"
- Alcohol content: "5.0% Alc/Vol"
- Net contents: "12 FL OZ (355 mL)"
- Producer: "Brewed by Golden Gate Brewing Company, San Francisco, CA"

${GOV_WARNING_INSTRUCTION}

Design style: Modern craft beer aesthetic — golden/amber color scheme, bold sans-serif typography, stylized Golden Gate Bridge illustration. Clean and contemporary.`,
  },
  {
    filename: "04-volkov-vodka.png",
    prompt: `Create a flat, high-quality vodka bottle label design. This is a professional COLA submission — the label should be rendered front-facing on a white background as a product mock-up.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Volkov"
- Fanciful name: "Premium"
- Class/type: "Vodka"
- Alcohol content: "42% Alc/Vol"
- Net contents: "750 mL"
- Country of origin: "Product of Poland"
- Importer: "Imported by Atlantic Spirits Importers, New York, NY"

${GOV_WARNING_INSTRUCTION}

Design style: Clean, minimalist Eastern European vodka aesthetic — icy blue and silver tones, sharp geometric typography, wolf or winter motif. Premium and sleek.`,
  },
  {
    filename: "05-juniper-thorn-gin.png",
    prompt: `Create a flat, high-quality gin bottle label design. This is a professional COLA submission — the label should be rendered front-facing on a white background as a product mock-up.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Juniper & Thorn"
- Class/type: "London Dry Gin"
- Alcohol content: "47% Alc/Vol"
- Net contents: "750 mL"
- Producer: "Distilled by Thorn Distillers, Portland, OR"

${GOV_WARNING_TYPO_INSTRUCTION}

Design style: Botanical gin aesthetic — deep green and copper accents, elegant serif and script typography, juniper berry and thorn botanical illustrations. Artisanal Pacific Northwest vibe.`,
  },
  {
    filename: "06-casa-del-sol-tequila.png",
    prompt: `Create a flat, high-quality tequila bottle label design. This is a professional COLA submission — the label should be rendered front-facing on a white background as a product mock-up.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Casa del Sol"
- Class/type: "Tequila Añejo"
- Alcohol content: "40% Alc/Vol"
- Net contents: "750 mL"
- Country of origin: "Product of Mexico"
- Importer: "Imported by Sol Spirits LLC, San Antonio, TX"

${GOV_WARNING_INSTRUCTION}

Design style: Warm Mexican-inspired design — terracotta and gold palette, sun motif, ornate but clean typography mixing serif and decorative elements. Agave plant illustration.`,
  },
  {
    filename: "07-chateau-lumiere-chardonnay.png",
    prompt: `Create a flat, high-quality white wine bottle label design. This is a professional COLA submission — the label should be rendered front-facing on a white background as a product mock-up.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Château Lumière"
- Class/type: "Chardonnay"
- Vintage year: "2022"
- Alcohol content: "12.5% Alc/Vol"
- Net contents: "750 mL"
- Allergen: "Contains Sulfites"
- Producer: "Produced and Bottled by Château Lumière Winery, Sonoma, CA"

${GOV_WARNING_INSTRUCTION}

Design style: French-inspired California wine — soft gold and cream tones, elegant serif typography, subtle château illustration with rolling hills. Refined and classic.`,
  },
  {
    filename: "08-pacific-crest-ipa.png",
    prompt: `Create a flat, high-quality IPA beer can or bottle label design. This is a professional COLA submission — the label should be rendered front-facing on a white background as a product mock-up.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Pacific Crest"
- Class/type: "India Pale Ale"
- Alcohol content: "6.8% Alc/Vol"
- Net contents: "12 FL OZ (355 mL)"
- Producer: "Brewed by Pacific Crest Brewing, Bend, OR"

${GOV_WARNING_INSTRUCTION}

Design style: Pacific Northwest craft beer — mountain/forest imagery, bold typography with outdoor adventure vibe, green and orange color scheme. Modern craft brewery aesthetic.`,
  },
  {
    filename: "09-caribbean-blue-rum.png",
    prompt: `Create a flat, high-quality rum bottle label design. This is a professional COLA submission — the label should be rendered front-facing on a white background as a product mock-up. Show ONLY the front label — do NOT show a back label or multiple views.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Caribbean Blue"
- Class/type: "Aged Rum"
- Alcohol content: "40% Alc/Vol"
- Net contents: "750 mL"
- Importer: "Imported by Island Trade Co., Miami, FL"

IMPORTANT: Do NOT include any country of origin statement. There should be NO text saying "Product of..." anywhere on the label.

${GOV_WARNING_INSTRUCTION}

Design style: Tropical Caribbean — ocean blue and teal palette, palm trees and waves, relaxed but premium typography. Warm island vibe.`,
  },
  {
    filename: "10-brut-etoile-sparkling.png",
    prompt: `Create a flat, high-quality sparkling wine bottle label design. This is a professional COLA submission — the label should be rendered front-facing on a white background as a product mock-up.

The label must include ALL of the following text, rendered legibly:

- Brand name (large, prominent): "Brut Étoile"
- Class/type (IMPORTANT — use this exact word): "Champagne"
- Alcohol content: "12.0% Alc/Vol"
- Net contents: "750 mL"
- Allergen: "Contains Sulfites"
- Producer: "Produced and Bottled by Étoile Cellars, Willamette Valley, OR"

${GOV_WARNING_INSTRUCTION}

Design style: Luxurious celebration — black and gold color scheme, star/constellation motifs (étoile means star), elegant script and serif typography. Premium and festive.`,
  },
];

// CLI: pass label numbers to regenerate only those (e.g., `node generate-labels.mjs 1 2 4 6 9`)
const args = process.argv.slice(2).map(Number).filter(Boolean);
const selectedLabels =
  args.length > 0
    ? labels.filter((_, i) => args.includes(i + 1))
    : labels;

let currentKeyIndex = 0;

async function generateImage(label, attempt = 0) {
  const key = API_KEYS[currentKeyIndex];
  console.log(
    `\n🎨 Generating ${label.filename} (key #${currentKeyIndex + 1})...`
  );

  try {
    const res = await fetch(BASE_URL + `?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: label.prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.error(`   Error: ${data.error.message}`);
      if (attempt < API_KEYS.length - 1) {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        return generateImage(label, attempt + 1);
      }
      throw new Error(`All keys failed for ${label.filename}`);
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData || p.inline_data);

    if (!imagePart) {
      console.error(
        `   No image in response. Parts:`,
        parts.map((p) => p.text || "[non-text]").join(", ")
      );
      if (attempt < API_KEYS.length - 1) {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        return generateImage(label, attempt + 1);
      }
      throw new Error(`No image generated for ${label.filename}`);
    }

    const b64 = (imagePart.inlineData || imagePart.inline_data).data;
    const mimeType =
      (imagePart.inlineData || imagePart.inline_data).mimeType ||
      (imagePart.inlineData || imagePart.inline_data).mime_type;
    const ext = mimeType?.includes("jpeg") ? "jpg" : "png";

    const finalFilename = label.filename.replace(/\.\w+$/, `.${ext}`);
    const outPath = resolve(OUTPUT_DIR, finalFilename);
    writeFileSync(outPath, Buffer.from(b64, "base64"));
    console.log(
      `   ✅ Saved ${outPath} (${((b64.length * 0.75) / 1024).toFixed(0)} KB)`
    );
    return finalFilename;
  } catch (err) {
    if (
      err.message?.includes("All keys failed") ||
      err.message?.includes("No image generated")
    ) {
      throw err;
    }
    console.error(`   Network error: ${err.message}`);
    if (attempt < API_KEYS.length - 1) {
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      return generateImage(label, attempt + 1);
    }
    throw err;
  }
}

async function main() {
  console.log(`Using model: ${MODEL}`);
  console.log(`Output dir: ${OUTPUT_DIR}`);
  console.log(`API keys available: ${API_KEYS.length}`);
  console.log(
    `Labels to generate: ${selectedLabels.length}${args.length > 0 ? ` (${args.join(", ")})` : " (all)"}`
  );

  const results = [];
  for (const label of selectedLabels) {
    try {
      const filename = await generateImage(label);
      results.push({ label: label.filename, status: "ok", saved: filename });
    } catch (err) {
      results.push({
        label: label.filename,
        status: "error",
        error: err.message,
      });
      console.error(`   ❌ FAILED: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n\n=== RESULTS ===");
  for (const r of results) {
    console.log(
      `${r.status === "ok" ? "✅" : "❌"} ${r.label} → ${r.saved || r.error}`
    );
  }
}

main().catch(console.error);
