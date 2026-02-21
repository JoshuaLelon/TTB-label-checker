# Theme Reference

Based on the [TTB.gov](https://www.ttb.gov) website, which uses the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/).

## Colors

### Primary

| Token | Hex | Usage |
|---|---|---|
| primary-lighter | #d9e8f6 | Light backgrounds |
| primary-light | #73b3e7 | — |
| **primary** | **#005ea2** | **Links, buttons, header accents** |
| primary-vivid | #0050d8 | — |
| primary-dark | #1a4480 | Hover states |
| primary-darker | #162e51 | Active states |

### Base (Neutrals)

| Token | Hex | Usage |
|---|---|---|
| base-lightest | #f0f0f0 | Page backgrounds, alternating rows |
| base-lighter | #dfe1e2 | Borders, dividers |
| base-light | #a9aeb1 | Placeholder text |
| base | #71767a | Secondary text |
| base-dark | #565c65 | — |
| base-darker | #3d4551 | Footer background |
| **base-darkest / ink** | **#1b1b1b** | **Body text** |
| white | #ffffff | Card backgrounds, primary bg |

### Secondary

| Token | Hex | Usage |
|---|---|---|
| secondary-lighter | #f3e1e4 | — |
| secondary-light | #f2938c | — |
| secondary | #d83933 | Destructive actions |
| secondary-dark | #b50909 | — |
| secondary-darker | #8b0a03 | — |

### Accent Cool

| Token | Hex | Usage |
|---|---|---|
| accent-cool-lighter | #e1f3f8 | — |
| accent-cool-light | #97d4ea | — |
| accent-cool | #00bde3 | Info indicators |
| accent-cool-dark | #28a0cb | — |
| accent-cool-darker | #07648d | — |

### Accent Warm

| Token | Hex | Usage |
|---|---|---|
| accent-warm-lighter | #f2e4d4 | — |
| accent-warm-light | #ffbc78 | — |
| accent-warm | #fa9441 | — |
| accent-warm-dark | #c05600 | — |
| accent-warm-darker | #775540 | — |

### State Colors

| State | Lighter | Default | Dark |
|---|---|---|---|
| **Success** | #ecf3ec | #00a91c | #008817 |
| **Warning** | #faf3d1 | #ffbe2e | #e5a000 |
| **Error** | #f4e3db | #d54309 | #b50909 |
| **Info** | #e7f6f8 | #00bde3 | #009ec1 |
| **Disabled** | #c9c9c9 | #757575 | #454545 |

### Interactive States

| State | Hex | Usage |
|---|---|---|
| Focus outline | #2491ff | Focus ring on interactive elements |
| Visited link | #54278f | Purple visited links |

## Typography

### Font Families

| Role | Font Stack |
|---|---|
| **Body / UI** | `"Source Sans Pro", "Helvetica Neue", "Helvetica", "Roboto", "Arial", sans-serif` |
| **Headings** | `"Merriweather Web", "Georgia", "Cambria", "Times New Roman", "Times", serif` |
| **Code** | `"Roboto Mono Web", "Bitstream Vera Sans Mono", "Consolas", "Courier", monospace` |

### Font Sizes

| Token | Size |
|---|---|
| 3xs | 13px |
| 2xs | 14px |
| xs | 15px |
| sm | 16px (body default) |
| md | 17px |
| lg | 22px |
| xl | 32px |
| 2xl | 40px |
| 3xl | 48px |

## Spacing

8px base grid:

| Token | Value |
|---|---|
| 0.5 | 4px |
| 1 | 8px |
| 1.5 | 12px |
| 2 | 16px |
| 2.5 | 20px |
| 3 | 24px |
| 4 | 32px |
| 5 | 40px |
| 6 | 48px |
| 8 | 64px |
| 10 | 80px |

## Border Radius

| Value | Usage |
|---|---|
| 0 | Default (sharp corners) |
| 0.25rem (4px) | Buttons, inputs |
| 0.5rem (8px) | Cards, modals |

## Mapping to shadcn/ui

When running `npx shadcn create`, use these mappings:

| shadcn token | USWDS equivalent | Hex |
|---|---|---|
| `--background` | white | #ffffff |
| `--foreground` | ink | #1b1b1b |
| `--primary` | primary | #005ea2 |
| `--primary-foreground` | white | #ffffff |
| `--secondary` | base-lighter | #dfe1e2 |
| `--secondary-foreground` | base-darkest | #1b1b1b |
| `--muted` | base-lightest | #f0f0f0 |
| `--muted-foreground` | base | #71767a |
| `--accent` | base-lightest | #f0f0f0 |
| `--accent-foreground` | base-darkest | #1b1b1b |
| `--destructive` | error | #d54309 |
| `--border` | base-lighter | #dfe1e2 |
| `--input` | base-lighter | #dfe1e2 |
| `--ring` | focus outline | #2491ff |
| `--radius` | — | 0.25rem |

### Pass / Flag / Fail (label checker specific)

| Result | Color | Hex |
|---|---|---|
| Pass | success | #00a91c |
| Flag | warning | #ffbe2e |
| Fail | error | #d54309 |
