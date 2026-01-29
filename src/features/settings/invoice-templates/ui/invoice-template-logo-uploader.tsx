// components/InvoiceTemplateLogoUploader.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { UploadCloud, X, Save } from "lucide-react";
import { useInvoiceTemplateLogoUpload } from "../hooks/use-template-logo";
import { Button } from "@/shared/ui/button";

type Props = {
  initialLogoUrl?: string;
  storeId?: string | null;
};

export default function InvoiceTemplateLogoUploader({
  initialLogoUrl,
  storeId,
}: Props) {
  const [altText, setAltText] = useState("Invoice logo");
  const [error, setError] = useState<string | null>(null);

  const {
    previewSrc: pickedPreview,
    hasSelection,
    isUploading,
    onDrop,
    submit,
    clear,
  } = useInvoiceTemplateLogoUpload();

  const previewSrc = useMemo(() => {
    if (pickedPreview) return pickedPreview;
    return initialLogoUrl ?? "";
  }, [pickedPreview, initialLogoUrl]);

  const handleSubmit = useCallback(async () => {
    setError(null);

    await submit({
      altText,
      storeId,
      setError: (msg) => setError(msg || null),
      onDone: () => {
        clear();
      },
    });
  }, [altText, clear, storeId, submit]);

  const clearSelected = useCallback(() => {
    setError(null);
    clear();
  }, [clear]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <section className="w-full max-w-xl space-y-4 mt-10">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Invoice template logo</h2>
      </div>

      <div
        {...getRootProps()}
        className={[
          "rounded-lg border border-dashed p-6",
          "flex flex-col items-center justify-center gap-3",
          isUploading
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-primary",
        ].join(" ")}
      >
        <input {...getInputProps()} />

        {previewSrc ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-md border bg-muted">
              <Image
                src={previewSrc}
                alt={altText || "Invoice logo preview"}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {hasSelection ? "New image selected" : "Current logo"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <UploadCloud className="h-6 w-6" />
            {isDragActive ? (
              <p className="text-sm">Drop the image here…</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Alt text (optional)</label>
        <input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="e.g. Company logo"
          disabled={isUploading}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="default"
          onClick={handleSubmit}
          disabled={isUploading || !hasSelection}
        >
          <Save className="h-4 w-4" />
          {isUploading ? "Saving…" : "Save logo"}
        </Button>

        <Button
          type="button"
          variant="clean"
          onClick={clearSelected}
          disabled={isUploading || !hasSelection}
          className={[
            "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
            isUploading || !hasSelection
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-muted",
          ].join(" ")}
        >
          <X className="h-4 w-4" />
          Clear selection
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
