"use client";

import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import type { OrderEvent } from "../types/order.type";
import { H3 } from "@/shared/ui/typography";

const DEFAULT_VISIBLE = 3;

function formatEventType(type: string) {
  switch (type) {
    case "created":
      return "Created";
    case "marked_paid":
      return "Marked paid";
    case "fulfilled":
      return "Fulfilled";
    case "cancelled":
      return "Cancelled";
    default:
      return type.replaceAll("_", " ");
  }
}

function statusBadgeVariant(status?: string | null) {
  if (status === "paid") return "default";
  if (status === "fulfilled") return "default";
  if (status === "cancelled") return "secondary";
  return "secondary";
}

function when(ts?: string) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export function OrderAuditCard({ events }: { events?: OrderEvent[] }) {
  const list = events ?? [];
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? list : list.slice(0, DEFAULT_VISIBLE);
  const remaining = list.length - DEFAULT_VISIBLE;

  return (
    <div className="border rounded-lg p-2">
      <H3 className="text-lg mb-2 px-4">Audit</H3>

      <div className="space-y-3 p-3">
        {list.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No audit events yet.
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {visible.map((e, idx) => (
                <div key={e.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {formatEventType(e.type)}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {when(e.createdAt)}
                        {e.ipAddress ? (
                          <>
                            {" "}
                            · <span className="font-mono">{e.ipAddress}</span>
                          </>
                        ) : null}
                      </div>

                      {e.message ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          {e.message}
                        </div>
                      ) : null}
                    </div>

                    {e.toStatus ? (
                      <Badge variant={statusBadgeVariant(e.toStatus)}>
                        {e.toStatus}
                      </Badge>
                    ) : null}
                  </div>

                  {(e.fromStatus || e.toStatus) && (
                    <div className="text-xs text-muted-foreground">
                      {e.fromStatus ? (
                        <span className="font-mono">{e.fromStatus}</span>
                      ) : (
                        <span className="font-mono">—</span>
                      )}{" "}
                      →{" "}
                      {e.toStatus ? (
                        <span className="font-mono">{e.toStatus}</span>
                      ) : (
                        <span className="font-mono">—</span>
                      )}
                    </div>
                  )}

                  {idx !== visible.length - 1 ? <Separator /> : null}
                </div>
              ))}
            </div>

            {list.length > DEFAULT_VISIBLE && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground mt-2"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll
                  ? "Show less"
                  : `Show ${remaining} more event${remaining !== 1 ? "s" : ""}`}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
