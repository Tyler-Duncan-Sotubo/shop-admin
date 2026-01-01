// shared/ui/tab-label.tsx
import { cn } from "@/lib/utils";

type TabLabelProps = {
  label: string;
  count?: number;
  showZero?: boolean; // optional control
  className?: string;
};

export function TabLabel({
  label,
  count,
  showZero = true,
  className,
}: TabLabelProps) {
  const shouldShowCount = typeof count === "number" && (showZero || count > 0);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span>{label}</span>

      {shouldShowCount && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {count}
        </span>
      )}
    </span>
  );
}
