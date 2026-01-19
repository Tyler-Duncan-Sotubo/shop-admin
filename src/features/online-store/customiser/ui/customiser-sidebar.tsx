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
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { ResolvedStorefrontConfig } from "../types/storefront-config.types";

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
    hint: "Top bar, navigation, icons",
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
  {
    id: "seo",
    label: "SEO",
    icon: Search,
    hint: "Title, description, OG, canonical",
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: Settings,
    hint: "Feature toggles & variants",
  },

  // conditional pages
  { id: "about", label: "About", icon: FileText, hint: "About page sections" },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    hint: "Contact page sections",
  },
] as const;

export type StorefrontSectionId = (typeof SECTIONS)[number]["id"];

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

  const visibleSections = SECTIONS.filter((s) => {
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

  return (
    <aside className="w-80 shrink-0 border-r bg-white flex flex-col">
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

      <nav className="flex-1 space-y-1 p-3">
        {visibleSections.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;

          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left transition flex gap-3 items-start",
                isActive ? "bg-muted" : "hover:bg-muted/60"
              )}
            >
              <span
                className={cn(
                  "mt-0.5",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
              </span>

              <span className="flex-1">
                <span
                  className={cn(
                    "block text-sm",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {s.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {s.hint}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

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
