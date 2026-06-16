// features/campaigns/components/template-picker.tsx
"use client";

import { cn } from "@/lib/utils";
import type { TemplateType } from "../types/campaign.types";

type Template = {
  id: TemplateType;
  label: string;
  description: string;
  previewImage: string; // static screenshot of the template
};

export const EMAIL_TEMPLATES: Template[] = [
  {
    id: "newsletter",
    label: "Newsletter",
    description:
      "Hero image with sale banner, product grid, and dark footer with social links.",
    previewImage:
      "https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019bbc22-ee74-7bfa-a6af-0a801a3d2e24/stores/019bbc3e-20be-7f38-85ed-c6867a6c0cfc/media/files/tmp/019ed02e-9728-74ef-adcc-12d7a58d93ae-newsletter.png",
  },
  // add more here when ready:
  // {
  //   id: "new_arrival",
  //   label: "New Arrival",
  //   description: "Single product hero with Shop Now button.",
  //   previewImage: "/images/email-templates/new-arrival-preview.png",
  // },
];

type Props = {
  value: TemplateType | null;
  onChange: (value: TemplateType) => void;
};

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {EMAIL_TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "group rounded-lg border text-left transition-all overflow-hidden",
            "hover:border-primary hover:shadow-md",
            value === t.id
              ? "border-primary ring-2 ring-primary/20"
              : "border-border",
          )}
        >
          {/* ── Template screenshot ── */}
          <div
            className={cn(
              "relative w-full overflow-hidden bg-gray-100",
              "border-b",
              value === t.id ? "border-primary" : "border-border",
            )}
            style={{ height: 220 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.previewImage}
              alt={`${t.label} template preview`}
              className="w-full h-full object-cover object-top
                transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // fallback if image not found
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />

            {/* Fallback placeholder if image missing */}
            <div
              className="absolute inset-0 flex flex-col items-center
                justify-center bg-gray-50 text-gray-300"
            >
              <div className="w-full px-4 space-y-2">
                {/* Simulate email layout */}
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
                <div className="h-20 bg-gray-200 rounded w-full" />
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-14 bg-gray-200 rounded" />
                  <div className="h-14 bg-gray-200 rounded" />
                </div>
                <div className="h-8 bg-gray-300 rounded w-full" />
              </div>
            </div>

            {/* Selected checkmark */}
            {value === t.id && (
              <div
                className="absolute top-2 right-2 h-6 w-6 rounded-full
                  bg-primary flex items-center justify-center shadow"
              >
                <svg
                  className="h-3.5 w-3.5 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* ── Label + description ── */}
          <div className="p-4 space-y-1">
            <p className="text-sm font-semibold text-foreground">{t.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.description}
            </p>
          </div>
        </button>
      ))}

      {/* ── Coming soon placeholder cards ── */}
      {[
        {
          label: "New Arrival",
          description: "Single product hero with Shop Now button.",
        },
        {
          label: "Promotion",
          description: "Bold sale banner with product grid and expiry.",
        },
      ].map((t) => (
        <div
          key={t.label}
          className="rounded-lg border border-dashed border-border overflow-hidden
            opacity-50 cursor-not-allowed"
        >
          <div
            className="w-full bg-gray-50 flex items-center justify-center"
            style={{ height: 220 }}
          >
            <div className="text-center space-y-2 px-4">
              <div className="w-full space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
                <div className="h-20 bg-gray-200 rounded w-full" />
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-14 bg-gray-200 rounded" />
                  <div className="h-14 bg-gray-200 rounded" />
                </div>
                <div className="h-8 bg-gray-300 rounded w-full" />
              </div>
              <span
                className="inline-block mt-2 text-xs font-medium px-2 py-0.5
                  rounded-full bg-muted text-muted-foreground"
              >
                Coming soon
              </span>
            </div>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">
              {t.label}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
