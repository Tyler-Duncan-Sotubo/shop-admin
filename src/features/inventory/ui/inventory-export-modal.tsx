"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BiExport } from "react-icons/bi";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/lib/utils";
import { useDownloadFile } from "@/shared/utils/useDownloadFile";

// ─── Report definitions ───────────────────────────────────────────────────────

type ReportId =
  | "stock-snapshot"
  | "low-stock"
  | "valuation"
  | "dead-stock"
  | "movements"
  | "transfer-summary"
  | "dispatch-summary"
  | "stock-period";

interface ReportDef {
  id: ReportId;
  label: string;
  description: string;
  needsMonth: boolean;
}

const REPORTS: ReportDef[] = [
  {
    id: "stock-period",
    label: "Stock Period (Opening / Closing)",
    description: "Opening and closing stock for a selected month.",
    needsMonth: true,
  },
  {
    id: "stock-snapshot",
    label: "Stock Snapshot",
    description: "Current stock levels across all products and locations.",
    needsMonth: false,
  },
  {
    id: "low-stock",
    label: "Low Stock",
    description: "Items at or below safety stock threshold.",
    needsMonth: false,
  },
  {
    id: "valuation",
    label: "Inventory Valuation",
    description: "Stock value based on current product prices.",
    needsMonth: false,
  },
  {
    id: "dead-stock",
    label: "Dead Stock",
    description: "Items with no movement in the last 30 days.",
    needsMonth: false,
  },
  {
    id: "movements",
    label: "Stock Movements",
    description: "All stock in/out movements for a selected month.",
    needsMonth: true,
  },
  {
    id: "transfer-summary",
    label: "Transfer Summary",
    description: "Inventory transfers between locations.",
    needsMonth: true,
  },
  {
    id: "dispatch-summary",
    label: "Dispatch Summary",
    description: "Order dispatches and items shipped.",
    needsMonth: true,
  },
];

type Format = "excel" | "csv" | "pdf";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthToRange(month: string): { from: string; to: string } {
  const [year, mon] = month.split("-").map(Number);
  const from = new Date(year, mon - 1, 1);
  const to = new Date(year, mon, 0); // last day of month
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function defaultMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function buildUrl(report: ReportId, format: Format, month: string): string {
  const params = new URLSearchParams({ format });
  const def = REPORTS.find((r) => r.id === report)!;
  if (def.needsMonth && month) {
    const { from, to } = monthToRange(month);
    params.append("from", from);
    params.append("to", to);
  }
  return `/api/inventory/reports/${report}?${params.toString()}`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function InventoryExportModal() {
  const { data: session } = useSession();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading } = useDownloadFile(token);

  const [open, setOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportId>("stock-period");
  const [selectedFormat, setSelectedFormat] = useState<Format>("excel");
  const [month, setMonth] = useState(defaultMonth);

  const currentDef = REPORTS.find((r) => r.id === selectedReport)!;

  const handleExport = async () => {
    await download(buildUrl(selectedReport, selectedFormat, month));
    setOpen(false);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <BiExport className="mr-2" />
        Export Reports
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95%] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Inventory Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Report selector — 2-col grid */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Report</p>
              <div className="grid grid-cols-2 gap-2">
                {REPORTS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReport(r.id)}
                    className={cn(
                      "text-left rounded-lg border px-3 py-2.5 transition-colors",
                      selectedReport === r.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="text-sm font-medium leading-tight">{r.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {r.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Month + Format row */}
            <div className="flex gap-4 items-end">
              {/* Month picker — only for date-range reports */}
              <div className={cn("space-y-1.5 flex-1", !currentDef.needsMonth && "invisible")}>
                <p className="text-sm font-medium text-foreground">Month</p>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Format selector */}
              <div className="space-y-1.5 flex-1">
                <p className="text-sm font-medium text-foreground">Format</p>
                <div className="flex gap-1.5">
                  {(["excel", "csv", "pdf"] as Format[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFormat(f)}
                      className={cn(
                        "flex-1 rounded-md border py-2 text-sm font-medium transition-colors uppercase",
                        selectedFormat === f
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} isLoading={isLoading} disabled={isLoading}>
              <BiExport className="mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
