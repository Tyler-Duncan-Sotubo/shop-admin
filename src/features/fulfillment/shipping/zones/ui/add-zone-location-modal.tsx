"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { NG_REGION_CODES } from "@/shared/constants/ng-regions";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useEffect, useState } from "react";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

const Schema = z.object({
  id: z.string().optional(),
  zoneId: z.string().optional(),
  countryCode: z.string().optional(),
  state: z.string().optional(),
  area: z.string().optional(),
  regionCode: z.string().optional(),
});

type Values = z.infer<typeof Schema>;

export function AddZoneLocationModal({
  open,
  onClose,
  zoneId,
  initialValues,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  zoneId: string;
  initialValues?: Values | null;
  mode: "create" | "edit";
}) {
  const [submitError, setSubmitError] = useState(null as string | null);
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: {},
  });

  const createZoneLocation = useCreateMutation({
    endpoint: `/api/shipping/zones/locations`,
    successMessage: "Zone location added successfully",
    refetchKey: "shipping zones",
  });

  const updateZoneLocation = useUpdateMutation({
    endpoint: `/api/shipping/zones/locations/${initialValues?.id}`,
    successMessage: "Zone location updated successfully",
    refetchKey: "shipping zones",
  });

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.reset(
        {
          state: initialValues.regionCode ?? "",
          area: initialValues.area ?? "",
        },
        { keepErrors: false }
      );
    } else {
      form.reset(
        {
          state: "",
          area: "",
        },
        { keepErrors: false }
      );
    }
  }, [open, initialValues, form]);

  const onSubmit = async (values: Values) => {
    try {
      if (mode === "create") {
        await createZoneLocation({
          ...values,
          zoneId,
        });
        form.reset();
        setSubmitError(null);
        onClose();
      } else if (mode === "edit" && initialValues) {
        await updateZoneLocation({
          ...values,
          zoneId,
        });
        form.reset();
        setSubmitError(null);
        onClose();
      }
    } catch (error) {
      setSubmitError(`Failed to add zone location. Please try again. ${error}`);
    }
  };

  return (
    <FormModal
      open={open}
      title={mode === "edit" ? "Edit Zone Location" : "Add Zone Location"}
      submitLabel={mode === "edit" ? "Save Changes" : "Add Location"}
      onClose={onClose}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <FormItem>
          <FormLabel>Country</FormLabel>
          <Input value="Nigeria" disabled />
        </FormItem>

        <FormField
          name="state"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-14">
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NG_REGION_CODES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="area"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ikeja"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError && (
          <p className="text-sm text-red-600">
            Failed to add zone location. Please try again.
          </p>
        )}
      </Form>
    </FormModal>
  );
}
