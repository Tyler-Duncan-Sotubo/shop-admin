/* eslint-disable @typescript-eslint/no-explicit-any */
// features/customers/components/customer-bulk-upload-modal.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Trash, Download, AlertCircle, Check } from "lucide-react";
import Modal from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

// ─── Target fields your API expects ───────────────────────────────────────────

const TARGET_FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "company", label: "Company" },
  { key: "note", label: "Note" },
  { key: "marketingOptIn", label: "Marketing Opt-in" },
] as const;

type TargetKey = (typeof TARGET_FIELDS)[number]["key"];

// ─── Shopify auto-map ─────────────────────────────────────────────────────────

const SHOPIFY_COLUMN_MAP: Record<string, TargetKey> = {
  "First Name": "firstName",
  "Last Name": "lastName",
  Email: "email",
  Phone: "phone",
  "Default Address Phone": "phone",
  "Default Address Address1": "address",
  "Default Address Company": "company",
  Note: "note",
  "Accepts Email Marketing": "marketingOptIn",
};

function isShopifyExport(headers: string[]) {
  return (
    headers.includes("Customer ID") &&
    headers.includes("Accepts Email Marketing")
  );
}

function buildAutoMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  if (isShopifyExport(headers)) {
    for (const h of headers) {
      if (SHOPIFY_COLUMN_MAP[h]) mapping[h] = SHOPIFY_COLUMN_MAP[h];
    }
    return mapping;
  }

  // Generic fuzzy match for non-Shopify files
  for (const h of headers) {
    const norm = h.toLowerCase().replace(/[\s_-]/g, "");
    const match = TARGET_FIELDS.find((f) => f.key.toLowerCase() === norm);
    if (match) mapping[h] = match.key;
  }

  return mapping;
}

// ─── File parser ──────────────────────────────────────────────────────────────

async function parseFile(file: File): Promise<{
  headers: string[];
  rows: Record<string, string>[];
}> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  if (!raw.length) return { headers: [], rows: [] };

  // Strip Shopify's leading apostrophes e.g. '22549742453028 → 22549742453028
  const cleaned = raw.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [
        k,
        typeof v === "string" ? v.replace(/^'/, "").trim() : v,
      ]),
    ),
  );

  return { headers: Object.keys(cleaned[0]), rows: cleaned };
}

// ─── Row transformer ──────────────────────────────────────────────────────────

function transformRows(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
): Record<string, string>[] {
  return rows.map((row) => {
    const out: Record<string, string> = {};

    for (const [csvCol, targetField] of Object.entries(mapping)) {
      if (!targetField) continue;
      const val = row[csvCol]?.trim() ?? "";
      // Don't overwrite already-set fields (handles phone fallback columns)
      if (out[targetField] && !val) continue;
      if (val) out[targetField] = val;
    }

    // Normalise marketingOptIn: "yes" → "true"
    if (out.marketingOptIn !== undefined) {
      out.marketingOptIn =
        out.marketingOptIn.toLowerCase() === "yes" ? "true" : "false";
    }

    return out;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const UNSET = "__none__";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  endpoint: string;
  onSuccess?: () => void;
}

type Step = "upload" | "mapping";

export function CustomerBulkUploadModal({
  isOpen,
  onClose,
  endpoint,
  onSuccess,
}: Props) {
  const axios = useAxiosAuth();

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setError(null);
    setFile(f);

    try {
      const { headers, rows } = await parseFile(f);
      if (!headers.length) {
        setError("File appears to be empty or unreadable.");
        return;
      }
      setHeaders(headers);
      setRows(rows);
      setMapping(buildAutoMapping(headers));
      setStep("mapping");
    } catch {
      setError("Failed to parse file. Make sure it's a valid CSV or XLSX.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const transformed = transformRows(rows, mapping);

      // Convert transformed rows back to a CSV blob and send as FormData
      const ws = XLSX.utils.json_to_sheet(transformed);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const csvOutput = XLSX.utils.sheet_to_csv(ws);

      const blob = new Blob([csvOutput], { type: "text/csv" });
      const formData = new FormData();
      formData.append("file", blob, "customers.csv");

      await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Customers imported successfully");
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
          err?.response?.data?.message ??
          "Upload failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const mappedCount = Object.values(mapping).filter(Boolean).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Customers"
      confirmText={step === "mapping" ? "Upload" : undefined}
      onConfirm={step === "mapping" ? handleUpload : undefined}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {/* Step 1 — Drop file */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-12 flex flex-col items-center
                justify-center cursor-pointer transition-all text-center
                ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }
              `}
            >
              <input {...getInputProps()} />
              <UploadCloud size={40} className="text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {isDragActive
                  ? "Drop your file here"
                  : "Drag & drop or click to select"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                CSV or XLSX — including Shopify exports
              </p>
            </div>

            <Link
              href="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585682/department_ee9hgy.xlsx"
              download
            >
              <Button variant="outline" size="sm" className="w-full">
                <Download size={14} className="mr-2" />
                Download example template
              </Button>
            </Link>
          </div>
        )}

        {/* Step 2 — Map columns */}
        {step === "mapping" && (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 text-sm">
                <Check size={15} className="text-green-500 shrink-0" />
                <span className="font-medium truncate max-w-[200px]">
                  {file?.name}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{rows.length} rows</span>
                {isShopifyExport(headers) && (
                  <Badge variant="outline" className="text-[10px] ml-1">
                    Shopify detected
                  </Badge>
                )}
              </div>
              <button
                onClick={reset}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Trash size={14} />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Map your columns to the correct fields</span>
              <Badge variant="outline" className="text-[11px]">
                {mappedCount} / {TARGET_FIELDS.length} mapped
              </Badge>
            </div>

            {/* Mapping table */}
            <div className="divide-y border rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 gap-4 px-4 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Field
                </span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  CSV column
                </span>
              </div>

              {TARGET_FIELDS.map((field) => {
                const currentCsvCol =
                  Object.entries(mapping).find(
                    ([, target]) => target === field.key,
                  )?.[0] ?? UNSET;

                return (
                  <div
                    key={field.key}
                    className="grid grid-cols-2 gap-4 px-4 py-2.5 items-center"
                  >
                    <span className="text-sm text-gray-700">{field.label}</span>

                    <Select
                      value={currentCsvCol}
                      onValueChange={(val) => {
                        setMapping((prev) => {
                          const next = { ...prev };
                          // Remove any existing mapping to this target
                          for (const [col, target] of Object.entries(next)) {
                            if (target === field.key) delete next[col];
                          }
                          if (val !== UNSET) next[val] = field.key;
                          return next;
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Not mapped" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNSET}>
                          <span className="text-gray-400">Not mapped</span>
                        </SelectItem>
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
