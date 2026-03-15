import {
  FaUsersCog,
  FaClipboardCheck,
  FaBuilding,
  FaPercentage,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaCode,
  FaStore,
  FaPlug,
  FaMapMarkedAlt,
  FaUser,
} from "react-icons/fa";

export const settingsItems = [
  // -----------------
  // Personal
  // -----------------
  {
    category: "Personal",
    title: "Profile",
    description: "Update your name, avatar, and personal preferences.",
    link: "/settings/profile",
    icon: <FaUser size={20} />,
  },

  // -----------------
  // Organization
  // -----------------
  {
    category: "Organization",
    title: "Business Details",
    description:
      "Configure your business name, timezone, and company-wide defaults.",
    link: "/settings/account",
    icon: <FaBuilding size={20} />,
  },
  {
    category: "Organization",
    title: "Stores",
    description: "Manage your stores, domains, and storefront settings.",
    link: "/settings/stores",
    icon: <FaStore size={20} />,
  },
  {
    category: "Organization",
    title: "Team & Access Control",
    description:
      "Manage team members, roles, permissions, and security policies.",
    link: "/settings/access-control",
    icon: <FaUsersCog size={20} />,
  },
  {
    category: "Organization",
    title: "Audit Logs",
    description:
      "Track important actions and configuration changes across your account.",
    link: "/settings/audit-logs",
    icon: <FaClipboardCheck size={20} />,
  },

  // -----------------
  // Inventory
  // -----------------
  {
    category: "Inventory",
    title: "Locations",
    description:
      "Manage warehouses and store locations where stock is held and tracked.",
    link: "/settings/inventory/locations",
    icon: <FaMapMarkedAlt size={20} />,
  },

  // -----------------
  // Payments
  // -----------------
  {
    category: "Payments",
    title: "Payment Methods",
    description:
      "Enable and configure payment options including cards, bank transfers, and providers.",
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
      "Customise your invoice layout, branding, and displayed business information.",
    link: "/settings/invoice-template",
    icon: <FaFileInvoiceDollar size={20} />,
  },
  {
    category: "Billing & Taxes",
    title: "Tax Settings",
    description:
      "Set up tax rates, rules, and regions for accurate calculations at checkout.",
    link: "/settings/tax-settings",
    icon: <FaPercentage size={20} />,
  },

  // -----------------
  // Developer
  // -----------------
  {
    category: "Developer",
    title: "API & Webhooks",
    description:
      "Generate API keys and configure webhooks for external integrations.",
    link: "/settings/developers",
    icon: <FaCode size={20} />,
  },
  {
    category: "Developer",
    title: "Integrations",
    description:
      "Connect third-party services including payment providers, shipping, and other tools.",
    link: "/settings/integrations",
    icon: <FaPlug size={20} />,
  },
];
