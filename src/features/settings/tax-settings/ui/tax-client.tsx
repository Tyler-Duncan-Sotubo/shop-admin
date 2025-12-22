/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table"; // assuming you have this like other modules
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type { Tax } from "../types/tax.type";
import { taxColumns } from "./tax-columns";
import { TaxFormModal } from "./tax-form-modal";
import type { TaxValues } from "../schema/tax.schema";
import { percentToBps } from "../schema/tax.schema";
import {
  useCreateTax,
  useGetTaxes,
  useSetDefaultTax,
  useUpdateTax,
} from "../hooks/use-taxes";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function TaxClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope(); // ✅ your store scope
  const [tab, setTab] = useState<"active" | "inactive" | "all">("active");

  const activeParam =
    tab === "all" ? undefined : tab === "active" ? true : false;

  const { data: taxes = [], isLoading } = useGetTaxes(
    { active: activeParam, storeId: activeStoreId },
    session,
    axios
  );

  const createTax = useCreateTax(session, axios);
  const updateTax = useUpdateTax(session, axios);
  const setDefault = useSetDefaultTax(session, axios);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Tax | null>(null);

  const cols = useMemo(
    () =>
      taxColumns({
        onEdit: (row) => {
          setSelected(row);
          setMode("edit");
          setOpen(true);
        },
        onSetDefault: async (row) => {
          await setDefault.mutateAsync(row.id);
        },
      }),
    [setDefault]
  );

  const onSubmit = async (values: TaxValues) => {
    const payload = {
      name: values.name,
      code: values.code ?? null,
      rateBps: percentToBps(values.ratePercent),
      isInclusive: !!values.isInclusive,
      isDefault: !!values.isDefault,
      isActive: values.isActive ?? true,
      storeId: activeStoreId,
    };

    if (mode === "create") {
      await createTax.mutateAsync(payload);
      return;
    }

    if (!selected?.id) return;

    await updateTax.mutateAsync({
      taxId: selected.id,
      input: payload,
    });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tax Settings"
        description="Manage your tax settings"
        tooltip="Configure tax rates that are automatically applied to invoices."
      >
        <Button
          onClick={() => {
            setMode("create");
            setSelected(null);
            setOpen(true);
          }}
        >
          Add tax
        </Button>
      </PageHeader>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4">
        <DataTable columns={cols} data={taxes} />
      </div>

      <TaxFormModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        initialValues={selected}
        onSubmit={onSubmit}
        isSubmitting={createTax.isPending || updateTax.isPending}
      />
    </div>
  );
}
