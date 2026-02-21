# TTB Labeling Standards Reference

This document summarizes the federal labeling requirements enforced by the Alcohol and Tobacco Tax and Trade Bureau (TTB) that are relevant to label verification. These standards are what the checker validates against.

## Regulatory Framework

TTB labeling requirements are codified in Title 27, Code of Federal Regulations:

| Part | Covers |
|------|--------|
| **27 CFR Part 4** | Wine labeling |
| **27 CFR Part 5** | Distilled spirits labeling |
| **27 CFR Part 7** | Malt beverages labeling |
| **27 CFR Part 16** | Health warning statement (all categories) |

---

## Mandatory Label Fields

Every alcohol beverage label (≥0.5% ABV) must include:

1. Brand name
2. Class and type designation
3. Alcohol content (ABV)
4. Net contents
5. Government warning statement
6. Name and address of bottler, packer, or importer
7. Country of origin (imports only)
8. Applicable allergen declarations (sulfites, FD&C Yellow No. 5, cochineal/carmine, aspartame)

---

## Field-by-Field Standards

### Government Warning Statement

**Regulation:** 27 CFR Part 16 (§16.21, §16.22)

**Exact required text:**

> GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.

**Formatting rules:**

| Rule | Requirement |
|------|-------------|
| "GOVERNMENT WARNING" | Must be **ALL CAPS** and **BOLD** |
| Remainder of text | Must **not** be bold |
| Background | Must be contrasting |
| Legibility | Readily legible under ordinary conditions |

**Minimum type size by container:**

| Container Size | Min Type Size | Max Chars/Inch |
|----------------|---------------|----------------|
| ≤237 mL (8 oz) | 1 mm | 40 |
| 237 mL – 3 L | 2 mm | 25 |
| >3 L | 3 mm | 12 |

**Verification approach in this tool:** Strict character-level match. Even a misplaced comma can trigger COLA rejection.

---

### Brand Name

**Regulation:** 27 CFR §5.64 (spirits), §4.33 (wine), §7.64 (malt beverages)

**Rules:**
- Required on all labels
- Must not be misleading about the product's age, origin, identity, or characteristics
- A misleading brand name may be permitted if qualified with the word "brand" (subject to TTB approval)
- Must appear in the same field of vision as class/type and alcohol content

**Verification approach in this tool:** Fuzzy match — case-insensitive, whitespace-normalized. Formatting differences are flagged but not treated as failures.

---

### Alcohol Content (ABV)

**Regulation:** 27 CFR §5.65 (spirits), §4.36 (wine), §7.65 (malt beverages)

**Acceptable formats (spirits/malt beverages):**
- "40% alc/vol"
- "Alc. 40% by vol."
- "Alcohol 40 percent by volume"

Abbreviations permitted: "Alc" for alcohol, "%" for percent, "/" for "by", "Vol" for volume.

**Tolerances:**

| Category | Tolerance |
|----------|-----------|
| Distilled spirits | ±0.3 percentage points |
| Wine >14% ABV | ±1.0 percentage point |
| Wine ≤14% ABV | ±1.5 percentage points |
| Malt beverages | ±0.3 percentage points |

**Special malt beverage designations:**
- "Low alcohol" / "reduced alcohol": only for <2.5% ABV
- "Non-alcoholic": must state "contains less than 0.5% alcohol by volume"
- "Alcohol free": zero alcohol only, no tolerance

**Verification approach in this tool:** Strict numeric match on the percentage value.

---

### Class and Type Designation

**Regulation:** 27 CFR Part 5 Subpart I (spirits), §4.34 (wine), Part 7 Subpart I (malt beverages)

**Spirits classes include:** neutral spirits/vodka, whisky (bourbon, rye, corn, malt, wheat, straight, blended), gin, brandy, rum, agave spirits (tequila, mezcal), and others.

**Wine classes include:** grape wine, sparkling wine, carbonated wine, citrus wine, fruit wine, and others.

**Malt beverage classes include:** beer, ale, lager, stout, porter, malt liquor.

**Rules:**
- Must appear in the same field of vision as brand name and alcohol content (spirits: 27 CFR §5.63)
- Must match product and standards of identity
- For wine, must identify the tax class and disclose the nature/composition

**Verification approach in this tool:** Fuzzy match — case-insensitive, whitespace-normalized.

---

### Net Contents

**Regulation:** 27 CFR §5.70 (spirits), §4.37 (wine), §7.70 (malt beverages)

