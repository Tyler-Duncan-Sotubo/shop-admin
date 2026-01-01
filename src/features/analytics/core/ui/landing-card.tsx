"use client";

import type { LandingPageRow } from "../types/dashboard-analytics.type";
import { Skeleton } from "@/shared/ui/skeleton";
import { pageLabelFromPath } from "../libs/page-label";
import Link from "next/link";

function fmtInt(n: number) {
  return new Intl.NumberFormat().format(Math.round(n));
}

export function LandingPagesCard({
  rows,
  isLoading,
}: {
  rows?: LandingPageRow[] | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!rows?.length) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        No landing page data available
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      {/* Header */}

      <Link
        href={{
          pathname: "/analytics/pages",
          query: { tab: "landing-pages-for-analytics" },
        }}
        className="group block rounded-md"
      >
        <div className="mb-3 flex items-center justify-between px-2 py-1">
          <div className="text-sm font-semibold text-muted-foreground">
            Landing Pages
          </div>

          <span className="text-xs text-muted-foreground">View all →</span>
        </div>

        {/* Optional hover affordance */}
        <div className="h-px bg-muted/40 group-hover:bg-muted transition-colors" />
      </Link>

      {/* Rows */}
      <div className="divide-y">
        {rows.map((row, index) => {
          const label = pageLabelFromPath(row.path);

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4 py-3"
            >
              {/* Left */}
              <div className="min-w-0 max-w-sm flex items-center gap-4">
                <div className="text-sm font-medium">{label}</div>
                <div className="wrap-break-word text-xs text-muted-foreground">
                  {row.path}
                </div>
              </div>

              {/* Right */}
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold">
                  {fmtInt(row.visits ?? 0)}
                </div>
                <div className="text-xs text-muted-foreground">Visits</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
