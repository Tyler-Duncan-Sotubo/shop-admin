"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/badge";

type Props = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  disabled?: boolean;
  selected?: boolean; // active
  onClick?: () => void;
};

export function ThemeCard({
  title,
  subtitle,
  imageSrc,
  disabled,
  selected,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-border",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
      )}
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-muted">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 520px"
          className="object-cover"
          priority={selected}
        />

        {/* Readability gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

        {/* Hover darken */}
        <div
          className={cn(
            "absolute inset-0 bg-black/0 transition",
            disabled ? "bg-black/10" : "group-hover:bg-black/35",
          )}
        />

        {/* Center hover text (NOT a button) */}
        {!disabled && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <div className="text-2xl font-bold tracking-wide text-white drop-shadow">
              Customize
            </div>
          </div>
        )}

        {/* Bottom content (always visible) */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-end justify-between gap-3">
            {/* Title / subtitle */}
            <div className="min-w-0">
              <div className="truncate text-xl font-extrabold text-white">
                {title}
              </div>
              {subtitle && (
                <div className="mt-1 line-clamp-2 text-xs text-secondary">
                  {subtitle}
                </div>
              )}
            </div>

            {/* Status badge (bottom-right) */}
            <div className="shrink-0">
              {disabled ? (
                <Badge variant="secondary">Coming soon</Badge>
              ) : selected ? (
                <Badge>Active</Badge>
              ) : (
                <Badge variant="pending">Available</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
