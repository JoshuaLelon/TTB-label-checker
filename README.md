# TTB Label Checker

AI-powered label verification for the Alcohol and Tobacco Tax and Trade Bureau. Compares label images against application data and returns field-by-field match/mismatch results in under 5 seconds.

## How It Works

1. Agent opens an application from the homepage (10 sample applications)
2. Reviews the label image alongside the application data (click image to enlarge)
3. Clicks **Analyze Label** — Claude Haiku Vision extracts fields from the label and compares them against the application data
4. Results appear inline: each field gets a checkmark, warning, X, or N/A icon. Non-pass fields are listed with full notes below the action buttons.
5. Agent clicks **Pass Application** or **Fail Application**, then returns to the list

Status is ephemeral — refreshing the page resets all decisions.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Claude 4.5 Haiku** Vision API (Anthropic)
- **Vercel** deployment

## Quick Start

```bash
cp .env.example .env       # add your Anthropic API key
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Code Quality

Run all 10 checks with `npm run check`. Includes Biome, TypeScript, ESLint, dependency boundaries, dead code detection, copy-paste detection, and design guard validation. See [agent-guards.md](docs/agent-guards.md) for details.

## Eval

Run `npm run eval` to test extraction accuracy: 10 applications x 10 runs each (100 total API calls). Compares results against ground truth in `data/expected-results.json`.

Latest results: **95% accuracy, 100% consistency** across 1000 field evaluations. See [dataset.md](docs/dataset.md) for the full breakdown.

## Documentation

- [Design doc](docs/design.md) — approach, decisions, assumptions, trade-offs
- [Dataset](docs/dataset.md) — 10-app test dataset, ground truth, and eval results
- [Agent guards](docs/agent-guards.md) — 10-check static analysis system and design guard specification
- [Flow diagrams](docs/flowcharts.md) — page map and per-field comparison logic
- [Theme reference](docs/theme.md) — TTB/USWDS colors, typography, shadcn/ui token mapping
- [Labeling standards](docs/labeling-standards.md) — TTB regulatory requirements for alcohol labels
