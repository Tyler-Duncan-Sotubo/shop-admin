"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { UploadImageModal } from "./upload-image-modal";
import axios from "axios";

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

export function FilesHeaderActions() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { activeStoreId } = useStoreScope();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Upload</Button>

      <UploadImageModal
        open={open}
        onClose={() => setOpen(false)}
        onUpload={async ({ file, fileName, mimeType }) => {
          // 1) presign (via Next.js -> NestJS)
          const presign = await axios.post<PresignResp>(
            "/api/uploads/media-presign",
            {
              storeId: activeStoreId,
              folder: "files",
              files: [{ fileName, mimeType }],
            }
          );

          const first = presign.data.uploads?.[0];
          if (!first) throw new Error("No presigned upload returned");

          // 2) PUT to S3 (direct from browser)
          await putToS3(first.uploadUrl, file);

          // 3) finalize (via Next.js -> NestJS) to create DB row + size
          await axios.post("/api/uploads/finalize", {
            storeId: activeStoreId,
            key: first.key,
            url: first.url,
            fileName,
            mimeType,
            folder: "files",
            tag: "file-upload",
          });

          await qc.invalidateQueries({ queryKey: ["media-files"] });
        }}
      />
    </>
  );
}
