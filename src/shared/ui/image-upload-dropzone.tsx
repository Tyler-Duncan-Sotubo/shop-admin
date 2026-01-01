"use client";

import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { UploadCloud, User as UserIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import type { ImageUploadValue } from "@/shared/types/image-upload.type";

type ImageUploadDropzoneProps = {
  value?: ImageUploadValue | null;

  /** Existing saved URL (edit mode), used when value is empty */
  existingUrl?: string | null;

  /** Called when user selects or clears */
  onChange: (next: ImageUploadValue | null) => void;

  /** UI */
  title?: string;
  description?: string;
  className?: string;
  previewSize?: number; // px
  disabled?: boolean;

  /** Validation */
  maxSizeMB?: number; // default 5
  accept?: Record<string, string[]>; // default image/*
};

export function ImageUploadDropzone({
  value,
  existingUrl,
  onChange,
  title = "Upload image",
  description = "Drag & drop or click to upload",
  className,
  previewSize = 220,
  disabled,
  maxSizeMB = 5,
  accept = { "image/*": [] },
}: ImageUploadDropzoneProps) {
  const maxSize = maxSizeMB * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles?.[0];
      if (!file) return;

      // basic guards
      if (!file.type.startsWith("image/")) return;
      if (file.size > maxSize) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;

        onChange({
          base64,
          fileName: file.name,
          mimeType: file.type || "image/jpeg",
        });
      };
      reader.readAsDataURL(file);
    },
    [maxSize, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      multiple: false,
      disabled,
      maxSize,
    });

  const errorText = useMemo(() => {
    const rej = fileRejections?.[0];
    if (!rej) return null;

    const code = rej.errors?.[0]?.code;
    if (code === "file-too-large") return `Max file size is ${maxSizeMB}MB.`;
    if (code === "file-invalid-type") return "Only image files are allowed.";
    return rej.errors?.[0]?.message ?? "Invalid file.";
  }, [fileRejections, maxSizeMB]);

  const previewSrc = value?.base64 || existingUrl || null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {previewSrc ? (
          <Button
            type="button"
            variant="clean"
            size="sm"
            onClick={() => onChange(null)}
            disabled={disabled}
          >
            <X className="mr-1 h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "border rounded-lg w-full flex flex-col items-center justify-center p-6",
          "border-dashed cursor-pointer hover:border-primary transition",
          disabled && "opacity-60 cursor-not-allowed",
          isDragActive && "border-primary"
        )}
      >
        <input {...getInputProps()} />

        {previewSrc ? (
          <Image
            src={previewSrc}
            alt="Image preview"
            className="rounded-lg object-cover"
            width={previewSize}
            height={previewSize}
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-lg bg-muted/30">
            <UserIcon className="h-10 w-10 text-muted-foreground" />
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

      {errorText ? (
        <p className="text-xs text-destructive">{errorText}</p>
      ) : null}

      {value?.fileName ? (
        <p className="text-xs text-muted-foreground truncate">
          Selected: <span className="font-medium">{value.fileName}</span>
        </p>
      ) : null}
    </div>
  );
}
