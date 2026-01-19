/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { usePublishDraftOverride } from "../../core/hooks/use-storefront-overrides";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

export function PublishConfirmDialog({
  storeId,
  children,
  open,
  onOpenChange,
}: {
  storeId: string;
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const publish = usePublishDraftOverride(session, axios, storeId);

  async function handlePublish() {
    try {
      await publish.mutateAsync();
      toast.success("Changes published successfully");
      onOpenChange(false); // ✅ CLOSE DIALOG
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to publish changes");
      // ❌ keep dialog open on error
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button size="sm" disabled={publish.isPending}>
            Publish
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish changes?</AlertDialogTitle>
          <AlertDialogDescription>
            This will make all saved draft changes live on your site.
            <br />
            <span className="text-sm text-muted-foreground">
              You can continue editing after publishing.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={publish.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={publish.isPending}
            onClick={(e) => {
              e.preventDefault(); // ✅ REQUIRED
              handlePublish();
            }}
          >
            {publish.isPending ? "Publishing…" : "Publish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
