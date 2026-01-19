/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { FiSettings } from "react-icons/fi";
import { MdErrorOutline, MdCheckCircle } from "react-icons/md";

import { PAYMENT_METHODS } from "../config/payment-methods.config";
import { StorePaymentMethodRow } from "../types/payment-methods.type";
import {
  useGetStorePaymentMethods,
  useToggleStorePaymentMethod,
  useUpsertBankTransferConfig,
  useUpsertGatewayConfig,
} from "../hooks/use-store-payment-methods";
import Image from "next/image";
// -----------------------------
// helpers
// -----------------------------
function keyOfRow(row: StorePaymentMethodRow) {
  if (row.method === "gateway") return `gateway:${row.provider ?? "unknown"}`;
  return row.method;
}

function normalizeRows(input: unknown): StorePaymentMethodRow[] {
  if (Array.isArray(input)) return input as StorePaymentMethodRow[];

  if (input && typeof input === "object") {
    const maybe = input as any;

    if (Array.isArray(maybe.data)) return maybe.data as StorePaymentMethodRow[];
    if (Array.isArray(maybe.rows)) return maybe.rows as StorePaymentMethodRow[];
    if (Array.isArray(maybe.items))
      return maybe.items as StorePaymentMethodRow[];
    if (Array.isArray(maybe.methods))
      return maybe.methods as StorePaymentMethodRow[];
  }

  return [];
}

function rowsToMap(input: unknown) {
  const rows = normalizeRows(input);
  const map: Record<string, StorePaymentMethodRow | null> = {};

  for (const r of rows) {
    if (!r) continue;
    map[keyOfRow(r)] = r;
  }

  return map;
}

function PaymentMethodIcon({
  icon,
  alt,
}: {
  icon: React.ReactNode | string;
  alt: string;
}) {
  // string → image
  if (typeof icon === "string") {
    return (
      <div className="relative h-10 w-10 flex items-center justify-center">
        <Image src={icon} alt={alt} fill className="object-contain" />
      </div>
    );
  }

  // React node → icon
  return <div className="text-2xl">{icon}</div>;
}

