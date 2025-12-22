"use client";

import { useState } from "react";
import { OptionsBuilderCard } from "./options-builder-card";
import { VariantsCard } from "./variants-card";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import { FiGrid, FiList } from "react-icons/fi";
import PageHeader from "@/shared/ui/page-header";

type Tab = "attributes" | "variations";

export function ProductVariants({ productId }: { productId: string }) {
  const [tab, setTab] = useState<Tab>("attributes");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Variants"
        description="Add options, generate variants, then edit pricing, SKU and details."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-3">
          <nav className="space-y-2">
            <SidebarTab
              active={tab === "attributes"}
              onClick={() => setTab("attributes")}
              icon={FiList}
            >
              Attributes
            </SidebarTab>

            <SidebarTab
              active={tab === "variations"}
              onClick={() => setTab("variations")}
              icon={FiGrid}
            >
              Variations
            </SidebarTab>
          </nav>
        </div>

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-9">
          {tab === "attributes" && <OptionsBuilderCard productId={productId} />}

          {tab === "variations" && <VariantsCard productId={productId} />}
        </div>
      </div>
    </div>
  );
}

function SidebarTab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  icon?: IconType;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition cursor-pointer",
        "hover:bg-muted",
        active
          ? "bg-muted font-extrabold text-primary"
          : "text-muted-foreground"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-4 w-4",
            active ? "text-primary" : "text-muted-foreground"
          )}
        />
      )}
      <span>{children}</span>
    </button>
  );
}
