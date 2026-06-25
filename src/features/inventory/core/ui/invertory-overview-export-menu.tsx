"use client";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { BiExport } from "react-icons/bi";
import { useDownloadFile } from "@/shared/utils/useDownloadFile";
import { useSession } from "next-auth/react";

interface InventoryOverviewExportMenuProps {
  locationId?: string;
}

type ReportKey =
  | "stock-snapshot"
  | "low-stock"
  | "valuation"
  | "dead-stock"
  | "movements"
  | "transfer-summary"
  | "dispatch-summary";

type Format = "csv" | "excel" | "pdf";

export function InventoryOverviewExportMenu({
  locationId,
}: InventoryOverviewExportMenuProps) {
  const { data: session } = useSession();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading: isDownloading } = useDownloadFile(token);

  const buildUrl = (report: ReportKey, format: Format) => {
    const params = new URLSearchParams();
    if (locationId) params.append("locationId", locationId);
    params.append("format", format);
    return `/api/inventory/reports/${report}?${params.toString()}`;
  };

  const go = (report: ReportKey, format: Format) =>
    download(buildUrl(report, format));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          isLoading={isDownloading}
          disabled={isDownloading}
        >
          <BiExport className="mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Stock Reports</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => go("stock-snapshot", "excel")}>
          Stock Snapshot (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("stock-snapshot", "csv")}>
          Stock Snapshot (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("stock-snapshot", "pdf")}>
          Stock Snapshot (PDF)
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Alerts</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => go("low-stock", "excel")}>
          Low Stock (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("low-stock", "csv")}>
          Low Stock (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("low-stock", "pdf")}>
          Low Stock (PDF)
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Valuation &amp; Ageing</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => go("valuation", "excel")}>
          Inventory Valuation (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("valuation", "csv")}>
          Inventory Valuation (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("valuation", "pdf")}>
          Inventory Valuation (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("dead-stock", "excel")}>
          Dead Stock (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("dead-stock", "csv")}>
          Dead Stock (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("dead-stock", "pdf")}>
          Dead Stock (PDF)
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Activity</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => go("movements", "excel")}>
          Stock Movements (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("movements", "csv")}>
          Stock Movements (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("movements", "pdf")}>
          Stock Movements (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("transfer-summary", "excel")}>
          Transfer Summary (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("transfer-summary", "csv")}>
          Transfer Summary (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("transfer-summary", "pdf")}>
          Transfer Summary (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("dispatch-summary", "excel")}>
          Dispatch Summary (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("dispatch-summary", "csv")}>
          Dispatch Summary (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("dispatch-summary", "pdf")}>
          Dispatch Summary (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