// -----------------------------
// card component
// -----------------------------
function PaymentMethodCard(props: {
  cfg: any;
  rowByKey: Record<string, StorePaymentMethodRow | null>;
  enabledByKey: Record<string, boolean>;
  formByKey: Record<string, Record<string, any>>;
  openByKey: Record<string, boolean>;
  setOpenByKey: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setField: (key: string, field: string, value: any) => void;
  toggleEnabled: (key: string, next: boolean) => void;
  save: (key: string) => void;
  togglePending: boolean;
  savePending: boolean;
}) {
  const {
    cfg,
    rowByKey,
    enabledByKey,
    formByKey,
    openByKey,
    setOpenByKey,
    setField,
    toggleEnabled,
    save,
    togglePending,
    savePending,
  } = props;

  const key = cfg.key;
  const row = rowByKey[key] ?? null;
  const enabledCard = !!enabledByKey[key];
  const values = formByKey[key] ?? {};
  const status = (row?.status ?? "not connected").toLowerCase();

  const hasSettings = Array.isArray(cfg.fields) && cfg.fields.length > 0;

  const isConnected = status === "connected";
  const statusLabel = isConnected ? "Connected" : "not connected";

  return (
    <div className="border rounded-lg p-5 shadow-sm mb-5 h-52 flex flex-col justify-between">
      {/* top row: icon + name (left), toggle (right) */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 mb-2">
            <PaymentMethodIcon icon={cfg.icon} alt={cfg.title} />
            <div className="min-w-0">
              <div className="text-xl font-semibold truncate">{cfg.title}</div>
            </div>
          </div>

          <Switch
            checked={enabledCard}
            onCheckedChange={(v) => toggleEnabled(key, v)}
            disabled={togglePending}
          />
        </div>

        {/* description */}
        <div className="mt-2 text-sm text-muted-foreground">
          {cfg.description}
        </div>
      </div>
      {/* bottom row: settings (left) + status badge (right) */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {hasSettings ? (
          <Dialog
            open={!!openByKey[key]}
            onOpenChange={(open) =>
              setOpenByKey((p) => ({ ...p, [key]: open }))
            }
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="clean"
                size="sm"
                disabled={!enabledCard}
                className="inline-flex items-center gap-2"
              >
                <FiSettings className="h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{cfg.title} settings</DialogTitle>
                <DialogDescription>
                  Add the required configuration for this payment method.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {cfg.fields.map((f: any) => {
                  const v = String(values[f.key] ?? "");
                  const isTextarea = f.type === "textarea";

                  return (
                    <div key={f.key} className="space-y-1">
                      <Label className="text-sm font-medium">
                        {f.label}
                        {f.required ? " *" : ""}
                      </Label>

                      {isTextarea ? (
                        <Textarea
                          value={v}
                          placeholder={f.placeholder}
                          onChange={(e) => setField(key, f.key, e.target.value)}
                        />
                      ) : (
                        <Input
                          value={v}
                          placeholder={f.placeholder}
                          type={f.secret ? "password" : "text"}
                          onChange={(e) => setField(key, f.key, e.target.value)}
                        />
                      )}

                      {f.help ? (
                        <div className="text-xs text-muted-foreground">
                          {f.help}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <DialogFooter className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  onClick={() => save(key)}
                  disabled={savePending}
                  variant="clean"
                >
                  {savePending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="text-xs text-muted-foreground">
            No settings required
          </div>
        )}

        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            isConnected
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-orange-700",
          ].join(" ")}
        >
          {isConnected ? (
            <MdCheckCircle className="h-3.5 w-3.5" />
          ) : (
            <MdErrorOutline className="h-3.5 w-3.5" />
          )}
          {statusLabel}
        </span>
      </div>

      {/* error (keep under, optional) */}
      {row?.lastError ? (
        <div className="mt-2 text-xs text-red-600">{row.lastError}</div>
      ) : null}
    </div>
  );
}

// -----------------------------
// main component
// -----------------------------
export function PaymentMethodsClient() {
  const axios = useAxiosAuth();
  const qc = useQueryClient();
  const { activeStoreId } = useStoreScope();
  const { data: session } = useSession();

  const accessToken = session?.backendTokens?.accessToken as string | undefined;
  const enabled = Boolean(activeStoreId && accessToken);

  const queryKey = ["payments", "store-methods", "admin", activeStoreId];

  const methodsQuery = useGetStorePaymentMethods(activeStoreId, axios, enabled);

  const toggleMutation = useToggleStorePaymentMethod(axios);
  const upsertGateway = useUpsertGatewayConfig(axios);
  const upsertBank = useUpsertBankTransferConfig(axios);

  const [rowByKey, setRowByKey] = React.useState<
    Record<string, StorePaymentMethodRow | null>
  >({});
  const [enabledByKey, setEnabledByKey] = React.useState<
    Record<string, boolean>
  >({});
  const [formByKey, setFormByKey] = React.useState<
    Record<string, Record<string, any>>
  >({});
  const [openByKey, setOpenByKey] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const map = rowsToMap(methodsQuery.data);
    setRowByKey(map);

    const nextEnabled: Record<string, boolean> = {};
    const nextForms: Record<string, Record<string, any>> = {};

    for (const cfg of PAYMENT_METHODS) {
      const row = map[cfg.key] ?? null;
      nextEnabled[cfg.key] = row?.isEnabled ?? false;
      nextForms[cfg.key] = cfg.fromConfig(row);
    }

    setEnabledByKey(nextEnabled);
    setFormByKey(nextForms);
  }, [methodsQuery.data]);

  const setField = (key: string, field: string, value: any) => {
    setFormByKey((p) => ({
      ...p,
      [key]: { ...(p[key] ?? {}), [field]: value },
    }));
  };

  const validate = (key: string) => {
    const cfg = PAYMENT_METHODS.find((x) => x.key === key)!;
    if (!enabledByKey[key]) return null;

    const values = formByKey[key] ?? {};
    for (const f of cfg.fields ?? []) {
      if (!f.required) continue;
      const v = String(values[f.key] ?? "").trim();
      if (!v) return `Missing required field: ${f.label}`;
    }
    return null;
  };

  const toggleEnabled = async (key: string, next: boolean) => {
    const cfg = PAYMENT_METHODS.find((x) => x.key === key)!;

    setEnabledByKey((p) => ({ ...p, [key]: next }));

    try {
      await toggleMutation.mutateAsync({
        storeId: activeStoreId!,
        method: cfg.method,
        provider: cfg.provider ?? null,
        enabled: next,
      });

      await qc.invalidateQueries({ queryKey });
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ?? e?.message ?? "Failed to toggle"
      );
      setEnabledByKey((p) => ({ ...p, [key]: !next }));
    }
  };

  const save = async (key: string) => {
    const cfg = PAYMENT_METHODS.find((x) => x.key === key)!;
    const err = validate(key);
    if (err) return toast.error("Error: " + err);

    const values = formByKey[key] ?? {};
    const config = cfg.toConfig(values);

    try {
      if (cfg.method === "gateway") {
        await upsertGateway.mutateAsync({
          storeId: activeStoreId!,
          provider: cfg.provider!,
          config,
          enabled: enabledByKey[key],
        });
      } else if (cfg.method === "bank_transfer") {
        await upsertBank.mutateAsync({
          storeId: activeStoreId!,
          config: config.bankDetails,
          enabled: enabledByKey[key],
        });
      } else {
        // methods with no config (cash/pos/manual) can just be toggled
        await qc.invalidateQueries({ queryKey });
      }

      await qc.invalidateQueries({ queryKey });
      setOpenByKey((p) => ({ ...p, [key]: false }));
      toast.success("Saved");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to save");
    }
  };

  // ---------------- UI states
  if (!activeStoreId) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-yellow-700">
          <MdErrorOutline size={20} />
          <span className="font-medium">No active store selected</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a store to manage payment methods.
        </p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-yellow-700">
          <MdErrorOutline size={20} />
          <span className="font-medium">Not authenticated</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in again to manage payment methods.
        </p>
      </div>
    );
  }

  if (methodsQuery.isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }

  if (methodsQuery.isError) {
    const msg =
      (methodsQuery.error as any)?.response?.data?.message ??
      (methodsQuery.error as any)?.message ??
      "Failed to load";
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-red-600">
          <MdErrorOutline size={20} />
          <span className="font-medium">Error</span>
        </div>
        <p className="mt-2 text-sm">{String(msg)}</p>
      </div>
    );
  }

  const online = PAYMENT_METHODS.filter((m: any) => m.category === "online");
  const manual = PAYMENT_METHODS.filter((m: any) => m.category === "manual");

  return (
    <div className="mx-auto space-y-6 ">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Payment methods</h1>
        <p className="text-sm text-muted-foreground">
          Enable gateway payments and manual options for this store.
        </p>
      </header>

      <Tabs defaultValue="online" className="md:max-w-4xl">
        <TabsList>
          <TabsTrigger value="online">Online</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="online" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {online.map((cfg: any) => (
              <PaymentMethodCard
                key={cfg.key}
                cfg={cfg}
                rowByKey={rowByKey}
                enabledByKey={enabledByKey}
                formByKey={formByKey}
                openByKey={openByKey}
                setOpenByKey={setOpenByKey}
                setField={setField}
                toggleEnabled={toggleEnabled}
                save={save}
                togglePending={toggleMutation.isPending}
                savePending={upsertGateway.isPending || upsertBank.isPending}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {manual.map((cfg: any) => (
              <PaymentMethodCard
                key={cfg.key}
                cfg={cfg}
                rowByKey={rowByKey}
                enabledByKey={enabledByKey}
                formByKey={formByKey}
                openByKey={openByKey}
                setOpenByKey={setOpenByKey}
                setField={setField}
                toggleEnabled={toggleEnabled}
                save={save}
                togglePending={toggleMutation.isPending}
                savePending={upsertGateway.isPending || upsertBank.isPending}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
