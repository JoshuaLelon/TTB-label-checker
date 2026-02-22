import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const Dirname = dirname(fileURLToPath(import.meta.url));

import errorCause from "eslint-plugin-error-cause";
import noCatchAll from "eslint-plugin-no-catch-all";
import reactCompiler from "eslint-plugin-react-compiler";
import reactWebApi from "eslint-plugin-react-web-api";
import reactX from "eslint-plugin-react-x";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import tailwindcss from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tailwindcss.configs["flat/recommended"],
  reactX.configs.recommended,
  reactYouMightNotNeedAnEffect.configs.recommended,

  globalIgnores([".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts"]),

  {
    plugins: {
      "error-cause": errorCause,
      "no-catch-all": noCatchAll,
      "react-compiler": reactCompiler,
      "react-web-api": reactWebApi,
    },
    rules: {
      // ── File & function limits ──
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "warn",
        { max: 75, skipBlankLines: true, skipComments: true },
      ],
      complexity: ["warn", { max: 15 }],

      // ── Disable rules that Biome handles ──
      "react-hooks/exhaustive-deps": "off",
      "react/jsx-key": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
      "no-var": "off",
      "react-x/no-missing-key": "off",

      // ── Disable react/ rules that overlap with react-x ──
      "react/jsx-no-comment-textnodes": "off",
      "react/jsx-no-duplicate-props": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
      "react/no-direct-mutation-state": "off",
      "react/no-string-refs": "off",

      // ── Error handling ──
      "no-empty": ["error", { allowEmptyCatch: false }],
      "no-useless-catch": "error",
      "no-catch-all/no-catch-all": "error",
      "error-cause/no-swallowed-error-cause": "error",

      // ── Web API leak prevention ──
      "react-web-api/no-leaked-event-listener": "error",
      "react-web-api/no-leaked-interval": "error",
      "react-web-api/no-leaked-resize-observer": "error",
      "react-web-api/no-leaked-timeout": "error",

      // ── React strictness ──
      "react-x/no-unnecessary-use-memo": "error",
      "react-x/no-unnecessary-use-callback": "error",
      "react-x/no-unstable-context-value": "error",
      "react-x/no-unstable-default-props": "error",
      "react-you-might-not-need-an-effect/no-derived-state": "error",

      // ── React Compiler ──
      "react-compiler/react-compiler": "error",
    },
  },

  // ── Tiered function length overrides ──
  {
    files: ["components/**/*.tsx"],
    rules: {
      "max-lines-per-function": [
        "warn",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ["**/use-*.ts"],
    rules: {
      "max-lines-per-function": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ["app/api/**/*.ts"],
    rules: {
      "max-lines-per-function": [
        "warn",
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ["app/**/page.tsx", "app/**/layout.tsx"],
    rules: {
      "max-lines-per-function": [
        "warn",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ["scripts/**/*.ts", "scripts/**/*.mjs"],
    rules: {
      "max-lines-per-function": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
      complexity: ["warn", { max: 25 }],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "__tests__/**/*"],
    rules: { "max-lines-per-function": "off" },
  },

  // ── Tailwind validation ──
  {
    settings: {
      tailwindcss: {
        config: join(Dirname, "app/globals.css"),
        cssFiles: ["app/globals.css", "!**/node_modules/**"],
      },
    },
    rules: {
      "tailwindcss/classnames-order": "off", // Biome handles this
      "tailwindcss/no-custom-classname": "warn",
    },
  },

  // ── Prevent Node.js imports in client components ──
  {
    files: ["components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "node:*",
                "fs",
                "fs/promises",
                "path",
                "os",
                "crypto",
                "child_process",
                "stream",
                "http",
                "https",
                "net",
              ],
              message: "Node.js modules cannot be imported in components.",
            },
            {
              group: ["**/server", "**/server.ts"],
              message: "Server-only modules cannot be imported in components.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
