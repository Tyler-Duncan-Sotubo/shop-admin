// features/campaigns/builder/components/campaign-preview.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CampaignBuilderValues } from "../schema/campaign.schema";
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

type Props = {
  values: Partial<CampaignBuilderValues>;
  fromName: string;
  logoUrl?: string | null;
  brandColor?: string | null;
};

export function CampaignPreview({
  values,
  fromName,
  logoUrl,
  brandColor,
}: Props) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const color = brandColor ?? "#111111";
  const blocks = values.blocks ?? [];

  // Pair up half blocks for rendering
  const renderBlocks = () => {
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < blocks.length) {
      const block = blocks[i];

      if (block.width === "full") {
        elements.push(
          <div key={block.id ?? `block-${i}`} className="w-full">
            {block.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.imageUrl}
                alt=""
                className="w-full block"
                style={{ display: "block" }}
              />
            ) : (
              <div
                className="w-full bg-gray-100 flex items-center justify-center"
                style={{ height: 120 }}
              >
                <span className="text-xs text-gray-400">Full width image</span>
              </div>
            )}
          </div>,
        );
        i++;
      } else {
        const next = blocks[i + 1]?.width === "half" ? blocks[i + 1] : null;

        elements.push(
          <div key={block.id ?? `block-${i}`} className="flex w-full">
            <div className="w-1/2">
              {block.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={block.imageUrl}
                  alt=""
                  className="w-full block"
                  style={{ display: "block" }}
                />
              ) : (
                <div
                  className="w-full bg-gray-100 flex items-center justify-center"
                  style={{ height: 100 }}
                >
                  <span className="text-xs text-gray-400">Half image</span>
                </div>
              )}
            </div>
            <div className="w-1/2">
              {next ? (
                next.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={next.imageUrl}
                    alt=""
                    className="w-full block"
                    style={{ display: "block" }}
                  />
                ) : (
                  <div
                    className="w-full bg-gray-100 flex items-center justify-center"
                    style={{ height: 100 }}
                  >
                    <span className="text-xs text-gray-400">Half image</span>
                  </div>
                )
              ) : (
                <div className="w-full bg-gray-50" style={{ height: 100 }} />
              )}
            </div>
          </div>,
        );
        i += next ? 2 : 1;
      }
    }

    return elements;
  };

  return (
    <div className="space-y-3">
      {/* ── Toggle ── */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={view === "desktop" ? "default" : "outline"}
          onClick={() => setView("desktop")}
        >
          <Monitor className="h-4 w-4 mr-1.5" />
          Desktop
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "mobile" ? "default" : "outline"}
          onClick={() => setView("mobile")}
        >
          <Smartphone className="h-4 w-4 mr-1.5" />
          Mobile
        </Button>
      </div>

      {/* ── Email shell ── */}
      <div className="flex justify-center overflow-auto">
        <div
          className={cn(
            "border rounded-lg overflow-hidden bg-white transition-all shadow-sm",
            view === "desktop" ? "w-full max-w-[600px]" : "w-[375px]",
          )}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          {/* ── Logo header ── */}
          <div
            className="py-5 px-6 text-center"
            style={{ backgroundColor: color }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={fromName}
                className="h-8 mx-auto object-contain"
              />
            ) : (
              <span className="font-bold text-sm text-white">{fromName}</span>
            )}
          </div>

          {/* ── Blocks ── */}
          {blocks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-gray-400">
                Add image blocks to see a preview
              </p>
            </div>
          ) : (
            <div className="w-full">{renderBlocks()}</div>
          )}

          {/* ── Footer ── */}
          <div
            className="px-6 py-6 text-center space-y-2"
            style={{ backgroundColor: "#111111" }}
          >
            <div className="flex justify-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#333333" }}
              >
                <FaTwitter size={14} color="#888888" />
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#333333" }}
              >
                <FaFacebook size={14} color="#888888" />
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#333333" }}
              >
                <FaInstagram size={14} color="#888888" />
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#333333" }}
              >
                <FaYoutube size={14} color="#888888" />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#999999" }}>{fromName}</p>
            <p style={{ fontSize: 11, color: "#777777" }}>
              © {new Date().getFullYear()} | All rights reserved.
            </p>
            <p style={{ fontSize: 11, color: "#777777" }}>
              No longer want to receive these emails?{" "}
              <span className="underline" style={{ color: "#aaaaaa" }}>
                Unsubscribe
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
