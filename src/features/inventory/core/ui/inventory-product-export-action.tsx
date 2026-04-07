"use client";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useDownloadFile } from "@/shared/utils/useDownloadFile";
import { useSession } from "next-auth/react";
import { BiExport } from "react-icons/bi";

interface InventoryProductExportActionProps {
  productId: string;
  storeId?: string;
  locationId?: string;
  status?: "active" | "draft" | "archived";
  lowStockOnly?: boolean;
  movementTypes?: string;
  from?: string;
  to?: string;
}

export function InventoryProductExportAction({
  productId,
  storeId,
  locationId,
  status,
  lowStockOnly,
  movementTypes,
  from,
  to,
}: InventoryProductExportActionProps) {
  const { data: session } = useSession();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading } = useDownloadFile(token);

  const buildStockUrl = (format: "csv" | "excel") => {
    const params = new URLSearchParams();

    if (storeId) params.append("storeId", storeId);
    if (locationId) params.append("locationId", locationId);
    if (status) params.append("status", status);
    if (lowStockOnly) params.append("lowStockOnly", "true");
    params.append("format", format);

    return `/api/inventory/reports/products/${productId}/stock-levels?${params.toString()}`;
  };

  const buildMovementsUrl = (format: "csv" | "excel") => {
    const params = new URLSearchParams();

    if (storeId) params.append("storeId", storeId);
    if (locationId) params.append("locationId", locationId);
    if (movementTypes) params.append("types", movementTypes);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    params.append("format", format);

    return `/api/inventory/reports/products/${productId}/movements?${params.toString()}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          isLoading={isLoading}
          disabled={isLoading}
        >
          <BiExport />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => download(buildStockUrl("excel"))}>
          Export stock levels (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download(buildStockUrl("csv"))}>
          Export stock levels (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download(buildMovementsUrl("excel"))}>
          Export movements (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download(buildMovementsUrl("csv"))}>
          Export movements (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
