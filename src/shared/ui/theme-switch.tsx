"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null; // avoid hydration mismatch

  const items: { label: string; value: ThemeMode }[] = [
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
  ];

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Theme</div>

      <div className="inline-flex gap-2 rounded-lg border bg-background p-2">
        {items.map((item) => {
          const selected = theme === item.value;

          return (
            <Button
              key={item.value}
              type="button"
              variant="clean"
              onClick={() => setTheme(item.value)}
              className={cn("h-10 px-4", selected && "border-primary")}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Choose a theme preference for this device.
      </p>
    </div>
  );
}
