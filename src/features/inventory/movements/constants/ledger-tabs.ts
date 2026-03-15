export type LedgerTab =
  | "all"
  | "deductions"
  | "reservations"
  | "releases"
  | "transfers"
  | "adjustments";

export const LEDGER_TAB_TO_TYPES: Record<LedgerTab, string[] | undefined> = {
  all: undefined,
  deductions: ["fulfill", "pos_deduct"],
  reservations: ["reserve"],
  releases: ["release"],
  transfers: ["transfer_in", "transfer_out"],
  adjustments: ["adjustment"],
};
