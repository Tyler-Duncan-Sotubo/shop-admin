import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";

export function ChevronUpDown({
  direction,
  className,
}: {
  direction?: "asc" | "desc" | null;
  className?: string;
}) {
  return (
    <ChevronsUpDown
      size={14}
      className={cn(
        "text-black transition-all",
        direction === "asc" && "rotate-180", // optional: flip when ascending
        className
      )}
    />
  );
}
