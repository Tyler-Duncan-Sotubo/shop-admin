"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type Address = {
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
}: {
  title: string;
  address: Address | null | undefined;
  emptyText?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
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
