"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { format, parseISO, isValid as isValidDate } from "date-fns";
import type { ContactEmailStatus } from "../types/contact-email.type";
import Link from "next/link";
import {
  useGetContactEmail,
  useUpdateContactEmailStatus,
} from "../hooks/use-contact-emails";
import {
  ArrowLeft,
  Reply,
  Mail,
  MailOpen,
  Archive,
  ShieldAlert,
} from "lucide-react";

function toDate(raw: any): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return isValidDate(raw) ? raw : null;
  if (typeof raw === "string") {
    const d = parseISO(raw);
    return isValidDate(d) ? d : null;
  }
  const d = new Date(raw);
  return isValidDate(d) ? d : null;
}

function fmtFull(raw: any) {
  const d = toDate(raw);
  if (!d) return "—";
  return format(d, "PPpp"); // e.g. Jan 6, 2026 at 3:42 PM
}

function buildMailto(args: {
  to: string;
  subject?: string | null;
  body?: string | null;
}) {
  const subject = args.subject?.trim() || "Re: Your message";
  const body = args.body?.trim() || "";
  const url = new URL(`mailto:${args.to}`);
  url.searchParams.set("subject", subject);
  if (body) url.searchParams.set("body", body);
  return url.toString();
}

export function ContactEmailDetailClient({ id }: { id: string }) {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();

  const { data, isLoading, error } = useGetContactEmail(session, axios, id);
  const statusMut = useUpdateContactEmailStatus(axios, id);

  // auto mark as read once loaded (only if currently new)
  useEffect(() => {
    if (!data) return;
    if (data.status !== "new") return;

    statusMut.mutate("read", {
      onSuccess: () => toast.success("Marked as read"),
      onError: () => toast.error("Failed to mark as read"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  const fromName = data?.name?.trim() || "—";
  const fromEmail = data?.email?.trim() || "—";
  const subject = data?.subject?.trim() || "(no subject)";
  const message = data?.message?.trim() || "—";

  const mailto = useMemo(() => {
    if (!data?.email) return "#";

    const quoted = [
      "",
      "",
      "----",
      `On ${fmtFull(data.createdAt)}, ${data.name ?? data.email} wrote:`,
      message,
    ].join("\n");

    return buildMailto({
      to: data.email,
      subject: `Re: ${data.subject ?? "Message"}`,
      body: quoted,
    });
  }, [data?.email, data?.subject, data?.name, data?.createdAt, message]);

  if (authStatus === "loading" || isLoading) return <Loading />;

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">Message not found.</p>
        <Link className="text-primary underline" href="/contact-emails">
          Back to inbox
        </Link>
      </div>
    );
  }

  const setStatus = (s: ContactEmailStatus) => {
    statusMut.mutate(s, {
      onSuccess: () => toast.success(`Status updated to "${s}"`),
      onError: (e: any) => toast.error(e?.message ?? "Failed to update status"),
    });
  };

  return (
    <section className="w-full">
      {/* Gmail-like top bar */}
      <div className="sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 py-3">
          <div className="flex items-center gap-1">
            <Link href="/contact-emails" aria-label="Back to inbox">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStatus("new")}
              disabled={statusMut.isPending}
              aria-label="Mark as new"
              title="Mark as new"
            >
              <Mail className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStatus("read")}
              disabled={statusMut.isPending}
              aria-label="Mark as read"
              title="Mark as read"
            >
              <MailOpen className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStatus("archived")}
              disabled={statusMut.isPending}
              aria-label="Archive"
              title="Archive"
            >
              <Archive className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStatus("spam")}
              disabled={statusMut.isPending}
              aria-label="Mark as spam"
              title="Spam"
            >
              <ShieldAlert className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gmail-like message card (single column) */}
      <div className="mx-auto w-full px-4 py-6">
        <div className="">
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="truncate text-2xl font-semibold">{subject}</h1>
              </div>
            </div>
          </div>
          <div className="py-5 md:py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <div className="font-semibold truncate">{fromName}</div>
                  <a
                    className="text-sm text-muted-foreground hover:underline truncate"
                    href={`mailto:${fromEmail}`}
                  >
                    &lt;{fromEmail}&gt;
                  </a>
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  <span className="mr-2">to</span>
                  <span className="font-medium text-foreground">me</span>
                </div>
              </div>

              <div className="shrink-0 text-xs text-muted-foreground">
                {fmtFull(data.createdAt)}
                <a href={mailto} aria-label="Reply">
                  <Button variant="link">
                    <Reply className="h-5 w-5 size-10" />
                  </Button>
                </a>
              </div>
            </div>

            {(data.phone || data.company) && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {data.phone ? (
                  <span>
                    <span className="text-muted-foreground">
                      Contact Phone:
                    </span>{" "}
                    <span className="font-medium text-base text-foreground">
                      {data.phone}
                    </span>
                  </span>
                ) : null}
                {data.company ? (
                  <span className="px-3 py-1">
                    <span className="text-muted-foreground">Company:</span>{" "}
                    <span className="font-medium text-foreground">
                      {data.company}
                    </span>
                  </span>
                ) : null}
              </div>
            )}

            <div className="mt-5 whitespace-pre-wrap rounded-lg py-4 text-sm leading-6 ">
              {message}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <a href={mailto}>
            <Button variant="clean">
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
