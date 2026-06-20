import {
  FaUsersCog,
  FaClipboardCheck,
  FaBuilding,
  FaPercentage,
  FaFileInvoiceDollar,
  FaStore,
  FaUser,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import type { ReactNode } from "react";

export type SettingsItem = {
  category: string;
  title: string;
  description: string;
  link: string;
  icon: ReactNode;
  permissions?: readonly string[];
};

export const settingsItems: readonly SettingsItem[] = [
  // ── Personal ─────────────────────────────────────────────
  {
    category: "Personal",
    title: "Profile",
    description: "Update your name, avatar, and personal preferences.",
    link: "/settings/profile",
    icon: <FaUser size={20} />,
  },

  // ── Organization ─────────────────────────────────────────
  {
    category: "Organization",
    title: "Business Details",
    description:
      "Configure your business name, timezone, and company-wide defaults.",
    link: "/settings/account",
    icon: <FaBuilding size={20} />,
    permissions: ["settings.read", "settings.manage_general"],
  },
  {
    category: "Organization",
    title: "Stores",
    description: "Manage your stores, domains, and storefront settings.",
    link: "/settings/stores",
    icon: <FaStore size={20} />,
    permissions: ["stores.read"],
  },
  {
    category: "Organization",
    title: "Team & Access Control",
    description:
      "Manage team members, roles, permissions, and security policies.",
    link: "/settings/access-control",
    icon: <FaUsersCog size={20} />,
    permissions: ["users.read", "roles.read", "permissions.read"],
  },
  {
    category: "Organization",
    title: "Audit Logs",
    description:
      "Track important actions and configuration changes across your account.",
    link: "/settings/audit-logs",
    icon: <FaClipboardCheck size={20} />,
    permissions: ["audit.logs.read"],
  },

  // ── Marketing ────────────────────────────────────────────
  {
    category: "Marketing",
    title: "Email Configuration",
    description:
      "Configure your sender email, display name, logo, brand colour, and footer details for campaigns.",
    link: "/settings/email-configuration",
    icon: <MdEmail size={20} />,
  },
];
