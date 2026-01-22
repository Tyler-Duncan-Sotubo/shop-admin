"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
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
import { TaxMobileRow } from "./tax-mobile-row";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";

type Tab = "active" | "inactive" | "all";

const TAB_CHIPS: { value: Tab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
];

function MobileTabChips({
  value,
  onChange,
}: {
  value: Tab;
  onChange: (v: Tab) => void;
}) {
  return (
    <div className="sm:hidden">
      <div className="flex flex-wrap gap-2">
        {TAB_CHIPS.map((t) => {
          const active = value === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className="active:scale-[0.98]"
            >
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-full px-3 py-1 text-xs cursor-pointer select-none",
                  "bg-transparent border",
                  active
                    ? "font-semibold text-primary border-primary/40"
                    : "text-muted-foreground",
                )}
              >
                {t.label}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TaxClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [tab, setTab] = useState<Tab>("active");

  const activeParam =
    tab === "all" ? undefined : tab === "active" ? true : false;

  const { data: taxes = [], isLoading } = useGetTaxes(
    { active: activeParam, storeId: activeStoreId },
    session,
    axios,
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
    [setDefault],
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

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        {/* Mobile chips */}
        <MobileTabChips value={tab} onChange={setTab} />

        {/* Desktop tabs */}
        <TabsList className="hidden sm:inline-flex">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4">
        <DataTable
          columns={cols}
          data={taxes}
          mobileRow={TaxMobileRow}
          tableMeta={{
            onEdit: (row: Tax) => {
              setSelected(row);
              setMode("edit");
              setOpen(true);
            },
            onSetDefault: async (row: Tax) => {
              await setDefault.mutateAsync(row.id);
            },
            refetchKey: ["billing", "taxes", "list", "all"],
          }}
        />
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
