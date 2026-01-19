"use client";

import { Badge } from "@/shared/ui/badge";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreThemeStatusWithId } from "../../core/hooks/use-store-theme-status";

export function ThemeLiveBadge({
  storeId,
  onPublishClick,
}: {
  storeId: string;
  onPublishClick?: () => void;
}) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();
  const q = useStoreThemeStatusWithId(session, axios, storeId);

  if (q.isLoading) {
    return <Badge variant="secondary">Checking…</Badge>;
  }

  if (q.isError) {
    return <Badge variant="destructive">Status unknown</Badge>;
  }

  if (q.data?.hasPublishedTheme) {
    return <Badge>Live</Badge>;
  }

  return (
    <button type="button" onClick={onPublishClick}>
      <Badge variant="secondary">Not live</Badge>
    </button>
  );
}
