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

interface ExportMenuProps {
  exportPath: string; // the base API path for your report, e.g. "/api/expenses/reimbursement-report/export"
  query?: Record<string, string | undefined>; // any filters you want to pass
  allowedFormats?: ("csv" | "excel" | "pdf")[]; // formats you want to allow, defaults to all
}
export const ExportMenu = ({
  exportPath,
  query,
  allowedFormats = ["csv", "excel", "pdf"],
}: ExportMenuProps) => {
  const { data: session } = useSession();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading: isDownloading } = useDownloadFile(token);

  const buildUrl = (format: "csv" | "excel" | "pdf") => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    params.append("format", format);
    return `${exportPath}?${params.toString()}`;
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const url = buildUrl(format);
    await download(url);
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
      <DropdownMenuContent>
        {allowedFormats && allowedFormats.includes("excel") && (
          <DropdownMenuItem onClick={() => handleExport("excel")}>
            Export as Excel
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
