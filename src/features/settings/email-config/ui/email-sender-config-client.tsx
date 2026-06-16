// features/email-marketing/components/email-sender-config-client.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { toast } from "sonner";
import {
  useGetEmailSenderConfig,
  useUpsertEmailSenderConfig,
} from "../hooks/use-email-sender-config";
import {
  EmailSenderConfigSchema,
  type EmailSenderConfigValues,
} from "../schema/email-sender-config.schema";
import type { SocialLinks } from "../types/email-sender-config.types";
import { CampaignImageUpload } from "@/features/marketing/campaigns/ui/campaign-image-upload";

export function EmailSenderConfigClient() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();

  const { data: config, isLoading } = useGetEmailSenderConfig(session, axios);
  const upsert = useUpsertEmailSenderConfig(session, axios);

  const form = useForm<EmailSenderConfigValues>({
    resolver: zodResolver(EmailSenderConfigSchema),
    defaultValues: {
      fromEmail: "",
      fromName: "",
      logoUrl: null,
      brandColor: "#111111",
      companyAddress: null,
      footerTagline: null,
      twitter: null,
      facebook: null,
      instagram: null,
      youtube: null,
    },
  });

  // ── Populate form when config loads ─────────────────────
  useEffect(() => {
    if (!config) return;

    let social: SocialLinks = {};
    try {
      if (config.socialLinks) social = JSON.parse(config.socialLinks);
    } catch {
      social = {};
    }

    form.reset({
      fromEmail: config.fromEmail ?? "",
      fromName: config.fromName ?? "",
      logoUrl: config.logoUrl ?? null,
      brandColor: config.brandColor ?? "#111111",
      companyAddress: config.companyAddress ?? null,
      footerTagline: config.footerTagline ?? null,
      twitter: social.twitter ?? null,
      facebook: social.facebook ?? null,
      instagram: social.instagram ?? null,
      youtube: social.youtube ?? null,
    });
  }, [config, form]);

  const onSubmit = async (values: EmailSenderConfigValues) => {
    const socialLinks: SocialLinks = {
      twitter: values.twitter || null,
      facebook: values.facebook || null,
      instagram: values.instagram || null,
      youtube: values.youtube || null,
    };

    // only include socialLinks if at least one is set
    const hasSocial = Object.values(socialLinks).some(Boolean);

    try {
      await upsert.mutateAsync({
        fromEmail: values.fromEmail,
        fromName: values.fromName,
        logoUrl: values.logoUrl ?? null,
        brandColor: values.brandColor ?? null,
        companyAddress: values.companyAddress ?? null,
        footerTagline: values.footerTagline ?? null,
        socialLinks: hasSocial ? JSON.stringify(socialLinks) : null,
      });
      toast.success("Email settings saved");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    }
  };

  if (isLoading || authStatus === "loading") return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Marketing"
        description="Configure how your campaign emails are sent and displayed."
        tooltip="These settings apply to all email campaigns sent from your store."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── LEFT ── */}
            <div className="lg:col-span-8 space-y-6">
              {/* Sender details */}
              <div className="rounded-lg border p-6 space-y-4">
                <SectionHeading>Sender details</SectionHeading>
                <p className="text-sm text-muted-foreground">
                  This is what recipients see as the sender of your campaigns.
                </p>

                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Serene Supplies" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Shown as the sender name in the inbox
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. hello@serene.ng"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be a verified domain in Resend
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Branding */}
              <div className="rounded-lg border p-6 space-y-4">
                <SectionHeading>Branding</SectionHeading>
                <p className="text-sm text-muted-foreground">
                  Your logo and brand colour appear in every campaign email.
                </p>

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <CampaignImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          label="Upload your logo"
                          aspectRatio="hero"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: PNG with transparent background, min 200px
                        wide
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand colour</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={field.value ?? "#111111"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded border
                              border-input bg-background p-1"
                          />
                          <Input
                            placeholder="#111111"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            className="w-36 font-mono"
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Used for the header background and CTA buttons
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Footer */}
              <div className="rounded-lg border p-6 space-y-4">
                <SectionHeading>Footer</SectionHeading>
                <p className="text-sm text-muted-foreground">
                  Shown at the bottom of every campaign email.
                </p>

                <FormField
                  control={form.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 14 Admiralty Way, Lekki, Lagos"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for CAN-SPAM compliance
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="footerTagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer tagline (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Quality you can trust"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Social links */}
              <div className="rounded-lg border p-6 space-y-4">
                <SectionHeading>Social links (optional)</SectionHeading>
                <p className="text-sm text-muted-foreground">
                  Social icons appear in the footer of your campaign emails.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter / X</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://twitter.com/yourhandle"
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
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://facebook.com/yourpage"
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
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://instagram.com/yourhandle"
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
                    name="youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://youtube.com/@yourchannel"
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

              {/* Submit */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={upsert.isPending}
                  isLoading={upsert.isPending}
                >
                  Save settings
                </Button>
              </div>
            </div>

            {/* ── RIGHT — preview ── */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="rounded-lg border p-4 space-y-3 sticky top-6">
                <p className="text-sm font-medium">Email footer preview</p>
                <FooterPreview
                  fromName={form.watch("fromName") || "Your Store"}
                  logoUrl={form.watch("logoUrl")}
                  brandColor={form.watch("brandColor") ?? "#111111"}
                  address={form.watch("companyAddress")}
                  tagline={form.watch("footerTagline")}
                  twitter={form.watch("twitter")}
                  facebook={form.watch("facebook")}
                  instagram={form.watch("instagram")}
                  youtube={form.watch("youtube")}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

// ── Footer preview ────────────────────────────────────────────
function FooterPreview({
  fromName,
  logoUrl,
  brandColor,
  address,
  tagline,
  twitter,
  facebook,
  instagram,
  youtube,
}: {
  fromName: string;
  logoUrl?: string | null;
  brandColor: string;
  address?: string | null;
  tagline?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
}) {
  const hasSocial = twitter || facebook || instagram || youtube;

  return (
    <div
      className="rounded-lg overflow-hidden border text-center"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* Header preview */}
      <div
        className="py-4 px-4 flex items-center justify-center"
        style={{ backgroundColor: brandColor }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={fromName} className="h-8 object-contain" />
        ) : (
          <span className="text-white font-bold text-sm">{fromName}</span>
        )}
      </div>

      {/* Footer preview */}
      <div
        className="px-4 py-6 space-y-3 text-center"
        style={{ backgroundColor: "#111111" }}
      >
        {hasSocial && (
          <div className="flex justify-center gap-2">
            {twitter && (
              <div
                className="w-7 h-7 rounded-full bg-gray-700 flex items-center
                justify-center"
              >
                <span style={{ fontSize: 8, color: "#888" }}>tw</span>
              </div>
            )}
            {facebook && (
              <div
                className="w-7 h-7 rounded-full bg-gray-700 flex items-center
                justify-center"
              >
                <span style={{ fontSize: 8, color: "#888" }}>fb</span>
              </div>
            )}
            {instagram && (
              <div
                className="w-7 h-7 rounded-full bg-gray-700 flex items-center
                justify-center"
              >
                <span style={{ fontSize: 8, color: "#888" }}>ig</span>
              </div>
            )}
            {youtube && (
              <div
                className="w-7 h-7 rounded-full bg-gray-700 flex items-center
                justify-center"
              >
                <span style={{ fontSize: 8, color: "#888" }}>yt</span>
              </div>
            )}
          </div>
        )}

        {tagline && <p style={{ fontSize: 11, color: "#aaaaaa" }}>{tagline}</p>}

        <p style={{ fontSize: 11, color: "#999999" }}>
          {fromName}
          {address ? ` | ${address}` : ""}
        </p>

        <p style={{ fontSize: 11, color: "#777777" }}>
          © {new Date().getFullYear()} | All rights reserved.
        </p>

        <p style={{ fontSize: 11, color: "#777777" }}>
          No longer want to receive these emails?{" "}
          <span className="underline" style={{ color: "#aaaaaa" }}>
            Unsubscribe
          </span>
        </p>
      </div>
    </div>
  );
}
