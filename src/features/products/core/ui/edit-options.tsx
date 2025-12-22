/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FaPlus } from "react-icons/fa6";
import { DeleteIconDialog } from "@/shared/ui/delete-dialog-icon";
import { GiHamburgerMenu } from "react-icons/gi";

export const EditableOption = ({
  options,
  createOptionValue,
  deleteOptionDisabled,
  deleteValueDisabled,
}: {
  options: any[];
  createOptionValue: any;
  // optional: pass disabled flags from parent if you want
  deleteOptionDisabled?: boolean;
  deleteValueDisabled?: boolean;
  productId: string;
}) => {
  const [openOptionId, setOpenOptionId] = useState<string | null>(null);

  // store input per option (so typing in one doesn't affect another)
  const [newValueByOption, setNewValueByOption] = useState<
    Record<string, string>
  >({});

  const toggle = (optionId: string) => {
    setOpenOptionId((prev) => (prev === optionId ? null : optionId));
  };

  const setNewValue = (optionId: string, value: string) => {
    setNewValueByOption((prev) => ({ ...prev, [optionId]: value }));
  };

  const addValue = async (optionId: string) => {
    const next = (newValueByOption[optionId] ?? "").trim();
    if (!next) return;

    await createOptionValue.mutateAsync({ optionId, value: next });

    // clear only this option input
    setNewValue(optionId, "");
  };

  const isBusy = !!createOptionValue?.isPending;

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const isOpen = openOptionId === opt.id;
        const inputVal = newValueByOption[opt.id] ?? "";

        return (
          <div
            key={opt.id}
            className="rounded-md border cursor-pointer"
            onClick={() => toggle(opt.id)}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between gap-2 px-5 py-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{opt.name}</div>
                <div className="text-xs text-muted-foreground">
                  {opt.values?.length ?? 0} values
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GiHamburgerMenu />
                {/* Edit = toggle accordion */}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => toggle(opt.id)}
                  disabled={isBusy}
                >
                  Edit
                </Button>

                {/* Delete option */}
                <DeleteIconDialog
                  endpoint={`/api/catalog/options/${opt.id}`}
                  refetchKey="product-options"
                  successMessage="Option deleted"
                  title="Delete option?"
                  description="This will delete the option and all its values."
                  disabled={deleteOptionDisabled || isBusy}
                />
              </div>
            </div>

            {/* PANEL */}
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="p-3 space-y-4">
                  {/* Values */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Values
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(opt.values ?? []).length ? (
                        opt.values.map((v: any) => (
                          <Badge
                            key={v.id}
                            variant="outline"
                            className="gap-2 px-4"
                          >
                            <span>{v.value}</span>
                            <DeleteIconDialog
                              endpoint={`/api/catalog/option-values/${v.id}`}
                              refetchKey="product-options"
                              successMessage="Value deleted"
                              title="Delete value?"
                              description="This removes the value from the option."
                              disabled={deleteValueDisabled || isBusy}
                              useIconButton={true}
                            />
                          </Badge>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No values yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add value */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Add value
                    </p>

                    <div className="flex items-center gap-2">
                      <Input
                        value={inputVal}
                        onChange={(e) => setNewValue(opt.id, e.target.value)}
                        placeholder="e.g. Small, Red, 500ml"
                        className="h-9"
                        disabled={isBusy}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addValue(opt.id);
                        }}
                      />
                      <Button
                        type="button"
                        variant="clean"
                        disabled={isBusy || !inputVal.trim()}
                        onClick={() => addValue(opt.id)}
                        className="h-10 text-xs"
                      >
                        <FaPlus />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Close */}
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="clean"
                      size="sm"
                      onClick={() => setOpenOptionId(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
