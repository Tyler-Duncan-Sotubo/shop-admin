// features/subscriptions/components/status-badge.tsx
import { Badge } from "@/shared/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantMap: Record<string, any> = {
    active: "success",
    trialing: "clean",
    past_due: "destructive",
    cancelled: "clean",
    expired: "destructive",
  };

  return (
    <Badge variant={variantMap[status] ?? "clean"}>
      {status === "past_due"
        ? "Past due"
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
