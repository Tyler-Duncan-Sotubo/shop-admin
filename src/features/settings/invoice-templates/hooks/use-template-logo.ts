/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/use-template-logo.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";

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

function sanitizeFileName(name: string) {
  return (name || "upload")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120);
}

type UpdateInvoiceLogoPayload = {
  storeId?: string;
  storageKey: string;
  url?: string;
  altText?: string;
};

type SubmitArgs = {
  altText?: string;
  storeId?: string | null;
  setError?: (msg: string) => void;
  onDone?: () => void;
};

export function useInvoiceTemplateLogoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const hasSelection = useMemo(() => !!file, [file]);

  // ✅ calls your Nest endpoint (now expects storageKey/url)
  const updateLogo = useCreateMutation<UpdateInvoiceLogoPayload>({
    endpoint: "/api/invoice-templates/branding/logo",
    successMessage: "Logo updated",
    refetchKey: [
      "invoiceTemplateBranding",
      "billing",
      "invoiceTemplates",
      "branding",
    ],
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles?.[0];
    if (!f) return;

    setFile(f);

    const blobUrl = URL.createObjectURL(f);
    setPreviewSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return blobUrl;
    });
  }, []);

  const clear = useCallback(() => {
    setFile(null);
    setPreviewSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
  }, []);

  const submit = useCallback(
    async ({ altText, storeId, setError, onDone }: SubmitArgs) => {
      setError?.("");

      if (!storeId) {
        setError?.("Please select a store first.");
        return;
      }
      if (!file) {
        setError?.("Please select an image first.");
        return;
      }

      setIsUploading(true);
      try {
        const mimeType = file.type || "image/png";
        const finalName = sanitizeFileName(
          file.name || `invoice-logo-${Date.now()}.png`,
        );

        // 1) presign (Next.js -> NestJS)
        const presign = await axios.post<PresignResp>(
          "/api/uploads/media-presign",
          {
            storeId,
            folder: "invoice-template",
            files: [{ fileName: finalName, mimeType }],
          },
        );

        const first = presign.data.uploads?.[0];
        if (!first) throw new Error("No presigned upload returned");

        // 2) PUT to S3 (direct from browser)
        await putToS3(first.uploadUrl, file);

        // 3) finalize (optional but recommended, creates media row)
        await axios.post("/api/uploads/finalize", {
          storeId,
          key: first.key,
          url: first.url,
          fileName: finalName,
          mimeType,
          folder: "invoice-template",
          tag: "invoice-template-logo",
          altText: altText?.trim() ? altText.trim() : null,
        });

        // 4) set invoice branding logo (server saves logoUrl + logoStorageKey)
        const payload: UpdateInvoiceLogoPayload = {
          storeId,
          storageKey: first.key,
          url: first.url,
          ...(altText?.trim() ? { altText: altText.trim() } : {}),
        };

        const res = await updateLogo(payload, (msg) => setError?.(msg));

        if (res) {
          onDone?.();
          clear();
        }

        return res;
      } catch (err: any) {
        setError?.(
          err?.response?.data?.message ?? err?.message ?? "Upload failed",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [clear, file, updateLogo],
  );

  return {
    previewSrc,
    hasSelection,
    isUploading,
    onDrop,
    submit,
    clear,
  };
}
