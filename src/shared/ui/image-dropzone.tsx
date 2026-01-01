"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null; // base64 dataUrl
  onChange: (dataUrl: string | null, info?: { fileName?: string }) => void;
  disabled?: boolean;
  accept?: { [mime: string]: string[] };
  maxSizeBytes?: number;
  label?: string;
  helperText?: string;
};

export function ImageDropzone({
  value,
  onChange,
  disabled,
  accept = { "image/*": [], "application/pdf": [] },
  maxSizeBytes = 8 * 1024 * 1024,
  label = "Payment evidence",
  helperText = "Upload a receipt screenshot or bank transfer PDF (optional).",
}: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > maxSizeBytes) {
        // you can toast instead if you have one
        alert(
          `File is too large. Max ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB.`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange(base64, { fileName: file.name });
      };
      reader.readAsDataURL(file);
    },
    [maxSizeBytes, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    disabled,
  });

  const isPdf = !!value?.startsWith("data:application/pdf");

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>

      <div
        {...getRootProps()}
        className={cn(
          "border rounded-lg w-full flex flex-col items-center justify-center p-4",
          "border-dashed cursor-pointer hover:border-primary",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        {value ? (
          isPdf ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                PDF attached (click to replace)
              </div>
            </div>
          ) : (
            <Image
              src={value}
              alt="Evidence preview"
              className="rounded-lg object-cover"
              width={220}
              height={220}
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <UploadCloud className="h-5 w-5" />
            <div className="text-sm text-muted-foreground">
              {isDragActive ? (
                <span className="text-primary">Drop the file here…</span>
              ) : (
                <span>Drag & drop or click to upload</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">{helperText}</div>

      {value ? (
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-xs text-destructive hover:underline"
            onClick={() => onChange(null)}
            disabled={disabled}
          >
            Remove evidence
          </button>
        </div>
      ) : null}
    </div>
  );
}
