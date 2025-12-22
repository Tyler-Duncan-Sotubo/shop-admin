/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { CreateApiKeySchema } from "../schema/create-api-key.schema";
import { useCreateApiKey } from "../hooks/use-api-keys";
import { isAxiosError } from "@/shared/api/axios";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { STOREFRONT_API_SCOPES } from "@/shared/constants/storefront-scopes";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function CreateApiKeyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope(); // ✅ your store scope
  const create = useCreateApiKey(session, axios);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("pk_live");
  const [allowedOrigins, setAllowedOrigins] = useState("");

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  const reset = () => {
    setSubmitError(null);
    setCreatedRawKey(null);
    setName("");
    setPrefix("pk_live");
    setAllowedOrigins("");
  };

  const copy = async () => {
    if (!createdRawKey) return;
    await navigator.clipboard.writeText(createdRawKey);
  };

  const submit = async () => {
    setSubmitError(null);

    const parsed = CreateApiKeySchema.safeParse({
      name,
      prefix,
      allowedOrigins,
    });

    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      const v = parsed.data;
      const res = await create.mutateAsync({
        name: v.name,
        prefix: v.prefix,
        scopes: STOREFRONT_API_SCOPES,
        allowedOrigins: v.allowedOrigins,
        storeId: activeStoreId,
      });

      setCreatedRawKey(res.rawKey);
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        setSubmitError(getErrorMessage(err.response.data?.error));
        return {
          error: getErrorMessage(err.response.data?.error),
        };
      } else {
        return { error: getErrorMessage(err) };
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
          reset();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
        </DialogHeader>

        {createdRawKey ? (
          <div className="space-y-3">
            <p className="text-sm">
              Copy this key now — you won’t be able to see it again.
            </p>

            <div className="rounded-md border p-3 bg-muted/30">
              <p className="font-mono text-xs break-all">{createdRawKey}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={copy}>
                Copy
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  reset();
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Storefront Name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Prefix</label>
              <Input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="pk_live"
                disabled
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Scopes</label>
              <div className="flex flex-wrap gap-1">
                {STOREFRONT_API_SCOPES.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-muted px-2 py-1 text-xs font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">
                Allowed origins (comma separated)
              </label>
              <Input
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                placeholder="https://example.com, http://localhost:3000"
              />
            </div>

            {submitError ? (
              <p className="text-sm text-red-600">{submitError}</p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!canSubmit || create.isPending}
                onClick={submit}
              >
                {create.isPending ? "Creating..." : "Create key"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
