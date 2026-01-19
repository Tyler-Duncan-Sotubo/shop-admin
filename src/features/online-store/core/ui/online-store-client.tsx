"use client";

import { useSession } from "next-auth/react";
import { ThemeGallery } from "./theme-gallery";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

export default function StoreCustomizationClient() {
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session } = useSession();
  return (
    <ThemeGallery session={session} axios={axios} storeId={activeStoreId} />
  );
}
