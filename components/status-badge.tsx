import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  not_done: { label: "Not Done", className: "bg-muted text-muted-foreground hover:bg-muted" },
  passed: { label: "Passed", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800 hover:bg-red-100" },
} as const;

export function StatusBadge({ status }: { status: "not_done" | "passed" | "failed" }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
