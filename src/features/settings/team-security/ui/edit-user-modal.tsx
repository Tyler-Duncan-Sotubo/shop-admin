/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// features/team-security/ui/edit-user-modal.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { FormModal } from "@/shared/ui/form-modal";
import { Checkbox } from "@/shared/ui/checkbox";
import { Badge } from "@/shared/ui/badge";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import { useStores } from "@/features/settings/stores/core/hooks/use-stores";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "../types/user.type";
import { useUserStores } from "../../stores/core/hooks/use-accessible-stores";

type Props = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

export function EditUserModal({ open, onClose, user }: Props) {
  const { stores } = useStores();
  const axiosInstance = useAxiosAuth();
  const queryClient = useQueryClient();
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const { data: userStores = [], isLoading: loadingUserStores } = useUserStores(
    open ? user?.id : undefined, // 👈 only fetch when modal is open
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingUserStores && userStores.length >= 0) {
      setStoreIds(userStores.map((s) => s.id));
    }
  }, [user?.id, loadingUserStores]);

  const toggleStore = (id: string) => {
    setStoreIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await axiosInstance.patch(`/api/auth/${user.id}/stores`, { storeIds });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ?? "Failed to update store access.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      mode="edit"
      title="Edit user"
      description="Manage store access for this user."
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save changes"
    >
      <div className="space-y-6">
        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
          <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-full shrink-0 bg-muted">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={`${user.first_name} ${user.last_name}`}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs truncate text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto shrink-0">
            {user.role}
          </Badge>
        </div>

        {/* Store access */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Store Access</p>
          <p className="text-xs text-muted-foreground">
            Select which stores this user can access.
          </p>

          <div className="mt-3 space-y-2">
            {loadingUserStores ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-md w-7 h-7 bg-muted" />
                      <div className="w-24 h-4 rounded bg-muted" />
                    </div>
                    <div className="w-4 h-4 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : stores.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stores found.</p>
            ) : (
              stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {store.imageUrl ? (
                      <Image
                        src={store.imageUrl}
                        alt={store.name}
                        width={28}
                        height={28}
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-xs font-bold rounded-md w-7 h-7 bg-muted">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{store.name}</span>
                  </div>
                  <Checkbox
                    checked={storeIds.includes(store.id)}
                    onCheckedChange={() => toggleStore(store.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {submitError && (
          <p className="text-xs text-destructive">{submitError}</p>
        )}
      </div>
    </FormModal>
  );
}
