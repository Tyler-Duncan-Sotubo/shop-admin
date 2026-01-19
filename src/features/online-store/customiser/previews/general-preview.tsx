/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";

const GeneralPreview = ({
  section,
  draft,
  hero,
}: {
  section: string;
  draft: any;
  hero: any;
}) => {
  const previewHeroEnabled =
    section === "homepage" ? draft.heroEnabled : !!hero?.enabled;
  const previewHeroHeading =
    section === "homepage" ? draft.heroHeading : hero?.content?.heading ?? "";
  const previewHeroSubtext =
    section === "homepage"
      ? draft.heroSubtext
      : hero?.content?.description ?? "";

  const previewBottomStripEnabled =
    section === "homepage"
      ? !!draft.heroBottomStripEnabled
      : !!hero?.bottomStrip?.enabled;

  const previewBottomStripText =
    section === "homepage"
      ? draft.heroBottomStripText ?? ""
      : hero?.bottomStrip?.text ?? "";

  const previewHeroCtaLabel =
    section === "homepage"
      ? draft.heroCtaLabel
      : hero?.content?.cta?.label ?? "";

  const previewHeroCtaHref =
    section === "homepage"
      ? draft.heroCtaHref
      : hero?.content?.cta?.href ?? "#";

  return (
    <div className="mx-auto max-w-[1100px] space-y-4">
      <div>
        {/* Home hero */}
        {previewHeroEnabled && (
          <div
            className={cn(
              "relative",
              section === "homepage" &&
                "ring-inset ring-2 ring-muted-foreground/30"
            )}
          >
            <div className="aspect-16/6 w-full bg-black/10 relative">
              {hero?.image?.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero.image.src}
                  alt={hero.image.alt ?? "Hero"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-black/10" />

              {/* Optional gradient (looks nicer) */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-black/20" />

              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="max-w-xl text-center text-white space-y-2 relative z-10">
                  <div className="text-3xl font-semibold">
                    {previewHeroHeading || "Headline"}
                  </div>

                  <div className="text-sm opacity-90">
                    {previewHeroSubtext || "Subtext"}
                  </div>

                  {previewHeroCtaLabel && (
                    <div className="pt-4 flex justify-center">
                      <a
                        href={previewHeroCtaHref || "#"}
                        className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium"
                        style={{
                          backgroundColor: "hsl(var(--preview-primary))",
                          color: "hsl(var(--preview-primary-foreground))",
                        }}
                        onClick={(e) => e.preventDefault()} // preview only
                      >
                        {previewHeroCtaLabel}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {previewHeroCtaLabel && (
                <div className="pt-3">
                  <span
                    className="inline-block rounded-full px-5 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: "hsl(var(--preview-primary))",
                      color: "hsl(var(--preview-primary-foreground))",
                    }}
                  >
                    {previewHeroCtaLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {previewBottomStripEnabled && previewBottomStripText && (
          <div
            className={cn(
              "px-4 py-3 text-xs border-t text-center font-medium",
              section === "homepage" &&
                "ring-inset ring-2 ring-muted-foreground/30"
            )}
            style={{
              backgroundColor: "hsl(var(--preview-primary))",
              color: "hsl(var(--preview-primary-foreground))",
            }}
          >
            {previewBottomStripText}
          </div>
        )}

        {/* Dummy content (helps preview feel real) */}
        <div className="px-4 py-6 space-y-8">
          {/* Shop by category */}
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm font-semibold">Shop by category</div>
                <div className="text-xs text-muted-foreground">
                  Add categories on the Homepage section later.
                </div>
              </div>
              <div className="text-xs text-muted-foreground">View all</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {DUMMY_CATEGORIES.map((c) => (
                <div
                  key={c.label}
                  className="rounded-xl border bg-white overflow-hidden"
                >
                  <div className="aspect-4/3 bg-muted relative">
                    <SkeletonBlock />
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-medium truncate">
                      {c.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured products */}
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm font-semibold">Featured products</div>
                <div className="text-xs text-muted-foreground">
                  Product grid preview (dummy).
                </div>
              </div>
              <div className="text-xs text-muted-foreground">See more</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border bg-white overflow-hidden"
                >
                  <div className="aspect-square bg-muted relative">
                    <SkeletonBlock />
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />

                    <div className="pt-1 flex items-center justify-between">
                      <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                      <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralPreview;

const DUMMY_CATEGORIES = [
  { label: "Bedroom" },
  { label: "Bathroom" },
  { label: "Kitchen" },
  { label: "Living room" },
  { label: "Essentials" },
];

function SkeletonBlock() {
  return (
    <div className="absolute inset-0">
      {/* simple shimmer */}
      <div className="h-full w-full animate-pulse bg-linear-to-r from-muted via-muted/60 to-muted" />
    </div>
  );
}
