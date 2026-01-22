/* eslint-disable @typescript-eslint/no-explicit-any */
// customiser-sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  X,
  Paintbrush,
  Search,
  LayoutTemplate,
  PanelTop,
  PanelBottom,
  Settings,
  FileText,
  Mail,
  Menu,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/shared/ui/sheet";

const SECTIONS = [
  {
    id: "appearance",
    label: "Appearance",
    icon: Paintbrush,
    hint: "Branding, colors, radius, fonts",
  },
  {
    id: "header",
    label: "Header",
    icon: PanelTop,
    hint: "Top bar, nav, icons",
  },
  {
    id: "homepage",
    label: "Homepage",
    icon: LayoutTemplate,
    hint: "Hero and home sections",
  },
  {
    id: "footer",
    label: "Footer",
    icon: PanelBottom,
    hint: "Links, newsletter, payments, WhatsApp",
  },
  { id: "seo", label: "SEO", icon: Search, hint: "Title, OG, canonical" },
  { id: "advanced", label: "Advanced", icon: Settings, hint: "Toggles" },
  { id: "about", label: "About", icon: FileText, hint: "About page sections" },
  { id: "contact", label: "Contact", icon: Mail, hint: "Contact sections" },
] as const;

export type StorefrontSectionId = (typeof SECTIONS)[number]["id"];

function getVisibleSections(args: {
  resolved: ResolvedStorefrontConfig;
  headerMenu?: { about: boolean; contact: boolean; blog: boolean };
}) {
  const { resolved, headerMenu } = args;
  return SECTIONS.filter((s) => {
    if (s.id === "about") {
      return (
        !!headerMenu?.about && Array.isArray(resolved.pages?.about?.sections)
      );
    }
    if (s.id === "contact") {
      return (
        !!headerMenu?.contact &&
        Array.isArray(resolved.pages?.contact?.sections)
      );
    }
    return true;
  });
}

function SidebarNav({
  active,
  onSelect,
  visibleSections,
  closeOnSelect,
}: {
  active: StorefrontSectionId;
  onSelect: (id: StorefrontSectionId) => void;
  visibleSections: typeof SECTIONS;
  closeOnSelect?: boolean;
}) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {visibleSections.map((s) => {
        const Icon = s.icon;
        const isActive = active === s.id;

        const btn = (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-left transition flex gap-3 items-start",
              isActive ? "bg-muted" : "hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "mt-0.5",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>

            <span className="flex-1 min-w-0">
              <span
                className={cn(
                  "block text-sm truncate",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {s.label}
              </span>
              <span className="block text-xs text-muted-foreground truncate">
                {s.hint}
              </span>
            </span>
          </button>
        );

        return closeOnSelect ? (
          <SheetClose asChild key={s.id}>
            {btn}
          </SheetClose>
        ) : (
          btn
        );
      })}
    </nav>
  );
}

/** Desktop sidebar (unchanged) */
export function CustomiserSidebar({
  active,
  onSelect,
  resolved,
  headerMenu,
}: {
  active: StorefrontSectionId;
  onSelect: (id: StorefrontSectionId) => void;
  resolved: ResolvedStorefrontConfig;
  headerMenu?: { about: boolean; contact: boolean; blog: boolean };
}) {
  const router = useRouter();
  const visibleSections = getVisibleSections({ resolved, headerMenu });

  return (
    <aside className="hidden md:flex w-80 shrink-0 border-r bg-white flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate">
            Storefront customisation
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            Edit and preview your storefront
          </p>
        </div>

        <Button
          variant="link"
          onClick={() => router.push("/online-store")}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close customiser"
        >
          <X size={20} className="size-8" />
        </Button>
      </div>

      <SidebarNav
        active={active}
        onSelect={onSelect}
        visibleSections={visibleSections as any}
      />

      <div className="border-t p-3">
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>Preview</span>
          <span className="rounded-full bg-muted px-2 py-1 text-[11px]">
            Resolved config
          </span>
        </div>
      </div>
    </aside>
  );
}

/** Mobile sheet trigger + sheet nav */
export function CustomiserSidebarMobile({
  active,
  onSelect,
  resolved,
  headerMenu,
}: {
  active: StorefrontSectionId;
  onSelect: (id: StorefrontSectionId) => void;
  resolved: ResolvedStorefrontConfig;
  headerMenu?: { about: boolean; contact: boolean; blog: boolean };
}) {
  const router = useRouter();
  const visibleSections = getVisibleSections({ resolved, headerMenu });

  const activeLabel =
    (SECTIONS.find((s) => s.id === active)?.label as string) ?? "Sections";

  return (
    <div className="md:hidden">
      <Sheet>
        <div className="flex items-center justify-between gap-2 border-b bg-white px-3 py-2">
          <SheetTrigger asChild>
            <Button variant="clean" className="h-9 gap-2">
              <Menu className="h-4 w-4" />
              <span className="text-sm font-medium">{activeLabel}</span>
            </Button>
          </SheetTrigger>

          <Button
            variant="ghost"
            className="h-9 w-9 p-0"
            onClick={() => router.push("/online-store")}
            aria-label="Close customiser"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <SheetContent side="left" className="w-[320px] p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Storefront customisation</SheetTitle>
            <SheetDescription>
              Edit and preview your storefront
            </SheetDescription>
          </SheetHeader>

          <SidebarNav
            active={active}
            onSelect={onSelect}
            visibleSections={visibleSections as any}
            closeOnSelect
          />

          <div className="border-t p-3">
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Preview</span>
              <span className="rounded-full bg-muted px-2 py-1 text-[11px]">
                Resolved config
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
