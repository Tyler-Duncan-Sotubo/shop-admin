"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  settings: "Settings",
  stores: "Stores",
  "audit-logs": "Audit Logs",
  "payment-methods": "Payment Methods",
  profile: "Profile",
  "access-control": "Access Control",
  account: "Account",
  "invoice-template": "Invoice Template",
  "tax-settings": "Tax Settings",
};

function isProbablyId(segment: string) {
  return segment.length >= 16 || segment.includes("-");
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const inSettings = segments[0] === "settings";
  const isSettingsRoot = pathname === "/settings";

  const crumbs =
    inSettings && !isSettingsRoot
      ? segments.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const label = LABELS[seg]
            ? LABELS[seg]
            : isProbablyId(seg)
              ? "Details"
              : seg.charAt(0).toUpperCase() + seg.slice(1);

          return { href, label, isLast: idx === segments.length - 1 };
        })
      : [];

  return (
    <div>
      <header className="my-3">
        {/* No breadcrumbs on /settings */}
        {!isSettingsRoot && inSettings && crumbs.length > 0 && (
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {c.isLast ? (
                  <span className="text-foreground font-medium">{c.label}</span>
                ) : (
                  <Link href={c.href} className="hover:text-foreground">
                    {c.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}
