"use client";

import { CampaignBuilderValues } from "../schema/campaign.schema";

type Props = {
  values: Partial<CampaignBuilderValues>;
  color: string;
  view: "desktop" | "mobile";
};

export function NewsletterPreviewBody({ values, color, view }: Props) {
  const hasHero =
    values.heroImageUrl ||
    values.heroTitle ||
    values.heroHighlight ||
    values.discountValue ||
    values.promoCode;

  const hasProducts = values.products && values.products.length > 0;

  return (
    <>
      {/* ── Hero ── */}
      {hasHero ? (
        <div
          className="relative"
          style={{
            minHeight: view === "mobile" ? 260 : 340,
            backgroundImage: values.heroImageUrl
              ? `url(${values.heroImageUrl})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: values.heroImageUrl ? undefined : "#d1d5db",
          }}
        >
          {!values.heroImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-gray-400">
                Hero image will appear here
              </p>
            </div>
          )}
          {(values.heroTitle ||
            values.heroHighlight ||
            values.discountValue ||
            values.promoCode) && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="text-center px-6 py-6 w-full"
                style={{
                  maxWidth: view === "mobile" ? 260 : 320,
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: `3px solid ${color}`,
                }}
              >
                {values.heroTitle && (
                  <p
                    className="font-normal uppercase text-gray-600 mb-1"
                    style={{
                      fontSize: view === "mobile" ? 11 : 13,
                      letterSpacing: "0.4em",
                    }}
                  >
                    {values.heroTitle}
                  </p>
                )}
                {values.heroHighlight && (
                  <p
                    className="font-bold leading-none text-gray-900 mb-3"
                    style={{
                      fontSize: view === "mobile" ? 40 : 56,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {values.heroHighlight}
                  </p>
                )}
                {values.discountLabel && (
                  <p
                    className="uppercase text-gray-500 mb-0.5"
                    style={{
                      fontSize: view === "mobile" ? 10 : 12,
                      letterSpacing: "0.3em",
                    }}
                  >
                    {values.discountLabel}
                  </p>
                )}
                {values.discountValue && (
                  <p
                    className="font-bold text-gray-900 mb-3"
                    style={{ fontSize: view === "mobile" ? 22 : 28 }}
                  >
                    {values.discountValue}
                  </p>
                )}
                {values.promoCode && (
                  <p
                    className="uppercase text-gray-600"
                    style={{
                      fontSize: view === "mobile" ? 10 : 12,
                      letterSpacing: "0.15em",
                    }}
                  >
                    WITH CODE:{" "}
                    <strong className="text-gray-900">
                      {values.promoCode}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="bg-gray-100 flex items-center justify-center"
          style={{ height: view === "mobile" ? 120 : 160 }}
        >
          <p className="text-xs text-gray-400">
            Fill in hero fields to see preview
          </p>
        </div>
      )}

      {/* ── Body text ── */}
      {values.body && (
        <div className="px-8 py-6">
          <p
            className="leading-relaxed text-gray-600 whitespace-pre-wrap"
            style={{ fontSize: view === "mobile" ? 13 : 15 }}
          >
            {values.body}
          </p>
        </div>
      )}

      {/* ── Product grid ── */}
      {hasProducts && (
        <div className="px-2 pb-2">
          <div className="grid grid-cols-2 gap-1">
            {values.products!.map((p, i) => (
              <div key={i} className="overflow-hidden">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.label}
                    className="w-full object-cover"
                    style={{
                      height: view === "mobile" ? 130 : 180,
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    className="w-full bg-gray-200 flex items-center justify-center"
                    style={{ height: view === "mobile" ? 130 : 180 }}
                  >
                    <span className="text-xs text-gray-400">Image</span>
                  </div>
                )}
                <div
                  className="text-center py-3 px-2"
                  style={{ backgroundColor: "#f0f0f0" }}
                >
                  <p
                    className="font-bold text-gray-900"
                    style={{ fontSize: view === "mobile" ? 11 : 13 }}
                  >
                    {p.label || "Product label"}
                  </p>
                  {p.price && (
                    <p
                      className="text-gray-500 mt-0.5"
                      style={{ fontSize: view === "mobile" ? 10 : 12 }}
                    >
                      {p.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      {values.ctaUrl && (
        <div className="py-8 text-center px-6">
          <span
            className="inline-block text-white font-semibold tracking-widest uppercase cursor-pointer"
            style={{
              backgroundColor: color,
              padding: view === "mobile" ? "10px 28px" : "14px 40px",
              fontSize: view === "mobile" ? 11 : 13,
            }}
          >
            {values.ctaText || "Shop Now"}
          </span>
        </div>
      )}

      {/* ── FAQ ── */}
      {values.faqText && (
        <div className="px-8 py-6 text-center border-t border-gray-100">
          <p
            className="font-bold text-gray-900 mb-1"
            style={{ fontSize: view === "mobile" ? 13 : 15 }}
          >
            Questions?
          </p>
          <p
            className="text-gray-500"
            style={{ fontSize: view === "mobile" ? 11 : 13 }}
          >
            {values.faqText}
          </p>
        </div>
      )}
    </>
  );
}
