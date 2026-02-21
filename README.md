# TTB Label Checker

AI-powered label verification for the Alcohol and Tobacco Tax and Trade Bureau. Compares label images against application data and returns field-by-field match/mismatch results in under 5 seconds.

## How It Works

1. Agent opens an application from the homepage (10 sample applications, sorted by Not Done / Passed / Failed)
2. Reviews the label image alongside the application data
3. Clicks **Verify** — the image is sent to Claude Haiku Vision, which extracts fields and compares them against the application data
4. Each field shows **pass**, **flag** (formatting difference only), or **fail** (mismatch)
5. Agent approves or rejects based on results

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Claude 4.5 Haiku** Vision API (Anthropic)
- **Vercel** deployment

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

- [Design doc](docs/design.md) — approach, decisions, assumptions, trade-offs
- [Flow diagrams](docs/flowcharts.md) — page map and per-field comparison logic
- [Theme reference](docs/theme.md) — TTB/USWDS colors, typography, shadcn/ui token mapping
