// components/ui/action-badge.tsx
import { cn } from "@/lib/utils";

type ActionBadgeProps = {
  action: string;
};

const styleMap: Record<string, string> = {
  create: "bg-green-600 text-white",
  update: "bg-orange-400 text-white",
  delete: "bg-destructive text-white",
  delete_failed: "bg-destructive text-white",
};

export function ActionBadge({ action }: ActionBadgeProps) {
  const label = action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const style = styleMap[action.toLowerCase()] ?? "bg-muted text-foreground";

  return (
    <span
      className={cn(
        "px-4 py-1 text-xs rounded-lg font-medium capitalize whitespace-nowrap",
        style
      )}
    >
      {label}
    </span>
  );
}
