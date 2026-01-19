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

  // ✅ NEW: client uploads file -> presign PUT -> finalize
  onUpload: (payload: {
    file: File;
    fileName: string;
    mimeType: string;
    // optional metadata
    altText?: string | null;
    folder?: string | null;
    tag?: string | null;
  }) => Promise<void> | void;

  isSubmitting?: boolean;
  defaultFileName?: string;
};

function sanitizeFileName(name: string) {
  return (name || "upload")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120);
}

export function UploadImageModal({
  open,
  onClose,
  title = "Upload image",
  description = "Upload an image to your files library.",
  onUpload,
  isSubmitting = false,
  defaultFileName,
}: UploadImageModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [fileName, setFileName] = useState<string>(defaultFileName ?? "");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");

  const canSubmit = useMemo(() => {
    return Boolean(file && fileName.trim().length >= 3);
  }, [file, fileName]);

  const resetState = useEffectEvent(() => {
    // cleanup blob url
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });

    setFile(null);
    setFileName(defaultFileName ?? "");
    setMimeType("image/jpeg");
  });

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const f = acceptedFiles?.[0];
      if (!f) return;

      setFile(f);
      setMimeType(f.type || "image/jpeg");

      if (!fileName) {
        setFileName(f.name || `upload-${Date.now()}.jpg`);
      }

      const blobUrl = URL.createObjectURL(f);
      setPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return blobUrl;
      });
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

    if (!file) return;

    const finalName = sanitizeFileName(fileName.trim());
    if (!finalName) return;

    await onUpload({
      file,
      fileName: finalName,
      mimeType,
    });

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

        {!canSubmit ? (
          <p className="text-xs text-muted-foreground">
            Select an image and set a file name to upload.
          </p>
        ) : null}
      </div>
    </FormModal>
  );
}
