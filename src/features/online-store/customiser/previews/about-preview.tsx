/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";

function safeSections(resolved: any) {
  const arr = resolved?.pages?.about?.sections;
  return Array.isArray(arr) ? arr : [];
}

function pickDraftOrBase(
  draftVal?: string | null,
  baseVal?: string | null
): string {
  return (draftVal ?? "").length ? (draftVal as string) : baseVal ?? "";
}

export function AboutPreview({
  resolved,
  draft,
  previewThemeVars,
}: {
  resolved: any;
  draft: any;
  previewThemeVars?: React.CSSProperties;
}) {
  const sections = safeSections(resolved);
  const s0 = sections[0] ?? {};
  const s1 = sections[1] ?? {};

  // Hero 0
  const hero0Title = pickDraftOrBase(draft.aboutHero0Title, s0?.content?.title);
  const hero0Desc = pickDraftOrBase(
    draft.aboutHero0Description,
    s0?.content?.description
  );
  const hero0BgSrc = pickDraftOrBase(
    draft.aboutHero0BgSrc,
    s0?.background?.image?.src
  );

  // Split 1
  const split1Title = pickDraftOrBase(
    draft.aboutSplit1Title,
    s1?.content?.title
  );

  const baseParagraphs: string[] = Array.isArray(s1?.content?.paragraphs)
    ? s1.content.paragraphs
    : [];

  const splitParas = [
    pickDraftOrBase(draft.aboutSplit1Paragraph1, baseParagraphs[0]),
    pickDraftOrBase(draft.aboutSplit1Paragraph2, baseParagraphs[1]),
    pickDraftOrBase(draft.aboutSplit1Paragraph3, baseParagraphs[2]),
  ].filter((p) => p?.trim().length);

  const splitImgSrc = pickDraftOrBase(draft.aboutSplit1ImgSrc, s1?.image?.src);

  const splitCtaLabel = pickDraftOrBase(
    draft.aboutSplit1CtaLabel,
    s1?.content?.cta?.label
  );
  const splitCtaHref = pickDraftOrBase(
    draft.aboutSplit1CtaHref,
    s1?.content?.cta?.href
  );

  return (
    <div
      className="col-span-8 bg-muted/30 overflow-auto"
      style={previewThemeVars}
    >
      <div className="p-6">
        <div className="mx-auto max-w-[1100px] space-y-10">
          {/* HERO 0 */}
          <section className="rounded-xl border bg-white overflow-hidden">
            <div className="relative h-80 bg-black/10">
              {hero0BgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero0BgSrc}
                  alt="About hero background"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/20" />

              <div className="relative z-10 h-full flex items-center text-center">
                <div className="px-10 max-w-2xl text-white space-y-3">
                  <div className="text-3xl font-semibold">
                    {hero0Title || "About headline"}
                  </div>
                  <div className="text-sm opacity-90">
                    {hero0Desc || "About hero description"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SPLIT 1 */}
          <section className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
              {/* Image (left) */}
              <div className="relative min-h-[280px] bg-muted">
                {splitImgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={splitImgSrc}
                    alt="About split image"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                    No image selected
                  </div>
                )}
              </div>

              {/* Content (right) */}
              <div className="p-8 space-y-4">
                <div className="text-xl font-semibold">
                  {split1Title || "Section title"}
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  {splitParas.length ? (
                    splitParas.map((p: string, idx: number) => (
                      <p key={idx} className="leading-6">
                        {p}
                      </p>
                    ))
                  ) : (
                    <p className="leading-6">Add paragraphs in the editor.</p>
                  )}
                </div>

                {splitCtaLabel && (
                  <div className="pt-2">
                    <a
                      href={splitCtaHref || "#"}
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium"
                      style={{
                        backgroundColor: "hsl(var(--preview-primary))",
                        color: "hsl(var(--preview-primary-foreground))",
                      }}
                    >
                      {splitCtaLabel}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
