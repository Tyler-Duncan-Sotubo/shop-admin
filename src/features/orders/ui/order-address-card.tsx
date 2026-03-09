"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { FaRegEdit } from "react-icons/fa";

type Address = {
  customerAddressId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

function line(v?: string | null) {
  return v && v.trim().length ? v : null;
}

function fullName(a?: Address | null) {
  const fn = a?.firstName?.trim() ?? "";
  const ln = a?.lastName?.trim() ?? "";
  const name = `${fn} ${ln}`.trim();
  return name.length ? name : null;
}

function AddressBlock({ a }: { a: Address }) {
  const name = fullName(a);
  const addr2 = line(a.address2);
  const parts = [
    line(a.address1),
    addr2,
    [line(a.city), line(a.state), line(a.postalCode)]
      .filter(Boolean)
      .join(", "),
    line(a.country),
  ].filter(Boolean);

  return (
    <div className="space-y-1">
      {name && <div className="text-sm font-medium">{name}</div>}
      {a.email && (
        <div className="text-sm text-muted-foreground">{a.email}</div>
      )}
      {a.phone && (
        <div className="text-sm text-muted-foreground">{a.phone}</div>
      )}
      <div className="pt-2 space-y-1">
        {parts.map((p, idx) => (
          <div key={idx} className="text-sm">
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderAddressCard({
  title,
  address,
  emptyText = "No address available.",
  editable = false,
  onEdit,
}: {
  title: string;
  address: Address | null | undefined;
  emptyText?: string;
  editable?: boolean;
  onEdit?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">{title}</CardTitle>

        {editable ? (
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            <FaRegEdit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : null}
      </CardHeader>

      <CardContent>
        {address ? (
          <AddressBlock a={address} />
        ) : (
          <div className="text-sm text-muted-foreground">{emptyText}</div>
        )}
      </CardContent>
    </Card>
  );
}
