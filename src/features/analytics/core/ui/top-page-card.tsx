import Link from "next/link";
import { pageLabelFromPath } from "../libs/page-label";
import type { TopPageRow } from "../types/dashboard-analytics.type";
import { Skeleton } from "@/shared/ui/skeleton";

export function TopPagesCard({
  rows,
  isLoading,
}: {
  rows?: TopPageRow[] | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (!rows?.length) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        No page data available
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      {/* Clickable header */}

      <Link
        href={{ pathname: "/analytics/pages", query: { tab: "top" } }}
        className="group block rounded-md"
      >
        <div className="mb-3 flex items-center justify-between px-2 py-1">
          <div className="text-sm font-semibold text-muted-foreground">
            Top pages
          </div>

          <span className="text-xs text-muted-foreground">View all →</span>
        </div>

        {/* Optional hover affordance */}
        <div className="h-px bg-muted/40 group-hover:bg-muted transition-colors" />
      </Link>

      <div className="divide-y">
        {rows.map((row, index) => {
          const label = pageLabelFromPath(row.path);

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4 py-3"
            >
              {/* Left */}
              <div className="min-w-0 flex items-center gap-2">
                <div className="font-medium text-sm">{label}</div>
                <div className="wrap-break-word text-xs text-muted-foreground">
                  {row.path}
                </div>
              </div>

              {/* Right */}
              <div className="flex shrink-0 gap-6 text-right">
                <div>
                  <div className="text-sm font-semibold">
                    {new Intl.NumberFormat().format(row.pageViews ?? 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>

                <div>
                  <div className="text-sm font-semibold">
                    {new Intl.NumberFormat().format(row.visits ?? 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Visits</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
