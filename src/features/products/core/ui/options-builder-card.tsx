/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useProductOptions } from "../hooks/use-product-options";
import { EditableOption } from "./edit-options";

// ✅ Canonical option names you allow
const OPTION_PRESETS = [
  { value: "Color", label: "Color" },
  { value: "Size", label: "Size" },
  { value: "Material", label: "Material" },
  { value: "Style", label: "Style" },
  { value: "Type", label: "Type" },
] as const;

type OptionPreset = (typeof OPTION_PRESETS)[number]["value"];

const CreateOptionSchema = z.object({
  preset: z.enum(
    OPTION_PRESETS.map((p) => p.value) as [OptionPreset, ...OptionPreset[]],
    {
      message: "Select a valid option name",
    },
  ),
  valuesCsv: z.string().min(1, "Add at least one value (comma-separated)"),
});

type CreateOptionValues = z.infer<typeof CreateOptionSchema>;

export function OptionsBuilderCard({ productId }: { productId: string }) {
  const {
    options,
    isLoading,
    createOption,
    createOptionValue,
    generateVariants,
  } = useProductOptions(productId);

  const [generateError, setGenerateError] = useState<string | null>(null);

  const form = useForm<CreateOptionValues>({
    resolver: zodResolver(CreateOptionSchema),
    defaultValues: {
      preset: "Size",
      valuesCsv: "",
    },
  });

  const canGenerate = useMemo(() => {
    return options.some((o) => (o.values?.length ?? 0) > 0);
  }, [options]);

  const onCreateOption = async (v: CreateOptionValues) => {
    // v.preset is guaranteed to be valid
    const created = await createOption.mutateAsync({ name: v.preset });

    const optionId = created?.id ?? created?.data?.id;
    if (!optionId) throw new Error("Option created but no id returned");

    const values = v.valuesCsv
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    for (const value of values) {
      await createOptionValue.mutateAsync({ optionId, value });
    }

    form.reset({ preset: "Size", valuesCsv: "" });
  };

  const onGenerate = async () => {
    setGenerateError(null);

    if (!canGenerate) {
      setGenerateError("Add at least one option with values.");
      return;
    }

    try {
      await generateVariants.mutateAsync();
    } catch (e: any) {
      setGenerateError(e?.message ?? "Failed to generate variants");
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : options.length === 0 ? (
        <div className="text-sm text-muted-foreground border-b pb-4">
          No options yet.
        </div>
      ) : (
        <div className="space-y-3 border-b pb-4">
          <EditableOption
            options={options}
            createOptionValue={createOptionValue}
            productId={productId}
            deleteOptionDisabled={
              createOption.isPending || createOptionValue.isPending
            }
            deleteValueDisabled={
              createOption.isPending || createOptionValue.isPending
            }
          />
        </div>
      )}

      {/* Create option + values */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onCreateOption)}
          className="space-y-3"
        >
          {/* ✅ Option name enforced */}
          <FormField
            control={form.control}
            name="preset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option name</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPTION_PRESETS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valuesCsv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Values</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Small, Medium, Large" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={createOption.isPending || createOptionValue.isPending}
          >
            {createOption.isPending ? "Adding..." : "Add option"}
          </Button>
        </form>
      </Form>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-end">
          <Button
            type="button"
            onClick={onGenerate}
            disabled={generateVariants.isPending}
          >
            {generateVariants.isPending ? "Generating..." : "Generate variants"}
          </Button>
        </div>

        {generateError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {generateError}
          </div>
        )}
      </div>
    </div>
  );
}
