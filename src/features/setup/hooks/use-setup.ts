"use client";

import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { SetupCreateStorePayload } from "../types/setup.type";

export function useCreateStoreWithDomains() {
  return useCreateMutation<SetupCreateStorePayload>({
    endpoint: "/api/setup/store",
    successMessage: "Store created",
    refetchKey: "stores", // optional
  });
}

export function useUploadSetupLogo(storeId: string) {
  return useCreateMutation({
    endpoint: `/api/setup/logo/${storeId}`,
    successMessage: "Logo uploaded",
  });
}

export function useCompleteSetup() {
  return useCreateMutation({
    endpoint: "/api/setup/complete",
    successMessage: "Setup completed",
  });
}
