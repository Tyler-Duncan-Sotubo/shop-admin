"use client";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { BiExport } from "react-icons/bi";
import { useDownloadFile } from "@/shared/utils/useDownloadFile";
import { useSession } from "next-auth/react";

interface InventoryOverviewExportMenuProps {
  storeId?: string;
  locationId?: string;
  status?: "active" | "draft" | "archived";
  lowStockOnly?: boolean;
}

export function InventoryOverviewExportMenu({
  storeId,
  locationId,
  status,
  lowStockOnly,
}: InventoryOverviewExportMenuProps) {
  const { data: session } = useSession();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading: isDownloading } = useDownloadFile(token);

  const buildUrl = (
    report: "stock-levels" | "low-stock",
    format: "csv" | "excel",
  ) => {
    const params = new URLSearchParams();

    if (storeId) params.append("storeId", storeId);

    if (report === "stock-levels") {
      if (locationId) params.append("locationId", locationId);
      if (status) params.append("status", status);
      if (lowStockOnly) params.append("lowStockOnly", "true");
    }

    params.append("format", format);

    return `/api/inventory/reports/${report}?${params.toString()}`;
  };

  const handleExport = async (
    report: "stock-levels" | "low-stock",
    format: "csv" | "excel",
  ) => {
    await download(buildUrl(report, format));
  };

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

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("stock-levels", "excel")}>
          Stock Levels (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("stock-levels", "csv")}>
          Stock Levels (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("low-stock", "excel")}>
          Low Stock Summary (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("low-stock", "csv")}>
          Low Stock Summary (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
