"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import {
  useGetShippingOptions,
  useCreateShippingOption,
  useUpdateShippingOption,
  useDeleteShippingOption,
  useToggleShippingOption,
  type ShippingOption,
} from "../hooks/use-shipping-options";
import { NIGERIA_STATES } from "@/shared/constants/ng-regions";
import { shippingOptionColumns } from "./shipping-option-columns";
import { ShippingOptionMobileRow } from "./shipping-option-mobile-row";

import { FormModal } from "@/shared/ui/form-modal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { DataTable } from "@/shared/ui/data-table";
import { FilterChips } from "@/shared/ui/filter-chips";
import {
  SHIPPING_TAB_CHIPS,
  type ShippingTab,
} from "@/features/fulfillment/shipping-tabs";
import { FaPlus, FaChevronDown } from "react-icons/fa6";
import { toast } from "sonner";

// ── Schema ────────────────────────────────────────────────────────────────────

const OptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z
    .string()
    .min(1, "Fee is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Must be a valid amount",
    }),
  states: z.array(z.string()),
  area: z.string().optional(),
});

type OptionValues = z.infer<typeof OptionSchema>;

// ── States selector ───────────────────────────────────────────────────────────

function StatesSelector({
  value,
  onChange,
  singleSelect = false,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  singleSelect?: boolean;
}) {
  const label =
    value.length === 0
      ? null
      : value.length <= 3
        ? value.join(", ")
        : `${value.slice(0, 3).join(", ")} +${value.length - 3} more`;

  const handleChange = (state: string, checked: boolean) => {
    if (singleSelect) {
      onChange(checked ? [state] : []);
    } else {
      onChange(checked ? [...value, state] : value.filter((s) => s !== state));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center w-full gap-2 px-3 overflow-hidden text-sm text-left bg-transparent border rounded-md border-input h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex-1 truncate">
            {label ?? (
              <span className="text-muted-foreground">
                {singleSelect ? "Select a state" : "Nationwide (catch-all)"}
              </span>
            )}
          </span>
          <FaChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2 overflow-y-auto max-h-72"
        align="start"
      >
        <div className="space-y-0.5">
          {NIGERIA_STATES.map((state) => (
            <label
              key={state}
              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-accent"
            >
              <Checkbox
                checked={value.includes(state)}
                onCheckedChange={(checked) => handleChange(state, !!checked)}
              />
              <span className="text-sm">{state}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Option form modal ─────────────────────────────────────────────────────────

function OptionFormModal({
  open,
  onClose,
  mode,
  initialValues,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialValues?: ShippingOption | null;
  onSubmit: (values: OptionValues) => Promise<void>;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<OptionValues>({
    resolver: zodResolver(OptionSchema),
    defaultValues: { name: "", price: "", states: [], area: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      initialValues
        ? {
            name: initialValues.name,
            price: initialValues.price.toString(),
            states: initialValues.states,
            area: initialValues.area ?? "",
          }
        : { name: "", price: "", states: [], area: "" },
      { keepErrors: false },
    );
    setSubmitError(null);
  }, [open, initialValues, form]);

  const areaValue = form.watch("area");
  const hasArea = !!areaValue?.trim();

  const handleSubmit = async (values: OptionValues) => {
    try {
      await onSubmit(values);
      setSubmitError(null);
      onClose();
    } catch {
      setSubmitError("Failed to save. Please try again.");
    }
  };

  return (
    <FormModal
      open={open}
      title={mode === "edit" ? "Edit Shipping Option" : "Add Shipping Option"}
      submitLabel={mode === "edit" ? "Save Changes" : "Add Option"}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Form {...form}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Lagos Island, Nationwide" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="price"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery fee (₦)</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="states"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State{hasArea ? "" : "s"} covered</FormLabel>
              <StatesSelector
                value={field.value}
                onChange={field.onChange}
                singleSelect={hasArea}
              />
              {!hasArea && (
                <p className="text-xs text-muted-foreground">
                  Leave empty to apply to all states (catch-all).
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="area"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Area / LGA{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Mainland, Island, Ikeja" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                For sub-state pricing. Requires selecting exactly one state.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      </Form>
    </FormModal>
  );
}

// ── Main client ───────────────────────────────────────────────────────────────

export default function ShippingOptionsClient({
  tab,
  onTabChange,
}: {
  tab: ShippingTab;
  onTabChange: (t: ShippingTab) => void;
}) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const { data: options = [], isLoading } = useGetShippingOptions(
    session,
    axios,
    activeStoreId,
  );
  const { mutateAsync: create } = useCreateShippingOption(session, axios);
  const { mutateAsync: update } = useUpdateShippingOption(session, axios);
  const { mutateAsync: remove } = useDeleteShippingOption(session, axios);
  const { mutateAsync: toggle } = useToggleShippingOption(session, axios);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ShippingOption | null>(null);

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (opt: ShippingOption) => {
    setMode("edit");
    setSelected(opt);
    setModalOpen(true);
  };

  const handleSubmit = async (values: OptionValues) => {
    const payload = {
      name: values.name,
      states: values.states,
      area: values.area?.trim() || undefined,
      price: parseFloat(values.price),
      isActive: true,
    };
    if (mode === "create") {
      await create({ storeId: activeStoreId!, ...payload });
      toast.success("Shipping option added");
    } else if (selected) {
      await update({ id: selected.id, ...payload });
      toast.success("Shipping option updated");
    }
  };

  const handleDelete = async (opt: ShippingOption) => {
    try {
      await remove(opt.id);
      toast.success("Option deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggle = async (opt: ShippingOption) => {
    try {
      await toggle(opt.id);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const columns = shippingOptionColumns({
    onEdit: openEdit,
    onDelete: handleDelete,
    onToggle: handleToggle,
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={isLoading ? [] : options}
        filterKey="name"
        filterPlaceholder="Search shipping options..."
        mobileRow={ShippingOptionMobileRow}
        tableMeta={{
          onEdit: openEdit,
          onDelete: handleDelete,
          onToggle: handleToggle,
        }}
        emptyState={{
          title: "No shipping options yet",
          description:
            "Add shipping options that customers can choose at checkout.",
          action: (
            <Button size="sm" onClick={openCreate}>
              <FaPlus className="w-3 h-3 mr-2" />
              Add Option
            </Button>
          ),
        }}
        toolbarLeft={
          <FilterChips<ShippingTab>
            value={tab}
            onChange={onTabChange}
            chips={SHIPPING_TAB_CHIPS}
            wrap={false}
            scrollable
          />
        }
        toolbarRight={
          <Button onClick={openCreate}>
            <FaPlus className="w-3 h-3 mr-2" />
            Add Option
          </Button>
        }
      />

      <OptionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        initialValues={selected}
        onSubmit={handleSubmit}
      />
    </>
  );
}
