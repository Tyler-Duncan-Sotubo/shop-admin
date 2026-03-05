// app/(admin)/integrations/_components/zoho-integration-panel.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
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
import { SiZoho } from "react-icons/si";
import { ZohoRegion, ZohoRow } from "../types/types";

export function ZohoIntegrationPanel(props: {
  row: ZohoRow | null;
  activeStoreId: string;
  accessToken: string;
  queryKey: any[];
}) {
  const axios = useAxiosAuth();
  const qc = useQueryClient();

  const { row, activeStoreId, accessToken, queryKey } = props;

  const connected = !!row?.id;

  const [open, setOpen] = React.useState(false);
  const [localEnabled, setLocalEnabled] = React.useState(false);

  const [region, setRegion] = React.useState<ZohoRegion>("com");
  const [orgId, setOrgId] = React.useState("");
  const [orgName, setOrgName] = React.useState("");

  React.useEffect(() => {
    if (!row) {
      setLocalEnabled(false);
      setRegion("com");
      setOrgId("");
      setOrgName("");
      return;
    }
    setLocalEnabled(!!row.isActive);
    setRegion((row.region as ZohoRegion) ?? "com");
    setOrgId(String(row.zohoOrganizationId ?? ""));
    setOrgName(String(row.zohoOrganizationName ?? ""));
  }, [row]);

  const setEnabledMutation = useMutation({
    mutationFn: async (payload: { enabled: boolean }) => {
      const res = await axios.patch(
        `/api/integrations/zoho/admin/enabled`,
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

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      region?: ZohoRegion;
      zohoOrganizationId?: string;
      zohoOrganizationName?: string;
    }) => {
      const res = await axios.patch(`/api/integrations/zoho/admin`, payload, {
        params: { storeId: activeStoreId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
      setOpen(false);
      toast.success("Zoho settings saved");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/integrations/zoho/admin`, {
        params: { storeId: activeStoreId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
      toast.success("Zoho disconnected");
      setOpen(false);
    },
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get(`/api/integrations/zoho/connect`, {
        params: { storeId: activeStoreId, region },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data?.data?.url as string;
    },
    onSuccess: (url) => {
      if (!url) {
        toast.error("Missing connect URL from backend");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "Failed to start Zoho connect";
      toast.error(String(msg));
    },
  });

  const toggleEnabled = (nextEnabled: boolean) => {
    setLocalEnabled(nextEnabled);
    setEnabledMutation.mutate({ enabled: nextEnabled });
  };

  const save = () => {
    updateMutation.mutate({
      region,
      zohoOrganizationId: orgId.trim() || undefined,
      zohoOrganizationName: orgName.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-base font-semibold">Zoho Books integration</h1>
        <p className="text-sm text-muted-foreground">
          Connect Zoho Books to create quotes and convert them to orders.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mr-2">
            <div className="shrink-0 mt-0.5" style={{ color: "#E42527" }}>
              <SiZoho size={60} />
            </div>

            <div className="shrink-0">
              <Switch
                checked={connected ? localEnabled : false}
                onCheckedChange={toggleEnabled}
                disabled={!connected || setEnabledMutation.isPending}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-base font-semibold leading-none truncate">
              Zoho Books
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Sync quotes (estimates), convert to sales orders, and request
              payment.
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            {connected ? (
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-green-600">
                  <MdCheckCircle className="h-4 w-4" />
                  Connected
                </div>

                {row?.zohoOrganizationName ? (
                  <div>Org: {row.zohoOrganizationName}</div>
                ) : row?.zohoOrganizationId ? (
                  <div>Org ID: {String(row.zohoOrganizationId)}</div>
                ) : null}

                {row?.lastError ? (
                  <div className="text-red-600">
                    Last error: {row.lastError}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-muted-foreground">Not connected</div>
                <div>Click “Connect” to authorize Zoho Books.</div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="clean"
              size="sm"
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
            >
              {connectMutation.isPending
                ? "Redirecting…"
                : connected
                  ? "Reconnect"
                  : "Connect"}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="clean"
                  size="sm"
                  className="inline-flex items-center gap-2"
                  disabled={!connected}
                >
                  <FiSettings className="h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Zoho Books settings</DialogTitle>
                  <DialogDescription>
                    Configure region and (optionally) organization mapping.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Region</Label>
                    <Input
                      value={region}
                      placeholder="com | eu | in | com.au | jp | ca | sa"
                      onChange={(e) => setRegion(e.target.value as ZohoRegion)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Match your Zoho account region (affects OAuth and API
                      host).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Organization ID
                    </Label>
                    <Input
                      value={orgId}
                      placeholder="Zoho Books organization_id"
                      onChange={(e) => setOrgId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. If empty, you can select org after OAuth or
                      later.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Organization Name
                    </Label>
                    <Input
                      value={orgName}
                      placeholder="Company Books Org name"
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-between gap-3">
                  <div className="text-xs">
                    {connected ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <MdCheckCircle className="h-4 w-4" />
                        Saved
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Not connected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => disconnectMutation.mutate()}
                      disabled={disconnectMutation.isPending}
                    >
                      {disconnectMutation.isPending
                        ? "Disconnecting…"
                        : "Disconnect"}
                    </Button>

                    <Button
                      type="button"
                      onClick={save}
                      disabled={updateMutation.isPending}
                      variant="clean"
                    >
                      {updateMutation.isPending ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
