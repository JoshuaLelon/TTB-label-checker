# Dataset: Label Images & Application Data

Generated with **Nano Banana Pro** (`gemini-3-pro-image-preview`) via `scripts/generate-labels.mjs`.

Application data lives in `data/applications.json`. Images live in `public/labels/*.jpg`. Expected per-field comparison results live in `data/expected-results.json`.

---

## Summary

| # | Label | Gov Warning | Intentional Error |
|---|-------|-------------|-------------------|
| 1 | Eagle Ridge Bourbon | Clean | None |
| 2 | Silverstone Cabernet | Clean | None |
| 3 | Golden Gate Lager | Clean | Brand casing (GOLDEN GATE vs Golden Gate) |
| 4 | Volkov Vodka | Clean | 42% ABV (app says 40%) |
| 5 | Juniper & Thorn Gin | Clean (with intentional typo) | "woman" instead of "women" |
| 6 | Casa del Sol Tequila | Clean | None |
| 7 | Château Lumière Chardonnay | Clean | None |
| 8 | Pacific Crest IPA | Clean | None |
| 9 | Caribbean Blue Rum | Clean | Missing country of origin |
| 10 | Brut Étoile Sparkling | Clean | "Champagne" instead of "Sparkling Wine" |

---

## Eval Results (100 runs: 10 apps × 10 runs)

Run via `npm run eval`. Model: Claude Haiku 4.5.

**Overall: 95% accuracy, 100% consistency, 0 API errors.**

| # | Label | Accuracy | Consistency | Issues |
|---|-------|----------|-------------|--------|
| 1 | Eagle Ridge Bourbon | 90% | 100% | Age Statement: expected pass, got fail×10 |
| 2 | Silverstone Cabernet | 100% | 100% | — |
| 3 | Golden Gate Lager | 100% | 100% | — |
| 4 | Volkov Vodka | 90% | 100% | Bottler Address: expected pass, got fail×10 |
| 5 | Juniper & Thorn Gin | 100% | 100% | Gov Warning fail correctly detected |
| 6 | Casa del Sol Tequila | 80% | 100% | Gov Warning: expected pass, got fail×10; Age Statement: expected pass, got flag×10 |
| 7 | Château Lumière Chardonnay | 100% | 100% | — |
| 8 | Pacific Crest IPA | 100% | 100% | — |
| 9 | Caribbean Blue Rum | 90% | 100% | Gov Warning: expected pass, got fail×10; Country of Origin not_found correctly detected |
| 10 | Brut Étoile Sparkling | 96% | 96% | Brand Name: pass×8, fail×2; Bottler Name: pass×8, fail×2; Class/Type fail correctly detected |

### Key Observations

- **Consistency is excellent** (100% for 9/10 apps) — the model produces stable results across runs.
- **Gov Warning strict matching** causes false failures on apps 6 and 9, likely due to minor transcription differences in the long warning text.
- **Age Statement** on Eagle Ridge consistently fails — the label likely renders the age differently than the application expects ("4 years old" vs "Aged 4 Years" or similar).
- **Brut Étoile** is the least stable (96%) — the accented characters in "Brut Étoile" and "Étoile Cellars" occasionally cause extraction mismatches.
