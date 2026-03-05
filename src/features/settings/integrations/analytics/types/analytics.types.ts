/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";

export type AnalyticsProvider = "ga4" | "meta_pixel" | "gtm";

export type IntegrationField =
  | {
      key: string; // form key
      label: string;
      placeholder?: string;
      help?: string;
      required?: boolean;
      type: "text";
      // (optional) quick validation hint
      patternHint?: string;
    }
  | {
      key: string;
      label: string;
      help?: string;
      type: "switch";
    };

export type IntegrationCardConfig = {
  provider: AnalyticsProvider;
  title: string;
  description: string;
  icon: ReactNode;
  brandColor?: string;
  docsLabel?: string; // UI only (no link required)
  // fields shown when enabled
  fields: IntegrationField[];
  // map form values -> API publicConfig
  toPublicConfig: (values: Record<string, any>) => Record<string, any>;
  // map API publicConfig -> form values
  fromPublicConfig: (
    publicConfig: Record<string, any> | null | undefined
  ) => Record<string, any>;
};

export type IntegrationRow = {
  id: string;
  provider: AnalyticsProvider;
  enabled: boolean;
  requiresConsent: boolean;
  publicConfig: Record<string, any> | null;
};
