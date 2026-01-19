"use client";

import { cn } from "@/lib/utils";
import { FcGoogle } from "react-icons/fc";

export function GoogleSerpPreview({
  active,
  siteName,
  canonicalBaseUrl,
  title,
  description,
  previewFavicon,
}: {
  active?: boolean;
  siteName?: string;
  canonicalBaseUrl?: string;
  title?: string;
  description?: string;
  previewFavicon?: string;
}) {
  const url = canonicalBaseUrl || "https://example.com";
  const name = siteName || "Your site";
  const initial = (name?.[0] || "S").toUpperCase();

  return (
    <div
      className={cn(
        "rounded-xl bg-white p-4 border",
        active && "ring-1 ring-muted-foreground/30"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <FcGoogle className="size-6" />
        <div className="text-xs text-muted-foreground">
          Google search result preview
        </div>
      </div>

      {/* Result */}
      <div className="space-y-1">
        {/* Site name + URL */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="size-4 rounded-full bg-muted flex items-center justify-center">
            {previewFavicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewFavicon}
                alt={`${name} favicon`}
                className="h-4 w-4 rounded ml-2"
              />
            ) : (
              <div className="size-4 rounded-full bg-muted flex items-center justify-center ml-2">
                <span className="text-[10px] font-semibold">{initial}</span>
              </div>
            )}
          </div>
          <span className="font-medium text-foreground">{name}</span>
          <span>·</span>
          <span className="text-green-700">{url}</span>
        </div>

        {/* Title */}
        <div className="text-[15px] font-medium text-[#1a0dab] leading-snug">
          {title || "Your page title appears here"}
        </div>

        {/* Description */}
        <div className="text-xs text-muted-foreground leading-snug max-w-[560px]">
          {description ||
            "This is how your description may appear in Google search results."}
        </div>
      </div>
    </div>
  );
}
