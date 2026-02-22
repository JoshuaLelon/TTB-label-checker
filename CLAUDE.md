# TTB Label Checker

AI-powered tool that compares alcohol label images against COLA application data.

## Tech Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Claude Haiku 4.5 for vision.

## Code Quality Checks

Run all checks with: `npm run check`

The project uses a 12-check unified system with a severity-tiered summary. In dev mode, Biome auto-fixes first, then all other checks run in parallel. In CI mode, all checks run in parallel with no auto-fix.

Individual checks:
- `npm run lint` — ESLint with --fix
- `npm run typecheck` — TypeScript type checking
- `npm run check:deps` — Dependency Cruiser (module boundaries)
- `npm run check:dead-code` — Knip (unused code/exports)
- `npm run check:duplicates` — jscpd (copy-paste detection)
- `npm run check:no-console` — No biome-ignore noConsole bypasses
- `npm run check:memo` — No unnecessary useMemo
- `npm run check:html-links` — No internal `<a>` links (use next/link)

### Handling Lint Errors

1. **NEVER** add disable comments (`// biome-ignore`, `// eslint-disable`, `// @ts-ignore`)
2. **NEVER** modify lint configs to weaken or remove rules
3. **ALWAYS** refactor the code to satisfy the rule

### Logging

Use `import { logger } from "@/lib/logger"` instead of `console.*`. The `noConsole` Biome rule enforces this. Only `lib/logger.ts` and `scripts/` are exempt.
