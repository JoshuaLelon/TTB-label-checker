/**
 * @design-guard
 * role: Application header bar with branding and navigation link
 * layer: ui
 * non_goals:
 *   - Authentication UI or user menu
 *   - Navigation beyond home link
 * boundaries:
 *   depends_on: [next/link]
 *   exposes: [AppHeader]
 * invariants:
 *   - Always renders TTB Label Checker title linking to home
 *   - Uses primary theme colors from Tailwind config
 * authority:
 *   decides: [Header layout, branding display]
 *   delegates: [Routing to Next.js, theming to Tailwind]
 * extension_policy: Add nav items or user menu as features grow
 * failure_contract: Pure render — no failure modes
 * testing_contract: Verify render with correct title and link
 * references: [app/layout.tsx]
 */
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex max-w-6xl items-center px-4 py-3">
        <Link className="font-semibold text-lg tracking-tight" href="/">
          TTB Label Checker
        </Link>
      </div>
    </header>
  );
}
