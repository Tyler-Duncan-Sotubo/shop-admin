// features/campaigns/builder/components/campaign-image-upload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { ImageIcon, X } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { UploadImageModal } from "@/features/content/files/ui/upload-image-modal";

type PresignResp = {
  uploads: Array<{ key: string; uploadUrl: string; url: string }>;
};

async function putToS3(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`S3 upload failed (${res.status}) ${text}`);
  }
}

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  aspectRatio?: "hero" | "square";
};

export function CampaignImageUpload({
  value,
  onChange,
  label = "Upload image",
  aspectRatio = "hero",
}: Props) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { activeStoreId } = useStoreScope();

  const handleUpload = async ({
    file,
    fileName,
    mimeType,
  }: {
    file: File;
    fileName: string;
    mimeType: string;
  }) => {
    setIsUploading(true);
    try {
      // 1) presign
      const presign = await axios.post<PresignResp>(
        "/api/uploads/media-presign",
        {
          storeId: activeStoreId,
          folder: "campaigns",
          files: [{ fileName, mimeType }],
        },
      );

      const first = presign.data.uploads?.[0];
      if (!first) throw new Error("No presigned upload returned");

      // 2) PUT direct to S3
      await putToS3(first.uploadUrl, file);

      // 3) finalize
      await axios.post("/api/uploads/finalize", {
        storeId: activeStoreId,
        key: first.key,
        url: first.url,
        fileName,
        mimeType,
        folder: "campaigns",
        tag: "campaign-image",
      });

      // 4) set the URL in the form
      onChange(first.url);
      setOpen(false);
    } catch (err) {
      console.error("Upload failed", err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {/* ── Preview ── */}
        {value ? (
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-lg border bg-muted/30",
              aspectRatio === "hero" ? "h-40" : "h-28",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 h-6 w-6 rounded-full
                bg-background/80 flex items-center justify-center
                hover:bg-background shadow"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "w-full rounded-lg border border-dashed flex flex-col",
              "items-center justify-center gap-2 text-muted-foreground",
              "hover:border-primary hover:text-primary transition-colors",
              aspectRatio === "hero" ? "h-40" : "h-28",
            )}
          >
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">{label}</span>
          </button>
        )}

        {/* ── Action button ── */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading
            ? "Uploading..."
            : value
              ? "Replace image"
              : "Upload image"}
        </Button>
      </div>

      <UploadImageModal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload image"
        description="Upload an image for your campaign."
        onUpload={handleUpload}
        isSubmitting={isUploading}
      />
    </>
  );
}
