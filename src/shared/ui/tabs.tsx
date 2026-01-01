"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2 mt-10", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base styles
        "inline-flex items-center justify-center px-1 mr-10 py-1 text-base font-semibold whitespace-nowrap transition-colors cursor-pointer",
        "text-foreground dark:text-muted-foreground",
        "border-b-2 border-transparent", // default hidden underline

        // Hover only for inactive tabs
        "hover:data-[state=inactive]:text-primary",

        // Active state → primary underline + text-primary
        "data-[state=active]:text-primary",
        "data-[state=active]:border-primary",

        // Active state never has background changes
        "data-[state=active]:bg-transparent",
        "data-[state=active]:hover:bg-transparent",

        // Focus styles
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",

        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",

        // SVG icon styles
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
