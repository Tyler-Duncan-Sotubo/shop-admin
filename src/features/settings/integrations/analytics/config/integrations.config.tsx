import { MdBarChart } from "react-icons/md";
import { FaFacebook } from "react-icons/fa";
import { IntegrationCardConfig } from "../types/analytics.types";

export const INTEGRATIONS: readonly IntegrationCardConfig[] = [
  {
    provider: "ga4",
    title: "Google Analytics 4 (GA4)",
    description:
      "Track page views and ecommerce events with GA4 Measurement ID.",
    icon: <MdBarChart />,
    brandColor: "#F9AB00",
    docsLabel: "Needs: Measurement ID (G-XXXXXXXXXX)",
    fields: [
      {
        key: "measurementId",
        label: "Measurement ID",
        placeholder: "G-XXXXXXXXXX",
        required: true,
        type: "text",
        help: "Found in GA4 → Admin → Data streams → Web → Measurement ID.",
        patternHint: "Starts with G-",
      },
      {
        key: "requiresConsent",
        label: "Require cookie consent",
        type: "switch",
        help: "If enabled, your storefront should only load GA4 after consent.",
      },
    ],
    toPublicConfig: (v) => ({
      measurementId: String(v.measurementId ?? "").trim(),
    }),
    fromPublicConfig: (c) => ({
      measurementId: c?.measurementId ?? "",
    }),
  },

  {
    provider: "meta_pixel",
    title: "Meta Pixel (Facebook)",
    description: "Track conversions and retargeting with Meta Pixel ID.",
    brandColor: "#1877F2",
    icon: <FaFacebook />,
    docsLabel: "Needs: Pixel ID (numbers)",
    fields: [
      {
        key: "pixelId",
        label: "Pixel ID",
        placeholder: "123456789012345",
        required: true,
        type: "text",
        help: "Found in Meta Events Manager → Data Sources → Pixel ID.",
        patternHint: "Numbers only",
      },
      {
        key: "requiresConsent",
        label: "Require cookie consent",
        type: "switch",
        help: "If enabled, your storefront should only load Pixel after consent.",
      },
    ],
    toPublicConfig: (v) => ({
      pixelId: String(v.pixelId ?? "").trim(),
    }),
    fromPublicConfig: (c) => ({
      pixelId: c?.pixelId ?? "",
    }),
  },
] as const;
