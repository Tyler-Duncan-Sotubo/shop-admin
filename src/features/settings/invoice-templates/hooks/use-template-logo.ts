"use client";

import { useCallback, useState } from "react";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";

type UpdateInvoiceLogoPayload = {
  base64Image: string;
  altText?: string;
  storeId?: string;
};

type SubmitArgs = {
  altText?: string;
  storeId?: string | null;
  setError?: (msg: string) => void;
  onDone?: () => void;
};

/**
 * ✅ Uses your useCreateMutation (axios + bearer token + toasts + invalidate queries)
 * ✅ Sends exactly: { base64Image, altText?, storeId? }
 * ✅ Endpoint: /api/invoice-templates/branding/logo
 */
export function useInvoiceTemplateLogoUpload() {
  const [base64Image, setBase64Image] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const createLogo = useCreateMutation<UpdateInvoiceLogoPayload>({
    endpoint: "/api/invoice-templates/branding/logo",
    successMessage: "Logo updated",
    refetchKey: [
      "invoiceTemplateBranding",
      "billing",
      "invoiceTemplates",
      "branding",
    ], // change to your query key if needed
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setBase64Image(reader.result as string); // data:image/...base64,...
    reader.readAsDataURL(file);
  }, []);

  const clear = useCallback(() => setBase64Image(""), []);

  const submit = useCallback(
    async ({ altText, storeId, setError, onDone }: SubmitArgs) => {
      setError?.("");

      if (!base64Image) {
        setError?.("Please select an image first.");
        return;
      }

      setIsUploading(true);
      try {
        const payload: UpdateInvoiceLogoPayload = {
          base64Image,
          ...(altText?.trim() ? { altText: altText.trim() } : {}),
          ...(storeId ? { storeId } : {}),
        };

        const res = await createLogo(payload, (msg) => setError?.(msg));

        // if createLogo fails it returns undefined (your hook swallows errors)
        if (res) onDone?.();

        return res;
      } finally {
        setIsUploading(false);
      }
    },
    [base64Image, createLogo]
  );

  return {
    // preview for next/image or <img />
    previewSrc: base64Image,
    base64Image,

    isUploading,
    onDrop,
    submit,
    clear,
  };
}
