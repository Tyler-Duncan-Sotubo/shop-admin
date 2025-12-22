export type LedgerTab = "all" | "deductions" | "reservations" | "releases";

// map tab -> movement types (you can adjust later)
export const LEDGER_TAB_TO_TYPES: Record<LedgerTab, string[] | undefined> = {
  all: undefined,
  deductions: ["fulfill", "pos_deduct"],
  reservations: ["reserve"],
  releases: ["release"],
};
