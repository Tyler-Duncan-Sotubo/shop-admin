// features/campaigns/builder/fields/newsletter-fields.tsx
"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Trash2, Plus } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { CampaignBuilderValues } from "../schema/campaign.schema";
import { CampaignImageUpload } from "./campaign-image-upload";

type Props = {
  form: UseFormReturn<CampaignBuilderValues>;
};

export function NewsletterFields({ form }: Props) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  return (
    <div className="space-y-8">
      {/* ── Hero section ──────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading>Hero section</SectionHeading>
        <p className="text-xs text-muted-foreground">
          Full-width background image with an overlaid text box. All fields
          optional.
        </p>

        {/* Hero image — upload instead of URL */}
        <FormField
          control={form.control}
          name="heroImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero image</FormLabel>
              <FormControl>
                <CampaignImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  label="Upload hero background image"
                  aspectRatio="hero"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="heroTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Small title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. SUMMER"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Appears above the big headline
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heroHighlight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Big headline</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. SALE"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Large bold text in the centre
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount label</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. SAVE UP TO"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount value</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 25% OFF"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="promoCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. SUMMER25"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Shown as &quot;WITH CODE: SUMMER25&quot;
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Body text ─────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading>Body text</SectionHeading>
        <p className="text-xs text-muted-foreground">
          Optional message shown below the hero. Supports basic HTML.
        </p>
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write your message here..."
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  className="h-32 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Product grid ──────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading>Product grid</SectionHeading>
        <p className="text-xs text-muted-foreground">
          2-column product grid. Add up to 4 products.
        </p>

        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="rounded-lg border p-4 space-y-3 bg-muted/20"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Product {idx + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(idx)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Product image — upload instead of URL */}
              <FormField
                control={form.control}
                name={`products.${idx}.imageUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product image</FormLabel>
                    <FormControl>
                      <CampaignImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Upload product image"
                        aspectRatio="square"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`products.${idx}.label`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Shop new releases"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`products.${idx}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. ₦25,000"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`products.${idx}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://your-store.com/products/..."
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        {fields.length < 4 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ imageUrl: "", label: "", url: "", price: "" })
            }
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add product
          </Button>
        )}
      </div>

      {/* ── CTA button ────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading>CTA button (optional)</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ctaText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button text</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Shop Now"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ctaUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://..."
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ── FAQ section ───────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading>Questions section (optional)</SectionHeading>
        <FormField
          control={form.control}
          name="faqText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Questions text</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Check out our FAQs or contact us here."
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Shown above the footer as &quot;Questions? [your text]&quot;
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
