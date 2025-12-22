/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Checkbox } from "@/shared/ui/checkbox";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useCategories } from "../hooks/use-categories";
import { Category } from "../types/category.type";
import { FaPlus } from "react-icons/fa6";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CreateCategoryPayload = {
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  isActive: boolean;
};

type Props = {
  name: string; // e.g. "categoryIds"
  className?: string;

  onCreateCategory: (
    payload: CreateCategoryPayload,
    setError: (msg: string) => void
  ) => Promise<any>;
};

export function CategoryCheckboxPicker({
  name,
  className,
  onCreateCategory,
}: Props) {
  const { control, setValue } = useFormContext();
  const { categories, isLoading } = useCategories();

  // ---- Add new category UI state ----
  const [showCreate, setShowCreate] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createParentId, setCreateParentId] = React.useState<string | null>(
    null
  );
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  const resetCreate = () => {
    setCreateName("");
    setCreateParentId(null);
    setCreateError(null);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedIds = (field.value ?? []) as string[];

        const toggle = (id: string) => {
          const next = selectedIds.includes(id)
            ? selectedIds.filter((x) => x !== id)
            : [...selectedIds, id];

          field.onChange(next);
          setValue(name as any, next, {
            shouldValidate: true,
            shouldDirty: true,
          });
        };

        const handleCreate = async () => {
          setCreateError(null);

          const nameVal = createName.trim();
          if (!nameVal) {
            setCreateError("Category name is required.");
            return;
          }

          setCreating(true);
          try {
            const payload: CreateCategoryPayload = {
              name: nameVal,
              slug: slugify(nameVal),
              parentId: createParentId,
              description: null,
              isActive: true,
            };

            const created = await onCreateCategory(payload, (msg) =>
              setCreateError(msg)
            );
            const newId = created?.id ?? created?.data?.id;

            if (newId) {
              const next = Array.from(new Set([...selectedIds, newId]));
              field.onChange(next);
              setValue(name as any, next, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }

            resetCreate();
            setShowCreate(false);
          } finally {
            setCreating(false);
          }
        };

        return (
          <FormItem className={className}>
            {/* Create panel */}
            {showCreate ? (
              <div className="rounded-md border p-3 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Collection Name</div>
                    <Input
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="e.g. Summer collection"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Parent collection</div>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={createParentId ?? ""}
                      onChange={(e) =>
                        setCreateParentId(
                          e.target.value ? e.target.value : null
                        )
                      }
                    >
                      <option value="">No parent</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {createError ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      {createError}
                    </div>
                  ) : null}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetCreate();
                        setShowCreate(false);
                      }}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreate}
                      disabled={creating}
                    >
                      {creating ? "Creating..." : "Create category"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <FormControl>
              <div className="max-h-72 overflow-auto border p-2 space-y-1 rounded-md">
                {isLoading ? (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    Loading collections...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    No collections found.
                  </div>
                ) : (
                  categories.map((c: Category) => {
                    const checked = selectedIds.includes(c.id);

                    return (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggle(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle(c.id);
                          }
                        }}
                        className="w-full flex items-center justify-between gap-3 px-2 py-1 hover:bg-muted/40 cursor-pointer rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggle(c.id)}
                            />
                          </div>

                          <div className="text-left">
                            <div className="text-xs font-medium">{c.name}</div>
                          </div>
                        </div>

                        {!c.isActive ? (
                          <Badge variant="outline">Inactive</Badge>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </FormControl>

            <FormMessage />

            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0"
              onClick={() => {
                setShowCreate((v) => !v);
                setCreateError(null);
              }}
            >
              <FaPlus className="mr-2 h-3.5 w-3.5" />
              {showCreate ? "Close" : "Add new category"}
            </Button>
          </FormItem>
        );
      }}
    />
  );
}
