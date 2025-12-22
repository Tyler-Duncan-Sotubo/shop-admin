"use client";

import Link from "next/link";
import { settingsItems } from "../config/settings-items";
import { P } from "@/shared/ui/typography";

interface SettingItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

function Sections({ title, items }: { title: string; items: SettingItem[] }) {
  return (
    <section>
      <P className="mb-4">{title}</P>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
  const grouped = settingsItems.reduce<Record<string, typeof settingsItems>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );
  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([category, items]) => (
        <Sections key={category} title={category} items={items} />
      ))}
    </div>
  );
}
