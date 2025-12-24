/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

function stripHtmlToText(html: string) {
  return (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, n: number) {
  const str = (s || "").trim();
  if (!str) return "";
  if (str.length <= n) return str;
  return str.slice(0, n).trimEnd() + "…";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SeoQuickPanelProps = {
  form: UseFormReturn<any>;
  className?: string;
  allowSlugEdit?: boolean;
  autoSuggest?: boolean;

  /** Used for Google-like preview */
  siteUrl?: string; // e.g. "https://example.com"
  slugPrefix?: string; // e.g. "blog" => https://example.com/blog/{slug}
};

export function SeoQuickPanel({
  form,
  className,
  allowSlugEdit = true,
  autoSuggest = true,
  siteUrl = "https://example.com",
  slugPrefix = "post",
}: SeoQuickPanelProps) {
  const [open, setOpen] = React.useState(false);

  const postTitle = form.watch("title") as string;
  const contentHtml = form.watch("content") as string;

  const seoTitle = form.watch("seoTitle") as string;
  const seoDescription = form.watch("seoDescription") as string;
  const slug = form.watch("slug") as string;

  const contentText = React.useMemo(
    () => stripHtmlToText(contentHtml || ""),
    [contentHtml]
  );

  // Suggestions (used only when empty)
  const suggestedSeoTitle = React.useMemo(
    () => truncate(postTitle || "", 60),
    [postTitle]
  );
  const suggestedSeoDescription = React.useMemo(
    () => truncate(contentText || "", 160),
    [contentText]
  );
  const suggestedSlug = React.useMemo(
    () => slugify(postTitle || ""),
    [postTitle]
  );

  // Auto-fill only if empty (keeps user edits)
  React.useEffect(() => {
    if (!autoSuggest) return;

    const currentSeoTitle = (
      (form.getValues("seoTitle") as string) ?? ""
    ).trim();
    if (!currentSeoTitle && suggestedSeoTitle.trim()) {
      form.setValue("seoTitle", suggestedSeoTitle, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    const currentSeoDesc = (
      (form.getValues("seoDescription") as string) ?? ""
    ).trim();
    if (!currentSeoDesc && suggestedSeoDescription.trim()) {
      form.setValue("seoDescription", suggestedSeoDescription, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    const currentSlug = ((form.getValues("slug") as string) ?? "").trim();
    if (!currentSlug && suggestedSlug.trim()) {
      form.setValue("slug", suggestedSlug, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedSeoTitle, suggestedSeoDescription, suggestedSlug, autoSuggest]);

  const effectiveSeoTitle = (seoTitle || "").trim() || suggestedSeoTitle;
  const effectiveSeoDescription =
    (seoDescription || "").trim() || suggestedSeoDescription;
  const effectiveSlug = (slug || "").trim() || suggestedSlug;

  // Google-like preview URL line
  const previewUrl = React.useMemo(() => {
    const base = siteUrl.replace(/\/+$/, "");
    const prefix = slugPrefix ? `/${slugPrefix.replace(/^\/+|\/+$/g, "")}` : "";
    const s = effectiveSlug ? `/${effectiveSlug}` : "";
    return `${base}${prefix}${s}`;
  }, [siteUrl, slugPrefix, effectiveSlug]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* ✅ SERP-like preview (no badges/counters here) */}
      <div className="space-y-2">
        <div className="text-[11px] text-muted-foreground break-all">
          {previewUrl}
        </div>

        <div className="text-base font-semibold text-primary leading-snug">
          {effectiveSeoTitle || "—"}
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed">
          {effectiveSeoDescription || "—"}
        </div>

        <div className="pt-2">
          <Button type="button" variant="clean" onClick={() => setOpen(true)}>
            Edit Snippet
          </Button>
        </div>
      </div>

      {/* ✅ Modal contains char checks + score + focus keyword (optional) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>SEO settings</DialogTitle>
          </DialogHeader>

          <div className="">
            {/* Right: SERP preview only */}
            <div className="space-y-4 mb-5">
              <div className=" space-y-2">
                <div className="text-xs text-muted-foreground break-all">
                  {previewUrl}
                </div>
                <div className="text-lg font-semibold text-primary leading-snug">
                  {effectiveSeoTitle || "—"}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {effectiveSeoDescription || "—"}
                </div>
              </div>
            </div>
            {/* Left: fields */}
            <div className="lg:col-span-7 space-y-5">
              {/* Optional Focus Keyword field (only if you have it in your form schema) */}
              {"focusKeyword" in (form.getValues() as any) ? (
                <FormField
                  control={form.control}
                  name="focusKeyword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus keyword</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. waterproof mattress protector"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {/* SEO title */}
              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>SEO title</FormLabel>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {(field.value ?? "").length}/70
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Defaults to post title"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SEO description */}
              <FormField
                control={form.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>SEO description</FormLabel>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {(field.value ?? "").length}/160
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="h-28 resize-none"
                        placeholder="Defaults to the first 160 chars of content"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>Permalink</FormLabel>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {(field.value ?? "").length}/240
                      </span>
                    </div>

                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(slugify(e.target.value))
                        }
                        readOnly={!allowSlugEdit}
                        className={!allowSlugEdit ? "bg-muted/40" : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="clean"
                  onClick={() => {
                    form.setValue("seoTitle", suggestedSeoTitle, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  Use post title
                </Button>

                <Button
                  type="button"
                  variant="clean"
                  onClick={() => {
                    form.setValue("seoDescription", suggestedSeoDescription, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  Use first 160 chars of content
                </Button>

                <Button
                  type="button"
                  variant="clean"
                  onClick={() => {
                    form.setValue("slug", suggestedSlug, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  disabled={!allowSlugEdit}
                >
                  Regenerate permalink
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="clean"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
