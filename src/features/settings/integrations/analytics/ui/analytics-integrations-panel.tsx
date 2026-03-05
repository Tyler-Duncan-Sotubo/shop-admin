/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { toast } from "sonner";

import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { FiSettings } from "react-icons/fi";
import { MdCheckCircle } from "react-icons/md";

import type {
  AnalyticsProvider,
  IntegrationRow,
} from "../types/analytics.types";
import { INTEGRATIONS } from "../config/integrations.config";

/** keep existing normalizer behavior */
function normalizeRows(input: unknown): IntegrationRow[] {
  if (Array.isArray(input)) return input as IntegrationRow[];
  if (input && typeof input === "object") {
    const maybe = input as any;
    if (Array.isArray(maybe.data)) return maybe.data as IntegrationRow[];
    if (Array.isArray(maybe.items)) return maybe.items as IntegrationRow[];
    if (Array.isArray(maybe.rows)) return maybe.rows as IntegrationRow[];
  }
  return [];
}

function buildDefaultStateFromRows(input: unknown) {
  const rows = normalizeRows(input);

  const rowsByProvider: Record<string, IntegrationRow | null> = {};
  const formByProvider: Record<string, Record<string, any>> = {};
  const enabledByProvider: Record<string, boolean> = {};
  const consentByProvider: Record<string, boolean> = {};

  for (const cfg of INTEGRATIONS) {
    const row = rows.find((r) => r.provider === cfg.provider) ?? null;
    rowsByProvider[cfg.provider] = row;
    formByProvider[cfg.provider] = cfg.fromPublicConfig(row?.publicConfig);
    enabledByProvider[cfg.provider] = row?.enabled ?? false;
    consentByProvider[cfg.provider] = row?.requiresConsent ?? true;
  }

  return {
    rowsByProvider,
    formByProvider,
    enabledByProvider,
    consentByProvider,
  };
}

