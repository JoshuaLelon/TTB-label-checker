# Agent Guards — Static Analysis & Code Quality

This project uses a 10-check unified code quality system designed to give AI coding agents strong guardrails. Every check runs on `npm run check` (dev mode) and as a pre-commit hook via husky + lint-staged.

## Quick Reference

| # | Check | What it catches | Command |
|---|---|---|---|
| 1 | [Biome](#1-biome) | Formatting, import ordering, unsafe patterns | `npx biome check --write` |
| 2 | [TypeScript](#2-typescript-strict-mode) | Type errors | `npm run typecheck` |
| 3 | [ESLint](#3-eslint) | React anti-patterns, complexity, leaked resources | `npm run lint` |
| 4 | [Dependency Cruiser](#4-dependency-cruiser) | Module boundary violations | `npm run check:deps` |
| 5 | [Knip](#5-knip) | Dead code, unused exports | `npm run check:dead-code` |
| 6 | [jscpd](#6-jscpd) | Copy-paste duplication | `npm run check:duplicates` |
| 7 | [No Console Bypass](#7-no-console-bypass) | Suppressed noConsole lint rules | `npm run check:no-console` |
| 8 | [Unnecessary Memo](#8-unnecessary-memo) | Identity-passthrough useMemo | `npm run check:memo` |
| 9 | [HTML Links](#9-html-links) | `<a>` tags for internal navigation | `npm run check:html-links` |
| 10 | [Design Guards](#10-design-guards) | Missing or incomplete architectural annotations | `npm run check:guards` |

---

## 1. Biome

**Config:** `biome.json`

Biome replaces Prettier + half of ESLint. It handles formatting, import sorting, and a large set of lint rules in a single fast pass.

Key rules enforced:

- **`noConsole`** — All `console.*` calls are errors. Use `import { logger } from "@/lib/logger"` instead. Only `lib/logger.ts` and `scripts/` are exempt.
- **`noFloatingPromises`** — Promises must be awaited or explicitly handled.
- **`useNamingConvention`** — Variables in camelCase, types/classes in PascalCase, constants in SCREAMING_SNAKE_CASE.
- **`noBarrelFile`** — Barrel re-exports (`index.ts` that just re-exports) are banned (they slow bundling).
- **`useTopLevelRegex`** — Regex literals must be at module scope, not recreated inside functions.
- **`noNonNullAssertion`** — No `!` postfix; use type guards or `as` with an explaining comment.

In dev mode, Biome runs first with `--write` (auto-fix). If it fails, the runner stops before other checks.

## 2. TypeScript Strict Mode

**Config:** `tsconfig.json` (`"strict": true`, `"target": "ES2022"`)

Standard `tsc --noEmit` type checking. The `strict` flag enables:
- `strictNullChecks` — no implicit `null`/`undefined`
- `noImplicitAny` — every value needs a type
- `strictFunctionTypes` — correct function type variance

Target is ES2022 so TypeScript doesn't downlevel modern syntax (optional chaining, nullish coalescing, `Array.at()`, etc.) that Next.js handles on its own.

## 3. ESLint

**Config:** `eslint.config.mjs`

ESLint handles the rules Biome doesn't cover, especially React-specific and architectural rules. Key plugin groups:

### Error handling
- **`no-catch-all`** — Every `catch` block must have `if (!(error instanceof Error)) throw error;`. No swallowing unknown errors.
- **`error-cause`** — When wrapping errors, preserve the original cause.

### React strictness
- **`react-x`** — No unnecessary `useMemo`/`useCallback`, no unstable context values or default props.
- **`react-compiler`** — React Compiler compatibility errors.
- **`react-you-might-not-need-an-effect`** — Flags derived state in `useEffect` that should be computed inline.
- **`react-web-api`** — Catches leaked event listeners, intervals, resize observers, and timeouts in components.

### Complexity limits (tiered by file type)
| File pattern | Max lines/function | Max complexity |
|---|---|---|
| Default | 75 | 15 |
| `components/**/*.tsx` | 200 | 15 |
| `**/use-*.ts` (hooks) | 150 | 15 |
| `app/api/**/*.ts` (routes) | 100 | 15 |
| `app/**/page.tsx`, `layout.tsx` | 200 | 15 |
| `scripts/**` | 150 | 25 |
| `**/*.test.*` | unlimited | — |

### Tailwind CSS validation
- **`tailwindcss/no-custom-classname`** (`warn`) — Catches typos in Tailwind classes by validating against the actual theme in `app/globals.css`.

### Component import restrictions
- Components cannot import Node.js modules (`node:*`, `fs`, `path`, etc.)
- Components cannot import server files (`**/server`, `**/server.ts`)

## 4. Dependency Cruiser

**Config:** `.dependency-cruiser.js`

Enforces module boundary rules at the import level. Five rules:

| Rule | Severity | What it prevents |
|---|---|---|
| `core-no-nodejs` | error | `lib/` files importing Node.js built-ins (except `lib/data.ts`) |
| `components-no-server` | error | Components importing `server.ts` files |
| `core-no-server-only` | error | `lib/` importing `server-only` package (except in `server.ts` files) |
| `barrel-no-server-reexport` | error | `index.ts` barrel files re-exporting `./server` (leaks server code) |
| `no-circular` | warn | Circular dependency chains |

These rules enforce the **core / service / ui** layer taxonomy:
- **core** (`lib/`) — Pure logic, types, no I/O, no React, no Node.js
- **service** (`app/api/`, `lib/data.ts`) — Server-side I/O, allowed Node.js imports
- **ui** (`components/`, `app/**/page.tsx`) — Client-side React, no server imports

## 5. Knip

**Config:** `knip.json`

Detects dead code: unused files, unused exports, unused types, unused dependencies. Configured to:
- Ignore `components/ui/**` (shadcn/ui generated code)
- Ignore React class component lifecycle methods (`getDerivedStateFromError`, `componentDidCatch`, `render`)
- Treat `scripts/generate-labels.mjs` as an entry point (it's run manually, not imported)

## 6. jscpd

**Config:** `.jscpd.json`

Copy-paste detection. Threshold is **5%** total duplication with a minimum of 50 tokens per clone. Scans `app/`, `components/`, `lib/`, and `scripts/`. Currently reports as a warning (not a blocking error) because some structural duplication across check scripts and API routes is acceptable.

## 7. No Console Bypass

**Script:** `scripts/check-no-console-bypass.ts`

Scans for `biome-ignore lint/suspicious/noConsole` comments. The only file allowed to suppress this rule is `lib/logger.ts`. If an agent adds a bypass comment anywhere else, this check fails.

Why: Without this, an agent can "fix" a noConsole error by adding a suppress comment instead of using the logger.

## 8. Unnecessary Memo

**Script:** `scripts/check-unnecessary-memo.ts`

Catches the pattern `useMemo(() => someValue, [someValue])` — a memo that just passes through its dependency unchanged. This is a no-op that adds complexity. Scans all `.tsx` files in `app/` and `components/`.

## 9. HTML Links

**Script:** `scripts/check-html-links.ts`

Detects `<a href="/...">` for internal navigation that should use `next/link` instead. Using raw `<a>` tags for internal routes bypasses Next.js client-side navigation, causing full page reloads.

## 10. Design Guards

**Script:** `scripts/check-design-guards.ts` + `scripts/design-guards/`

Every non-config, non-test, non-script source file must have a `@design-guard` JSDoc comment at the top with **10 required properties**:

| Property | Purpose |
|---|---|
| `role` | What this module does (one sentence) |
| `layer` | `core`, `service`, or `ui` — enforces the architectural taxonomy |
| `non_goals` | What this module explicitly does NOT do |
| `boundaries` | What it depends on and what it exposes |
| `invariants` | Guarantees this module maintains |
| `authority` | What decisions this module makes vs. delegates |
| `extension_policy` | How this module can be extended or modified |
| `failure_contract` | What errors it throws and when |
| `testing_contract` | What tests are expected |
| `references` | Links to related docs, ADRs, or files |

Example:
```typescript
/**
 * @design-guard
 * role: In-memory cache for AI verification results to avoid redundant API calls
 * layer: core
 * non_goals:
 *   - Persistence across server restarts
 *   - Cache invalidation or TTL
 * boundaries:
 *   depends_on: [lib/types.ts]
 *   exposes: [getCachedResult, setCachedResult]
 * invariants:
 *   - Cache is keyed by applicationId
 *   - Cached results are immutable once stored
 * authority:
 *   decides: [Cache storage strategy (in-memory Map)]
 *   delegates: [Cache usage decisions to API routes]
 * extension_policy: Replace with Redis/persistent cache if needed
 * failure_contract: Never throws — returns undefined on cache miss
 * testing_contract: Test get/set round-trip and cache miss behavior
 * references: [app/api/verify/route.ts]
 */
```

Why: Design guards give AI agents architectural context for every file. When an agent reads a file, the guard tells it what the file does, what it's allowed to import, what invariants it must maintain, and what it should NOT do. This prevents agents from violating boundaries, adding inappropriate dependencies, or changing a module's responsibilities.

---

## Check Runner

**Script:** `scripts/check-runner.ts`

Orchestrates all 10 checks with two modes:

- **Dev mode** (`npm run check`): Biome runs first with `--write` (auto-fix). If it fails, stops. Otherwise all other checks run in parallel.
- **CI mode** (`npm run check:ci`): All checks run in parallel, no auto-fix.

Output is a severity-tiered summary: ERRORS first (with 5 key lines), then WARNINGS (3 key lines), then PASSED (one line each). Exit code is 1 if any check fails.

The runner uses `spawn` (not `exec`) with `FORCE_COLOR=0` to strip ANSI codes from captured output, ensuring reliable pattern matching in the summary.

## Pre-commit Hook

**Config:** `.husky/pre-commit`

Runs on every commit:
1. **lint-staged** — Biome auto-formats staged files
2. **check:ci** — Full 10-check suite in CI mode

If any check fails, the commit is rejected.
