"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { UploadImageModal } from "./upload-image-modal";

export function FilesHeaderActions() {
  const [open, setOpen] = useState(false);
  const axios = useAxiosAuth();
  const qc = useQueryClient();
  const { activeStoreId } = useStoreScope();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Upload</Button>

      <UploadImageModal
        open={open}
        onClose={() => setOpen(false)}
        onUpload={async ({ base64, fileName, mimeType }) => {
          await axios.post("/api/media/upload-file", {
            storeId: activeStoreId,
            base64,
            fileName,
            mimeType,
          });

          await qc.invalidateQueries({ queryKey: ["media-files"] });
        }}
      />
    </>
  );
}
