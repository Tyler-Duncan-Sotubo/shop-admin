import {
  FaUsersCog,
  FaLock,
  FaClipboardCheck,
  FaBuilding,
  FaStore,
  FaPercentage,
  FaFileInvoiceDollar,
} from "react-icons/fa";

export const settingsItems = [
  // -----------------
  // Personal settings
  // -----------------
  {
    category: "Personal settings",
    title: "Personal Details",
    description:
      "Manage your personal information, business details, branding, and company profile.",
    link: "/settings/profile",
    icon: <FaBuilding size={20} />, // or FaUser, whichever you prefer
  },
  {
    category: "Personal settings",
    title: "Developers",
    description:
      "Manage your personal information, business details, branding, and company profile.",
    link: "/settings/developers",
    icon: <FaBuilding size={20} />, // or FaUser, whichever you prefer
  },

  // -----------------
  // Account Settings
  // -----------------
  {
    category: "Account Settings",
    title: "Business",
    description:
      "Configure store name, storefront URL, time zone, and other general settings.",
    // maps to generalSettings: general.store_name, general.storefront_url, etc.
    link: "/settings/account",
    icon: <FaStore size={20} />,
  },
  {
    category: "Account Settings",
    title: "Team and security",
    description:
      "Manage user roles, access levels, Manage 2FA requirements and team security configuration.",
    link: "/settings/access-control",
    icon: <FaUsersCog size={20} />,
  },
  {
    category: "Account Settings",
    title: "Permissions",
    description: "Fine-tune user permissions and role-based access control.",
    link: "/settings/permissions",
    icon: <FaLock size={20} />,
  },
  {
    category: "Account Settings",
    title: "Audit Logs",
    description:
      "Track and review user actions and configuration changes across the system.",
    link: "/settings/audit-logs",
    icon: <FaClipboardCheck size={20} />,
  },

  // Billing Settings
  {
    category: "Billing Settings",
    title: "Invoice Template",
    description:
      "Customize your invoice templates, including layout, branding, and information displayed.",
    link: "/settings/invoice-template",
    icon: <FaFileInvoiceDollar size={20} />,
  },
  {
    category: "Billing Settings",
    title: "Tax Settings",
    description:
      "Configure tax rates, rules, and regions for accurate tax calculations.",
    link: "/settings/tax-settings",
    icon: <FaPercentage size={20} />,
  },
];
