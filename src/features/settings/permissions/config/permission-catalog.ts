export type PermissionLevel = "none" | "view" | "manage" | "admin";

export type PermissionModuleCatalog = {
  moduleKey: string; // first segment before dot: e.g. "products" from "products.read"
  label: string; // UI label
  levels: {
    view: string[]; // permission KEYS
    manage: string[];
    admin: string[];
  };
};

export const PERMISSION_CATALOG: PermissionModuleCatalog[] = [
  {
    moduleKey: "products",
    label: "Products",
    levels: {
      view: ["products.read"],
      manage: [
        "products.create",
        "products.update",
        "products.publish",
        "products.manage_media",
        "products.manage_seo",
      ],
      admin: ["products.delete"],
    },
  },
  {
    moduleKey: "categories",
    label: "Categories",
    levels: {
      view: ["categories.read"],
      manage: ["categories.create", "categories.update"],
      admin: ["categories.delete"],
    },
  },
  {
    moduleKey: "attributes",
    label: "Attributes",
    levels: {
      view: ["attributes.read"],
      manage: ["attributes.manage"],
      admin: [],
    },
  },
  {
    moduleKey: "reviews",
    label: "Reviews",
    levels: {
      view: ["reviews.read"],
      manage: ["reviews.moderate"],
      admin: [],
    },
  },

  {
    moduleKey: "inventory",
    label: "Inventory",
    levels: {
      view: [
        "inventory.read",
        "inventory.items.read",
        "inventory.transfers.read",
        "inventory.adjustments.read",
      ],
      manage: [
        "inventory.items.update",
        "inventory.adjust",
        "inventory.manage_rules",
        "inventory.locations.assign",
        "inventory.transfer",
        "inventory.transfers.create",
        "inventory.transfers.update",
        "inventory.adjustments.create",
      ],
      admin: ["inventory.transfers.delete", "inventory.adjustments.approve"],
    },
  },
  {
    moduleKey: "locations",
    label: "Locations",
    levels: {
      view: ["locations.read"],
      manage: ["locations.create", "locations.update"],
      admin: ["locations.delete"],
    },
  },

  {
    moduleKey: "orders",
    label: "Orders",
    levels: {
      view: ["orders.read"],
      manage: [
        "orders.create",
        "orders.update",
        "orders.cancel",
        "orders.manual.create",
        "orders.manual.edit",
      ],
      admin: ["orders.refund", "orders.manual.delete"],
    },
  },
  {
    moduleKey: "fulfillment",
    label: "Fulfillment",
    levels: {
      view: [],
      manage: ["fulfillment.manage", "fulfillment.manage_returns"],
      admin: [],
    },
  },

  {
    moduleKey: "customers",
    label: "Customers",
    levels: {
      view: ["customers.read"],
      manage: ["customers.create", "customers.update"],
      admin: ["customers.delete"],
    },
  },

  {
    moduleKey: "discounts",
    label: "Discounts",
    levels: {
      view: ["discounts.read"],
      manage: ["discounts.create", "discounts.update"],
      admin: ["discounts.delete"],
    },
  },
  {
    moduleKey: "promotions",
    label: "Promotions",
    levels: {
      view: [],
      manage: ["promotions.manage"],
      admin: [],
    },
  },

  {
    moduleKey: "payments",
    label: "Payments",
    levels: {
      view: ["payments.read"],
      manage: ["payments.capture", "payments.manage_providers"],
      admin: ["payments.refund", "payments.write"],
    },
  },

  {
    moduleKey: "settings",
    label: "Settings",
    levels: {
      view: ["settings.read"],
      manage: [
        "settings.manage_general",
        "settings.manage_checkout",
        "settings.manage_payments",
        "settings.manage_tax",
        "settings.manage_security",
        "settings.manage_storefront",
      ],
      admin: [],
    },
  },

  {
    moduleKey: "stores",
    label: "Stores",
    levels: {
      view: ["stores.read"],
      manage: ["stores.create", "stores.update", "stores.manage_domains"],
      admin: ["stores.delete"],
    },
  },
  {
    moduleKey: "storefront",
    label: "Storefront",
    levels: {
      view: [],
      manage: [
        "storefront.manage_theme",
        "storefront.manage_menus",
        "storefront.manage_pages",
        "storefront.manage_banners",
      ],
      admin: [],
    },
  },

  {
    moduleKey: "users",
    label: "Users",
    levels: {
      view: ["users.read"],
      manage: ["users.invite", "users.update_roles"],
      admin: ["users.delete"],
    },
  },

  {
    moduleKey: "apikeys",
    label: "API Keys",
    levels: {
      view: ["apikeys.read"],
      manage: ["apikeys.create", "apikeys.update"],
      admin: ["apikeys.delete"],
    },
  },

  {
    moduleKey: "audit",
    label: "Audit Logs",
    levels: {
      view: ["audit.logs.read", "audit.auth.read"],
      manage: [],
      admin: [],
    },
  },

  {
    moduleKey: "permissions",
    label: "Permissions",
    levels: {
      view: ["permissions.read"],
      manage: ["permissions.manage"],
      admin: [],
    },
  },
  {
    moduleKey: "roles",
    label: "Roles",
    levels: {
      view: ["roles.read"],
      manage: ["roles.manage"],
      admin: [],
    },
  },

  {
    moduleKey: "carts",
    label: "Carts",
    levels: {
      view: ["carts.read"],
      manage: [
        "carts.create",
        "carts.update",
        "carts.items.create",
        "carts.items.update",
      ],
      admin: ["carts.items.delete"],
    },
  },

  {
    moduleKey: "shipping",
    label: "Shipping",
    levels: {
      view: [
        "shipping.zones.read",
        "shipping.carriers.read",
        "shipping.rates.read",
      ],
      manage: [
        "shipping.zones.create",
        "shipping.zones.update",
        "shipping.carriers.create",
        "shipping.carriers.update",
        "shipping.rates.create",
        "shipping.rates.update",
      ],
      admin: [
        "shipping.zones.delete",
        "shipping.carriers.delete",
        "shipping.rates.delete",
      ],
    },
  },

  {
    moduleKey: "billing",
    label: "Billing",
    levels: {
      view: [
        "billing.invoiceTemplates.read",
        "billing.invoiceTemplates.preview",
        "billing.invoiceBranding.read",
        "billing.invoices.read",
        "billing.invoices.pdf.preview",
        "billing.invoices.documents.read",
        "billing.payments.read",
        "billing.taxes.read",
      ],
      manage: [
        "billing.invoiceBranding.update",
        "billing.invoiceTemplates.seed",
        "billing.invoices.create",
        "billing.invoices.createFromOrder",
        "billing.invoices.updateDraft",
        "billing.invoices.recalculate",
        "billing.payments.create",
        "billing.payments.confirm",
        "billing.payments.allocate",
        "billing.taxes.create",
        "billing.taxes.update",
      ],
      admin: [
        "billing.invoices.pdf.generate",
        "billing.invoices.issue",
        "billing.invoices.void",
        "billing.payments.refund",
        "billing.taxes.delete",
      ],
    },
  },

  {
    moduleKey: "blog",
    label: "Blog",
    levels: {
      view: ["blog.posts.read"],
      manage: ["blog.posts.create", "blog.posts.update", "blog.posts.publish"],
      admin: ["blog.posts.delete"],
    },
  },

  {
    moduleKey: "media",
    label: "Media",
    levels: {
      view: [],
      manage: ["media.upload"],
      admin: ["media.delete"],
    },
  },

  {
    moduleKey: "analytics",
    label: "Analytics",
    levels: {
      view: ["analytics.read"],
      manage: ["analytics.write"],
      admin: [],
    },
  },

  {
    moduleKey: "quotes",
    label: "Quotes",
    levels: {
      view: ["quotes.read"],
      manage: ["quotes.create", "quotes.update"],
      admin: ["quotes.delete"],
    },
  },

  {
    moduleKey: "mail",
    label: "Email Marketing",
    levels: {
      view: ["mail.subscribers.read", "mail.messages.read"],
      manage: ["mail.subscribers.update", "mail.messages.update"],
      admin: [],
    },
  },

  {
    moduleKey: "integrations",
    label: "Integrations",
    levels: {
      view: ["integrations.analytics.read"],
      manage: ["integrations.analytics.update"],
      admin: [],
    },
  },

  {
    moduleKey: "setup",
    label: "Setup",
    levels: {
      view: [],
      manage: ["setup.create", "setup.update"],
      admin: ["setup.complete"],
    },
  },
];
