"use client";

import { Panel, Row } from "../helpers/helpers";
import { ResolvedStorefrontConfig } from "../types/storefront-config.types";

export function AdvancedEditor({
  resolved,
}: {
  resolved: ResolvedStorefrontConfig;
}) {
  return (
    <Panel
      title="Advanced"
      description="Power settings. Only change these if you know what they do."
      tone="warning"
    >
      <div className="rounded-lg border p-3 text-sm space-y-2">
        <Row
          label="Quick view"
          value={resolved?.ui?.quickView?.enabled ? "On" : "Off"}
        />
        <Row
          label="Product card style"
          value={resolved?.ui?.product?.productCardVariant ?? "—"}
        />
        <Row
          label="Gallery style"
          value={resolved?.ui?.product?.galleryVariant ?? "—"}
        />
        <Row
          label="Recommendations"
          value={resolved?.ui?.product?.recommendations?.variant ?? "—"}
        />
      </div>
    </Panel>
  );
}
