"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { Separator } from "@/shared/ui/separator";

export function ThemeGallerySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* Available themes */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />

        {/* Main theme card */}
        <Skeleton className="aspect-16/10 w-full rounded-2xl" />
      </div>

      {/* Separator */}
      <Separator />

      {/* Coming soon */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-16/10 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
