/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { settingsItems } from "../config/settings-items";
import { P } from "@/shared/ui/typography";
import { hasPermission } from "@/lib/auth/has-permission";

interface SettingItem {
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  permissions?: readonly string[];
}

function Sections({ title, items }: { title: string; items: SettingItem[] }) {
  return (
    <section>
      <P className="mb-4">{title}</P>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {items.map((item) => (
          <Link key={item.link} href={item.link}>
            <div className="hover:bg-muted rounded-md transition-shadow h-full p-4 flex items-start gap-5">
              <div className="flex flex-row items-center gap-4">
                <div className="text-primary bg-muted w-12 h-12 flex justify-center items-center rounded-full">
                  {item.icon}
                </div>
              </div>

              <div>
                <P className="font-bold text-primary">{item.title}</P>
                <P className="text-muted-foreground not-first:mt-0 text-sm">
                  {item.description}
                </P>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function SettingsSection() {
  const { data: session } = useSession();

  const userPermissions = useMemo(
    () =>
      (session as any)?.user?.permissions ??
      (session as any)?.permissions ??
      [],
    [session],
  );

  const visibleSettingsItems = useMemo(
    () =>
      settingsItems.filter((item) =>
        hasPermission(userPermissions, item.permissions),
      ),
    [userPermissions],
  );

  const grouped = useMemo(
    () =>
      visibleSettingsItems.reduce<Record<string, SettingItem[]>>(
        (acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        },
        {},
      ),
    [visibleSettingsItems],
  );

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([category, items]) => (
        <Sections key={category} title={category} items={items} />
      ))}
    </div>
  );
}