**Rules:**
- Spirits and wine: must be expressed in **metric units** (liters or milliliters)
- Malt beverages: may use fluid ounces, pints, quarts, gallons, or metric
- Acceptable abbreviations: "L", "litre", "ml", "mL", "ML"
- U.S. customary equivalents permitted alongside metric

---

### Name and Address

**Regulation:** 27 CFR §5.66–5.68 (spirits), §4.35 (wine), §7.66–7.68 (malt beverages)

**Domestic products:**
- Name and address of the bottler, preceded by "bottled by," "packed by," "canned by," or "filled by"
- If also distilled: may use "distilled by"
- Address must include **city and state** (street address, zip optional)
- Contract bottling: must use "bottled for" or similar language

**Imported products:**
- Name and address of the importer

---

### Country of Origin

**Regulation:** 27 CFR §5.69 (spirits), §7.63 (malt beverages); defers to 19 CFR Parts 102/134 (CBP)

- Required on all imported products
- Typically stated as "Product of [country]"

---

### Allergen and Ingredient Declarations

| Declaration | When Required | Format | Regulation |
|-------------|---------------|--------|------------|
| Sulfites | ≥10 ppm sulfur dioxide detected | "Contains sulfites" | §4.32(e), §5.63, §7.63 |
| FD&C Yellow No. 5 | When present | "Contains FD&C Yellow No. 5" | §4.32, §5.63, §7.63 |
| Cochineal / carmine | When present | "Contains cochineal extract" (common name) | §4.32, §5.63, §7.63 |
| Aspartame | When present | "PHENYLKETONURICS: CONTAINS PHENYLALANINE" (ALL CAPS) | §5.63, §7.63 |

---

### Age Statements (Spirits Only)

**Regulation:** 27 CFR §5.74

**Mandatory for:**
- Whisky aged **less than 4 years** (exception: bottled in bond per §5.88)
- Blends containing any whisky aged <4 years
- Brandy not stored in oak for at least 2 years

**Format:** "\_\_\_ years old" — must state the age of the **youngest** whisky in blends. Overstating age is prohibited; understating is permitted.

---

## General Legibility Requirements

**Regulation:** 27 CFR §5.52, §5.53

- All mandatory information must be readily legible under ordinary conditions
- Must appear in a contrasting color against the background
- Must be separate from additional (non-mandatory) information

**Minimum type sizes (spirits):**

| Container Size | Minimum Height |
|----------------|----------------|
| >200 mL | 2 mm |
| ≤200 mL | 1 mm |

**"Same field of vision" rule (27 CFR §5.63):** Brand name, class/type, and alcohol content must all appear on a single side of the container. For cylindrical containers, a "side" = 40% of the circumference.

---

## COLA Process

**What:** Certificate of Label Approval — required before any alcohol beverage can be sold in U.S. interstate commerce. Submitted via TTB Form 5100.31 through the COLAs Online system.

**What TTB reviews:**
1. All mandatory label elements present and correctly formatted
2. Government warning — exact wording, formatting, type size
3. Brand name not misleading
4. Class/type matches product standards of identity
5. Alcohol content properly stated
6. Net contents correct and in proper format
7. Name and address properly stated
8. Allergen declarations present where required
9. No prohibited or misleading claims
10. Country of origin (imports)
11. Age statements (if applicable)
12. Label image quality and legibility

**Common rejection reasons:**
- Incorrect government warning formatting (punctuation, bold/caps)
- Incorrect net contents format
- Unapproved or misleading claims
- Missing mandatory information

**Processing time:** Typically 10–15 business days. No fee.

---

## Relevance to This Tool

The label checker focuses on the fields most commonly verified during COLA review:

| Field | Match Type | Why |
|-------|-----------|-----|
| Government warning | **Strict** (character-level) | Legally mandated exact text; even punctuation errors cause rejection |
| ABV | **Strict** (numeric) | Must match application data exactly |
| Brand name | **Fuzzy** (case/whitespace normalized) | Formatting varies but substance must match |
| Class / type | **Fuzzy** (case/whitespace normalized) | Same — substance over formatting |

See [flowcharts.md](flowcharts.md) for the per-field comparison logic diagram.

---

## Key Regulatory Sources

- [27 CFR Part 4 — Wine](https://www.law.cornell.edu/cfr/text/27/part-4)
- [27 CFR Part 5 — Distilled Spirits](https://www.law.cornell.edu/cfr/text/27/part-5)
- [27 CFR Part 7 — Malt Beverages](https://www.law.cornell.edu/cfr/text/27/part-7)
- [27 CFR Part 16 — Health Warning](https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-16)
- [TTB COLAs Online](https://www.ttb.gov/regulated-commodities/labeling/colas)
