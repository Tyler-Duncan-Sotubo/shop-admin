"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  FormEvent,
  useEffectEvent,
} from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ImageIcon } from "lucide-react";

import { FormModal } from "@/shared/ui/form-modal";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/lib/utils";

type UploadImageModalProps = {
  open: boolean;
  onClose: () => void;

  title?: string;
  description?: string;

  // Called with base64 + fileName + mimeType
  onUpload: (payload: {
    base64: string;
    fileName: string;
    mimeType: string;
  }) => Promise<void> | void;

  isSubmitting?: boolean;

  /**
   * Optional:
   * - if you want to prefill or enforce a folder/tag later
   */
  defaultFileName?: string;
};

export function UploadImageModal({
  open,
  onClose,
  title = "Upload image",
  description = "Upload an image to your files library.",
  onUpload,
  isSubmitting = false,
  defaultFileName,
}: UploadImageModalProps) {
  const [base64, setBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [fileName, setFileName] = useState<string>(defaultFileName ?? "");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");

  const canSubmit = useMemo(() => {
    return Boolean(base64 && fileName.trim().length >= 3);
  }, [base64, fileName]);

  // Reset state when modal is closed
  const resetState = useEffectEvent(() => {
    setBase64(null);
    setPreview(null);
    setFileName(defaultFileName ?? "");
    setMimeType("image/jpeg");
  });

  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles?.[0];
      if (!file) return;

      setMimeType(file.type || "image/jpeg");

      // prefill name if empty
      if (!fileName) {
        setFileName(file.name || `upload-${Date.now()}.jpg`);
      }

      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setBase64(b64);
        setPreview(b64);
      };
      reader.readAsDataURL(file);
    },
    [fileName]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!base64) return;
    const finalName = fileName.trim();
    if (!finalName) return;

    await onUpload({
      base64,
      fileName: finalName,
      mimeType,
    });

    // close after successful upload (caller can also control)
    onClose();
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Upload"
    >
      <div className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border rounded-xl w-full flex flex-col items-center justify-center p-6",
            "border-dashed cursor-pointer hover:border-primary transition-colors",
            isDragActive && "border-primary"
          )}
        >
          <input {...getInputProps()} />

          {preview ? (
            <div className="relative h-44 w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-44 w-full items-center justify-center rounded-lg bg-muted/30">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isDragActive ? (
              <p className="text-primary">Drop the file here…</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-5 w-5" />
                <p>Drag & drop or click to upload</p>
              </div>
            )}
          </div>
        </div>

        {/* File name */}
        <div className="space-y-2">
          <Label>File name</Label>
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g. homepage-hero.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Tip: keep it descriptive. Extension is recommended.
          </p>
        </div>

        {/* Small validation hint (optional) */}
        {!canSubmit ? (
          <p className="text-xs text-muted-foreground">
            Select an image and set a file name to upload.
          </p>
        ) : null}
      </div>
    </FormModal>
  );
}
