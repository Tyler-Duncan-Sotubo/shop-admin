/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ImageIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/lib/utils";

import { useUploadSetupLogo } from "@/features/setup/hooks/use-setup";

type ThemeOption = {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
};

export function SetupStep2Brand({
  storeId,
  onFinish,
}: {
  storeId: string;
  onFinish: (args: { themeId: string | null; logoUploaded: boolean }) => void;
}) {
  const uploadLogo = useUploadSetupLogo(storeId);

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(
    "theme-v1"
  ); // default
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // base64 preview
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/png");
  const [logoUploaded, setLogoUploaded] = useState(false);

  const themes = useMemo<ThemeOption[]>(
    () => [
      {
        id: "theme-v1",
        name: "Classic",
        imageUrl: "https://placehold.co/640x420/png?text=Theme+Classic",
        description: "Clean layout for most stores",
      },
      {
        id: "theme-v2",
        name: "Modern",
        imageUrl: "https://placehold.co/640x420/png?text=Theme+Modern",
        description: "Bold typography + big hero",
      },
      {
        id: "theme-v3",
        name: "Minimal",
        imageUrl: "https://placehold.co/640x420/png?text=Theme+Minimal",
        description: "Simple, product-first design",
      },
    ],
    []
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (!file) return;

    setSubmitError(null);

    setImageMimeType(file.type || "image/png");
    setImageFileName(file.name || `logo-${Date.now()}.png`);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string; // includes data:mime;base64,...
      setUploadedImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const hasLogo = !!uploadedImage;

  const handleUploadLogo = async () => {
    if (!uploadedImage) return;

    setSubmitError(null);

    const payload = {
      base64: uploadedImage,
      fileName: imageFileName || `logo-${Date.now()}.png`,
      mimeType: imageMimeType || "image/png",
      themeId: selectedThemeId || undefined,
    };

    try {
      setIsUploading(true);
      await uploadLogo(payload, (msg: string) => setSubmitError(msg));
      setLogoUploaded(true);
    } catch (e: any) {
      setLogoUploaded(false);
      setSubmitError(e?.message ?? "Logo upload failed");
      throw e; // ✅ important so Continue can stop
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = async () => {
    setSubmitError(null);

    try {
      // If user selected a logo but hasn’t uploaded yet, upload now
      if (uploadedImage && !logoUploaded) {
        await handleUploadLogo();
      }

      // ✅ only call onFinish after success
      // onFinish({ themeId: selectedThemeId, logoUploaded: !!uploadedImage });
    } catch {
      // error already set in handleUploadLogo
    }
  };

  return (
    <div>
      <div className="p-6 space-y-2 mt-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Brand & theme</div>
            <div className="text-sm text-muted-foreground">
              Upload your logo (optional) and pick a theme.
            </div>
          </div>
          <Badge variant="secondary">Step 2</Badge>
        </div>
      </div>

      <Separator />

      <div className="p-6 space-y-8">
        {/* Theme picker */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Choose a theme</div>
              <div className="text-xs text-muted-foreground">
                Click a theme to select it.
              </div>
            </div>

            {selectedThemeId ? (
              <Badge variant="outline">Selected: {selectedThemeId}</Badge>
            ) : (
              <Badge variant="outline">No theme selected</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => {
              const active = t.id === selectedThemeId;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedThemeId(t.id)}
                  className={cn(
                    "text-left rounded-xl focus:outline-none",
                    active ? "ring-2 ring-primary" : "ring-1 ring-transparent"
                  )}
                >
                  <Card className={cn(active ? "border-primary" : "")}>
                    <CardContent className="p-3 space-y-3">
                      <div className="relative w-full aspect-4/3 overflow-hidden rounded-lg border bg-muted">
                        <Image
                          src={t.imageUrl}
                          alt={t.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{t.name}</div>
                          {t.description ? (
                            <div className="text-xs text-muted-foreground">
                              {t.description}
                            </div>
                          ) : null}
                        </div>

                        {active ? (
                          <Badge>Selected</Badge>
                        ) : (
                          <Badge variant="outline">Pick</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
        {/* Logo */}
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Logo</div>
              <div className="text-xs text-muted-foreground">
                Upload a PNG/JPG/SVG logo for your storefront.
              </div>
            </div>

            {hasLogo ? (
              <Badge>Selected</Badge>
            ) : (
              <Badge variant="outline">Optional</Badge>
            )}
          </div>

          <div
            {...getRootProps()}
            className={cn(
              "border rounded-lg w-full flex flex-col items-center justify-center p-6",
              "border-dashed cursor-pointer hover:border-primary",
              isDragActive ? "border-primary" : ""
            )}
          >
            <input {...getInputProps()} />

            {uploadedImage ? (
              <Image
                src={uploadedImage}
                alt="Logo preview"
                className="rounded-lg object-contain bg-muted/20"
                width={220}
                height={220}
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-lg bg-muted/30">
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

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUploadedImage(null);
                setImageFileName("");
                setImageMimeType("image/png");
              }}
              disabled={!hasLogo || isUploading}
            >
              Remove
            </Button>

            <Button
              type="button"
              onClick={handleUploadLogo}
              disabled={!hasLogo || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload logo"}
            </Button>
          </div>

          {submitError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}
        </div>

        {/* Continue */}
        <div className="flex justify-end">
          <Button type="button" onClick={handleContinue} disabled={isUploading}>
            {isUploading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
