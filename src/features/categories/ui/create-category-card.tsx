/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";

import { Category } from "../types/category.type";
import { CategorySchema, CategoryFormValues } from "../schema/category.schema";
import { SectionHeading } from "@/shared/ui/section-heading";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  categories: Category[];
  onCreate: (
    values: any,
    setError: (msg: string) => void,
    resetForm?: () => void
  ) => Promise<any>;
};

export function CreateCategoryCard({ categories, onCreate }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { activeStoreId } = useStoreScope();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
      isActive: true,
    },
  });

  const parentOptions = useMemo(() => categories, [categories]);

  const submit = async (values: CategoryFormValues) => {
    setSubmitError(null);

    const payload = {
      name: values.name,
      slug: slugify(values.name), // send slug only during creation
      description: values.description ?? null,
      parentId: values.parentId ?? null,
      isActive: values.isActive,
      storeId: activeStoreId, // include storeId in payload
    };

    await onCreate(
      payload,
      (msg) => setSubmitError(msg),
      () => form.reset()
    );
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <SectionHeading>Create collection</SectionHeading>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dresses" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Optional..."
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent collection</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? e.target.value : null)
                    }
                  >
                    <option value="">No parent</option>
                    {parentOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormDescription>
                  Optional. Helps build nested navigation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <FormLabel className="m-0">Active</FormLabel>
                  <FormDescription>
                    Inactive collections won’t show in storefront filters.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {submitError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Creating..." : "Create category"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
