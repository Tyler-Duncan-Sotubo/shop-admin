/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AdminCustomerRow } from "../types/admin-customer.type";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";

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
  return full || "—";
}

export const adminCustomersColumns: ColumnDef<AdminCustomerRow>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="space-y-0.5">
          <div className="font-medium">{name(c)}</div>
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
    cell: ({ row }) => (
      <YesNoBadge ok={row.original.isVerified} yes="Verified" no="Unverified" />
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <ActiveBadge ok={row.original.isActive} />,
  },
  {
    accessorKey: "marketingOptIn",
    header: "Marketing",
    cell: ({ row }) => (
      <YesNoBadge ok={row.original.marketingOptIn} yes="Opted in" no="no" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const iso = row.original.createdAt;
      const d = new Date(iso);
      return (
        <span className="text-sm">
          {Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString()}
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
        c.phone ?? "",
        c.isActive ? "active" : "inactive",
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
    cell: ({ row }) => <CustomerActions customerId={row.original.id} />,
  },
];

function CustomerActions({ customerId }: { customerId: string }) {
  const router = useRouter();
  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        variant="link"
        onClick={(e) => {
          e.stopPropagation?.();
          router.push(`/customers/${customerId}`); // change route if you prefer /admin/customers/:id
        }}
      >
        View
      </Button>
    </div>
  );
}
