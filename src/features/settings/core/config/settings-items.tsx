import {
  FaUsersCog,
  FaLock,
  FaClipboardCheck,
  FaBuilding,
  FaPercentage,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaCode,
  FaStore,
} from "react-icons/fa";

export const settingsItems = [
  // -----------------
  // Personal
  // -----------------
  {
    category: "Personal",
    title: "Personal Details",
    description: "Manage your profile information and personal preferences.",
    link: "/settings/profile",
    icon: <FaBuilding size={20} />,
  },

  // -----------------
  // Organization
  // -----------------
  {
    category: "Organization",
    title: "Business",
    description:
      "Manage company-wide settings like business name, time zone, and defaults.",
    link: "/settings/account",
    icon: <FaBuilding size={20} />,
  },

  {
    category: "Organization",
    title: "Stores",
    description:
      "Manage your online stores, domains, and storefront configuration.",
    link: "/settings/stores",
    icon: <FaStore size={20} />,
  },

  {
    category: "Organization",
    title: "Team & Security",
    description:
      "Manage users, roles, access levels, and security requirements.",
    link: "/settings/access-control",
    icon: <FaUsersCog size={20} />,
  },

  {
    category: "Organization",
    title: "Permissions",
    description: "Control what different roles can see and do.",
    link: "/settings/permissions",
    icon: <FaLock size={20} />,
  },

  {
    category: "Organization",
    title: "Audit Logs",
    description:
      "Review important actions and configuration changes across the system.",
    link: "/settings/audit-logs",
    icon: <FaClipboardCheck size={20} />,
  },

  // -----------------
  // Payments
  // -----------------
  {
    category: "Payments",
    title: "Payment Methods",
    description:
      "Enable and manage payment options like cards, bank transfer, and providers.",
    link: "/settings/payment-methods",
    icon: <FaCreditCard size={20} />,
  },

  // -----------------
  // Billing & Taxes
  // -----------------
  {
    category: "Billing & Taxes",
    title: "Invoice Template",
    description:
      "Customize invoice layout, branding, and displayed business information.",
    link: "/settings/invoice-template",
    icon: <FaFileInvoiceDollar size={20} />,
  },

  {
    category: "Billing & Taxes",
    title: "Tax Settings",
    description:
      "Configure tax rates, rules, and regions for accurate calculations.",
    link: "/settings/tax-settings",
    icon: <FaPercentage size={20} />,
  },

  // -----------------
  // Advanced
  // -----------------
  {
    category: "Advanced",
    title: "API & Webhooks",
    description:
      "Manage API keys and integrations for developers and external systems.",
    link: "/settings/developers",
    icon: <FaCode size={20} />,
  },
];
