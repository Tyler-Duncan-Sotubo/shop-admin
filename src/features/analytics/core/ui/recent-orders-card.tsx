"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import type { RecentOrderRow } from "../../overview/types/commerce-analytics.type";

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();

  if (s === "paid" || s === "completed") return <Badge>Paid</Badge>;
  if (s === "fulfilled")
    return (
      <Badge variant="default" className="bg-yellow-400">
        Shipped
      </Badge>
    );
  if (s === "cancelled" || s === "canceled")
    return <Badge variant="outline">Cancelled</Badge>;
  if (s === "pending_payment" || s === "pending")
    return <Badge variant="secondary">Pending</Badge>;

  return <Badge variant="secondary">{status}</Badge>;
}

function fmtWhen(row: RecentOrderRow) {
  const iso = row.paidAt ?? row.createdAt;
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function RecentOrdersCard({
  rows,
  isLoading,
}: {
  rows: RecentOrderRow[] | null | undefined;
  isLoading?: boolean;
}) {
  if (isLoading) return <Skeleton className="h-72 w-full rounded-xl" />;

  const data = rows ?? [];

  if (!data.length) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        No recent orders
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <Link
        href={{
          pathname: "/analytics/pages",
          query: { tab: "recent-orders" },
        }}
        className="group block rounded-md"
      >
        <div className="mb-3 flex items-center justify-between px-2 py-1">
          <div className="text-sm font-semibold text-muted-foreground">
            Recent orders
          </div>

          <span className="text-xs text-muted-foreground">View all →</span>
        </div>

        {/* Optional hover affordance */}
        <div className="h-px bg-muted/40 group-hover:bg-muted transition-colors" />
      </Link>

      <div className="divide-y">
        {data.map((o) => {
          const items = o.itemsPreview ?? [];

          return (
            <div
              key={o.id}
              className="grid grid-cols-[minmax(0,1fr)_80px_140px] items-center gap-6 py-3 text-sm"
            >
              {/* LEFT: order + items */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/sales/orders/${o.id}`}
                    className="font-semibold text-primary hover:underline text-xs"
                  >
                    {o.orderNumber}
                  </Link>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {items.length ? (
                    <>
                      <div className="flex -space-x-2">
                        {items.slice(0, 3).map((it, idx) => (
                          <div
                            key={`${it.imageUrl ?? "img"}-${idx}`}
                            className="h-7 w-7 overflow-hidden rounded-full border bg-muted"
                            title={it.productName ?? undefined}
                          >
                            {it.imageUrl ? (
                              <Image
                                src={it.imageUrl}
                                alt={it.productName ?? "Product"}
                                className="h-full w-full object-cover"
                                width={28}
                                height={28}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold">
                          {items[0]?.productName ?? "Item"}
                          {items.length > 1 ? (
                            <span className="text-muted-foreground">
                              {" "}
                              +{items.length - 1} more
                            </span>
                          ) : null}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {items[0]?.category ?? "—"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">—</div>
                  )}
                </div>
              </div>

              {/* MIDDLE: status */}
              <div className="flex">
                <StatusBadge status={o.status} />
              </div>

              {/* RIGHT: total + when */}
              <div className="text-right">
                <div className="text-xs font-semibold">
                  {formatMoneyNGN(o.totalMinor ?? 0, o.currency ?? "NGN")}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {fmtWhen(o)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
