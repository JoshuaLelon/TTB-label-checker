import Link from "next/link";

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex max-w-6xl items-center px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TTB Label Checker
        </Link>
      </div>
    </header>
  );
}
