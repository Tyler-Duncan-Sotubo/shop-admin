"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { useDeleteMutation } from "../hooks/use-delete-mutation";
import { FaTrash } from "react-icons/fa6";

type RefetchKey =
  | string
  | string[]
  | Array<{
      key: string;
      params?: unknown;
    }>;

type DeleteIconDialogProps = {
  /** DELETE endpoint */
  endpoint: string;

  /** React Query invalidation key */
  refetchKey?: RefetchKey;

  /** Toast success message */
  successMessage?: string;

  /** Dialog text overrides */
  title?: string;
  description?: string;

  /** Optional hooks */
  onSuccess?: () => void;
  onError?: (error: unknown) => void;

  /** Disable delete */
  disabled?: boolean;

  useIconButton?: boolean;
};

export function DeleteIconDialog({
  endpoint,
  refetchKey,
  successMessage = "Item deleted",
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onSuccess,
  onError,
  disabled,
  useIconButton = false,
}: DeleteIconDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useDeleteMutation({
    endpoint,
    successMessage,
    refetchKey,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation();
      onSuccess?.();
    } catch (error) {
      console.error("Delete failed:", error);
      onError?.(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="link"
          size="icon"
          className="text-destructive"
          disabled={disabled || isDeleting}
          aria-label="Delete item"
        >
          {useIconButton ? <FaTrash /> : <p className="text-xs">Remove</p>}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