export function AnalyticsIntegrationsPanel(props: {
  rows: IntegrationRow[];
  activeStoreId: string;
  accessToken: string;
  queryKey: any[];
}) {
  const axios = useAxiosAuth();
  const qc = useQueryClient();

  const { rows, activeStoreId, accessToken, queryKey } = props;

  const [rowsByProvider, setRowsByProvider] = React.useState<
    Record<string, IntegrationRow | null>
  >({});
  const [formByProvider, setFormByProvider] = React.useState<
    Record<string, Record<string, any>>
  >({});
  const [enabledByProvider, setEnabledByProvider] = React.useState<
    Record<string, boolean>
  >({});
  const [consentByProvider, setConsentByProvider] = React.useState<
    Record<string, boolean>
  >({});
  const [openByProvider, setOpenByProvider] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    const next = buildDefaultStateFromRows(rows);
    setRowsByProvider(next.rowsByProvider);
    setFormByProvider(next.formByProvider);
    setEnabledByProvider(next.enabledByProvider);
    setConsentByProvider(next.consentByProvider);
  }, [rows]);

  const upsertMutation = useMutation({
    mutationFn: async (payload: {
      provider: AnalyticsProvider;
      enabled: boolean;
      requiresConsent: boolean;
      publicConfig: Record<string, any>;
    }) => {
      const res = await axios.post(
        `/api/integrations/analytics/admin`,
        payload,
        {
          params: { storeId: activeStoreId },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
    },
  });

  const setEnabledMutation = useMutation({
    mutationFn: async (payload: {
      provider: AnalyticsProvider;
      enabled: boolean;
    }) => {
      const res = await axios.patch(
        `/api/integrations/analytics/admin/${encodeURIComponent(
          payload.provider,
        )}/enabled`,
        { enabled: payload.enabled },
        {
          params: { storeId: activeStoreId },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
    },
  });

  const setField = (provider: AnalyticsProvider, key: string, value: any) => {
    setFormByProvider((prev) => ({
      ...prev,
      [provider]: { ...(prev[provider] ?? {}), [key]: value },
    }));
  };

  const validate = (provider: AnalyticsProvider) => {
    const cfg = INTEGRATIONS.find((x) => x.provider === provider)!;
    const values = formByProvider[provider] ?? {};
    if (!enabledByProvider[provider]) return null;

    for (const f of cfg.fields) {
      if (f.type !== "text" || !f.required) continue;
      const v = String(values[f.key] ?? "").trim();
      if (!v) return `Missing required field: ${f.label}`;
    }
    return null;
  };

  const save = (provider: AnalyticsProvider) => {
    const err = validate(provider);
    if (err) {
      toast.error("Error: " + err);
      return;
    }

    const cfg = INTEGRATIONS.find((x) => x.provider === provider)!;
    const values = formByProvider[provider] ?? {};

    upsertMutation.mutate(
      {
        provider,
        enabled: !!enabledByProvider[provider],
        requiresConsent: consentByProvider[provider] ?? true,
        publicConfig: cfg.toPublicConfig(values),
      },
      {
        onSuccess: () => {
          setOpenByProvider((p) => ({ ...p, [provider]: false }));
        },
      },
    );
  };

  const toggleEnabled = (provider: AnalyticsProvider, nextEnabled: boolean) => {
    setEnabledByProvider((p) => ({ ...p, [provider]: nextEnabled }));
    setEnabledMutation.mutate({ provider, enabled: nextEnabled });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-base font-semibold">
          Google Analytics, Facebook Pixel, and more
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure analytics and pixels for your storefront.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {INTEGRATIONS.map((cfg) => {
          const provider = cfg.provider;
          const enabledCard = !!enabledByProvider[provider];
          const requiresConsent = consentByProvider[provider] ?? true;
          const values = formByProvider[provider] ?? {};
          const row = rowsByProvider[provider] ?? null;

          return (
            <div key={provider} className="border rounded-lg p-4 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-3 mr-2">
                  <div
                    className="shrink-0 mt-0.5 text-3xl"
                    style={{ color: cfg.brandColor }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="shrink-0">
                    <Switch
                      checked={enabledCard}
                      onCheckedChange={(v) => toggleEnabled(provider, v)}
                      disabled={setEnabledMutation.isPending}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-base font-semibold leading-none truncate">
                  {cfg.title}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {cfg.description}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Dialog
                  open={!!openByProvider[provider]}
                  onOpenChange={(open) =>
                    setOpenByProvider((p) => ({ ...p, [provider]: open }))
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
                        Add your IDs/pixels and configure consent gating.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {cfg.fields
                        .filter((f) => f.type !== "switch")
                        .map((f) => {
                          const v = String(values[f.key] ?? "");
                          return (
                            <div key={f.key} className="space-y-1">
                              <Label className="text-sm font-medium">
                                {f.label}
                                {f.required ? " *" : ""}
                              </Label>
                              <Input
                                value={v}
                                placeholder={f.placeholder}
                                onChange={(e) =>
                                  setField(provider, f.key, e.target.value)
                                }
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {f.help ?? ""}
                                </span>
                                {f.patternHint ? (
                                  <span className="text-[11px] text-muted-foreground">
                                    {f.patternHint}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}

                      <div className="flex items-center justify-between gap-4 rounded-md border p-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            Require consent
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Only fire this integration after the customer
                            consents.
                          </div>
                        </div>

                        <Switch
                          checked={requiresConsent}
                          onCheckedChange={(v) =>
                            setConsentByProvider((p) => ({
                              ...p,
                              [provider]: v,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between gap-3">
                      <div className="text-xs">
                        {row?.id ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <MdCheckCircle className="h-4 w-4" />
                            Saved
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Not saved yet
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={() => save(provider)}
                        disabled={upsertMutation.isPending}
                        variant="clean"
                      >
                        {upsertMutation.isPending ? "Saving…" : "Save"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
