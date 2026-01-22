"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

import { Separator } from "@/shared/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

import { ThemeCard } from "./theme-card";
import { ThemeGallerySkeleton } from "./theme-gallery-skeleton";
import {
  usePublishedStorefrontOverride,
  useStoreThemeStatus,
} from "../hooks/use-storefront-overrides";
import type { ThemeGalleryItem } from "../types/theme.type";

type Props = {
  session: Session | null;
  axios: AxiosInstance;
  storeId: string | null;
};

const DEFAULT_PUBLIC_THEME_ID = "019bacc9-5933-7f51-bb6c-df5ab583c255";

export function ThemeGallery({ session, axios, storeId }: Props) {
  const router = useRouter();

  const publishedQ = usePublishedStorefrontOverride(
    session,
    axios,
    storeId ?? "",
  );

  const themeStatusQ = useStoreThemeStatus(session, axios, storeId ?? "");
  const activeThemeId = themeStatusQ.data?.themeId ?? DEFAULT_PUBLIC_THEME_ID;

  const themes = useMemo<ThemeGalleryItem[]>(() => {
    return [
      {
        id: DEFAULT_PUBLIC_THEME_ID, // ✅ real id
        name: "Modave",
        description: "Your current storefront theme (editable)",
        imageSrc:
          "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/modave.jpg",
        disabled: false,
      },
      {
        id: "soon-1",
        name: "Razzi",
        description: "New layout & blocks",
        imageSrc:
          "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/68747470733a2f2f6e696e657468656d652e636f6d2f696d616765732f7374796c65722f73686f702e706e67.png",
        disabled: true,
      },
      {
        id: "soon-2",
        name: "Venam",
        description: "Premium look & feel",
        imageSrc:
          "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/theme3.png",
        disabled: true,
      },
    ];
  }, []);

  const isLoading = publishedQ.isLoading;
  const error = (publishedQ.error as Error | null)?.message;

  if (isLoading) return <ThemeGallerySkeleton />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&apos;t load storefront customisation</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const available = themes.filter((t) => !t.disabled);
  const comingSoon = themes.filter((t) => t.disabled);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Store customisation</h2>
        <p className="text-sm text-muted-foreground">
          Pick a theme to start editing logo, SEO, header, footer and homepage.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Available themes</div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((t) => (
              <ThemeCard
                key={t.id}
                title={t.name}
                subtitle={t.description}
                imageSrc={t.imageSrc}
                selected={activeThemeId === t.id} // ✅ Active based on published
                onClick={() => {
                  router.push(`/customiser`);
                }}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="text-sm font-semibold">Coming soon</div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {comingSoon.map((t) => (
              <ThemeCard
                key={t.id}
                title={t.name}
                subtitle={t.description}
                imageSrc={t.imageSrc}
                disabled
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
