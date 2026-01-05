/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AdminCustomerRow } from "../types/admin-customer.type";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";

function YesNoBadge({
  ok,
  yes = "Yes",
  no = "No",
}: {
  ok: boolean;
  yes?: string;
  no?: string;
}) {
  return (
    <Badge variant={ok ? ("success" as any) : ("clean" as any)}>
      {ok ? yes : no}
    </Badge>
  );
}

function ActiveBadge({ ok }: { ok: boolean }) {
  return (
    <Badge variant={ok ? ("success" as any) : ("destructive" as any)}>
      {ok ? "Active" : "Inactive"}
    </Badge>
  );
}

function name(c: AdminCustomerRow) {
  const full = [c.firstName, c.lastName].filter(Boolean).join(" ");
  // For subscribers, fall back to email
  return full || c.displayName || c.email || "—";
}

function marketingLabelFromStatus(
  status?: AdminCustomerRow["marketingStatus"] | null
) {
  if (!status) return null;
  if (status === "subscribed") return { ok: true, yes: "Subscribed", no: "—" };
  if (status === "pending") return { ok: true, yes: "Pending", no: "—" };
  return { ok: false, yes: "—", no: "Unsubscribed" };
}

export const adminCustomersColumns: ColumnDef<AdminCustomerRow>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const c = row.original;
      const isSubscriber = c.entityType === "subscriber";

      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="font-medium">{name(c)}</div>
            {isSubscriber ? (
              <Badge variant={"clean" as any} className="text-xs">
                Subscriber
              </Badge>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">{c.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.phone ?? "—"}</span>
    ),
  },
  {
    accessorKey: "isVerified",
    header: "Verified",
    cell: ({ row }) => {
      const c = row.original;
      if (c.entityType === "subscriber") {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      return (
        <YesNoBadge ok={Boolean(c.isVerified)} yes="Verified" no="Unverified" />
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const c = row.original;

      // Subscribers don't have isActive in your model
      if (c.entityType === "subscriber") {
        return <Badge variant={"clean" as any}>—</Badge>;
      }

      return <ActiveBadge ok={Boolean(c.isActive)} />;
    },
  },
  {
    id: "marketing",
    header: "Marketing",
    cell: ({ row }) => {
      const c = row.original;

      // Prefer marketingStatus if present (subscriber rows)
      const fromStatus = marketingLabelFromStatus(c.marketingStatus);
      if (fromStatus) {
        // subscribed/pending => ok true, unsubscribed => ok false
        if (c.marketingStatus === "pending") {
          return <Badge variant={"clean" as any}>Pending</Badge>;
        }
        return (
          <YesNoBadge
            ok={c.marketingStatus === "subscribed"}
            yes="Subscribed"
            no="Unsubscribed"
          />
        );
      }

      // Fallback to boolean (customer rows)
      return (
        <YesNoBadge ok={Boolean(c.marketingOptIn)} yes="Opted in" no="No" />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const iso = row.original.createdAt;
      if (!iso) return <span className="text-sm">—</span>;

      const date = parseISO(iso);

      return (
        <span className="text-sm">
          {isValid(date) ? format(date, "MMM d, yyyy") : iso}
        </span>
      );
    },
  },

  {
    accessorKey: "lastLogin",
    header: "Last login",
    cell: ({ row }) => {
      const iso = row.original.lastLogin;
      if (!iso) return <span className="text-sm text-muted-foreground">—</span>;
      const d = new Date(iso);
      return (
        <span className="text-sm">
          {Number.isNaN(d.getTime()) ? iso : d.toLocaleString()}
        </span>
      );
    },
  },

  // ✅ Hidden search column so DataTable filtering works well
  {
    id: "search",
    accessorFn: (c) =>
      [
        c.id,
        c.email,
        c.firstName ?? "",
        c.lastName ?? "",
        c.displayName ?? "",
        c.phone ?? "",
        c.entityType ?? "customer",
        c.entityType === "subscriber"
          ? c.marketingStatus ?? ""
          : c.isActive
          ? "active"
          : "inactive",
        c.isVerified ? "verified" : "unverified",
      ]
        .join(" ")
        .toLowerCase(),
    header: () => null,
    cell: () => null,
    enableSorting: false,
  },

  // ✅ Actions
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <CustomerActions
        customerId={row.original.id}
        entityType={row.original.entityType}
      />
    ),
  },
];

function CustomerActions({
  customerId,
  entityType,
}: {
  customerId: string;
  entityType?: "customer" | "subscriber";
}) {
  const router = useRouter();
  const isSubscriber = entityType === "subscriber";

  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        variant="link"
        disabled={isSubscriber}
        onClick={(e) => {
          e.stopPropagation?.();
          if (isSubscriber) return;
          router.push(`/customers/${customerId}`);
        }}
      >
        View
      </Button>
    </div>
  );
}
