import type { ContactEmailStatus } from "../types/contact-email.type";

export type ContactEmailTab = "all" | "new" | "read" | "archived" | "spam";

export const CONTACT_EMAIL_TAB_TO_STATUS: Record<
  ContactEmailTab,
  ContactEmailStatus | undefined
> = {
  all: undefined,
  new: "new",
  read: "read",
  archived: "archived",
  spam: "spam",
} as const;
