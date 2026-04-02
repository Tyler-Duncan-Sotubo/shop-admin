export interface QuickFilter {
  label: string;
  description: string;
  href: string;
  icon: string;
}

export const QUICK_FILTERS: QuickFilter[] = [
  {
    label: "Lay-buy orders",
    description: "Orders being paid in instalments",
    href: "/sales/orders?status=lay_buy",
    icon: "💳",
  },
  {
    label: "Orders on hold",
    description: "Unpaid orders waiting for payment",
    href: "/sales/orders?status=on_hold",
    icon: "⏸️",
  },
  {
    label: "Overdue invoices",
    description: "Invoices past their due date",
    href: "/sales/invoices?status=overdue",
    icon: "⚠️",
  },
  {
    label: "Unpaid invoices",
    description: "Issued invoices with outstanding balance",
    href: "/sales/invoices?status=issued",
    icon: "📄",
  },
  {
    label: "New quote requests",
    description: "Quotes waiting to be reviewed",
    href: "/sales/rfqs?status=new",
    icon: "💬",
  },
];
