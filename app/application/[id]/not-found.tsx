import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">Application Not Found</h2>
      <p className="text-muted-foreground">
        The requested COLA application could not be found.
      </p>
      <Button asChild>
        <Link href="/">Back to Applications</Link>
      </Button>
    </div>
  );
}
