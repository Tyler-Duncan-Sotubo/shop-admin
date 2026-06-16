// features/campaigns/builder/components/block-builder.tsx
"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Trash2,
  Plus,
  GripVertical,
  Columns,
  RectangleHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignBuilderValues } from "../../schema/campaign.schema";
import { nanoid } from "nanoid";
import { CampaignImageUpload } from "../../ui/campaign-image-upload";

type Props = {
  form: UseFormReturn<CampaignBuilderValues>;
};

export function BlockBuilder({ form }: Props) {
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "blocks",
  });

  const addBlock = (width: "full" | "half") => {
    append({ id: nanoid(), imageUrl: "", linkUrl: "", width });
  };

  return (
    <div className="space-y-4">
      {/* ── Block list ── */}
      {fields.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            No blocks yet
          </p>
          <p className="text-xs text-muted-foreground">
            Add a full-width or half-width image block below.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="rounded-lg border bg-card p-4 space-y-3"
          >
            {/* ── Block header ── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Block {idx + 1}</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    field.width === "full"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-purple-50 text-purple-600",
                  )}
                >
                  {field.width === "full" ? "Full width" : "Half width"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Toggle width */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-muted-foreground"
                  onClick={() =>
                    update(idx, {
                      ...field,
                      width: field.width === "full" ? "half" : "full",
                    })
                  }
                >
                  {field.width === "full" ? (
                    <>
                      <Columns className="h-3.5 w-3.5" />
                      Make half
                    </>
                  ) : (
                    <>
                      <RectangleHorizontal className="h-3.5 w-3.5" />
                      Make full
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* ── Image upload ── */}
            <CampaignImageUpload
              value={form.watch(`blocks.${idx}.imageUrl`)}
              onChange={(url) =>
                form.setValue(`blocks.${idx}.imageUrl`, url ?? "", {
                  shouldDirty: true,
                })
              }
              label={
                field.width === "full"
                  ? "Upload full-width image (600px wide)"
                  : "Upload half-width image (300px wide)"
              }
              aspectRatio={field.width === "full" ? "hero" : "square"}
            />

            {/* ── Link URL ── */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Link URL{" "}
                <span className="text-muted-foreground font-normal">
                  (optional — clicking image opens this link)
                </span>
              </Label>
              <Input
                placeholder="https://your-store.com/products/..."
                value={form.watch(`blocks.${idx}.linkUrl`) ?? ""}
                onChange={(e) =>
                  form.setValue(`blocks.${idx}.linkUrl`, e.target.value, {
                    shouldDirty: true,
                  })
                }
                className="text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Add block buttons ── */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock("full")}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <RectangleHorizontal className="h-3.5 w-3.5" />
          Full width
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock("half")}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <Columns className="h-3.5 w-3.5" />
          Half width
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: design your images in Canva at 600px wide (full) or 300px wide
        (half) for best results.
      </p>
    </div>
  );
}
