"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Category } from "../types/category.type";
import { CategoryFormValues, CategorySchema } from "../schema/category.schema";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initial?: Category | null;
  allCategories: Category[];
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  submitError?: string | null;
};

export function CategoryFormModal({
  open,
  onClose,
  mode,
  initial,
  allCategories,
  onSubmit,
  submitError,
}: Props) {
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
      isActive: true,
    },
  });

  // reset when opening different record
  useEffect(() => {
    form.reset({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      parentId: initial?.parentId ?? null,
      isActive: initial?.isActive ?? true,
    });
  }, [initial, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const parentOptions = useMemo(() => {
    const selfId = initial?.id; // don’t allow selecting itself as parent
    return allCategories.filter((c) => c.id !== selfId);
  }, [allCategories, initial?.id]);

  const submit = async (values: CategoryFormValues) => {
    setLocalError(null);

    if (mode === "edit" && initial?.id && values.parentId === initial.id) {
      setLocalError("Category cannot have itself as parent.");
      return;
    }

    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add category" : "Edit category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Shoes" {...field} />
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
                  <FormLabel>Parent category</FormLabel>
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
                      Inactive categories won’t show in storefront filters.
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

            {(submitError || localError) && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {submitError ?? localError}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="clean" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
