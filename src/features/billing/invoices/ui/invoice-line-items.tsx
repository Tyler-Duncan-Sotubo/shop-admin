/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { minorToMajor } from "../schema/invoice.schema";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useUpdateInvoiceLine } from "../hooks/use-invoices";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";

const toMinor = (major: unknown) => {
  const n = Number(major);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
};

type DraftEdit = {
  quantity?: number;
  unitPriceMajor?: string; // user types NGN
  taxId?: string | null;
};

export function InvoiceLineItemsTable({
  invoiceId,
  inv,
  lines,
  taxes,
  isDraft,
}: {
  invoiceId: string;
  inv: any;
  lines: any[];
  taxes: any[];
  isDraft: boolean;
}) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const updateLine = useUpdateInvoiceLine(session, axios);

  const [draftEdits, setDraftEdits] = useState<Record<string, DraftEdit>>({});

  // quick lookup so we can keep item details stable/read-only
  const lineById = useMemo(() => {
    const m = new Map<string, any>();
    for (const l of lines) m.set(l.id, l);
    return m;
  }, [lines]);

  // ✅ debounced autosave (mutates after user pauses)
  const { debounced: debouncedSaveLine } = useDebounceCallback(
    async (
      lineId: string,
      payload: {
        quantity?: number;
        unitPriceMinor?: number;
        taxId?: string | null;
      }
    ) => {
      const line = lineById.get(lineId);
      if (!line) return;

      // 🚫 never edit shipping lines
      if (line.meta?.kind === "shipping") return;

      await updateLine.mutateAsync({
        invoiceId,
        lineId,
        input: payload,
      });
    },
    500
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[46%]">Item Details</TableHead>
            <TableHead className="w-[12%]">Quantity</TableHead>
            <TableHead className="w-[18%]">Rate</TableHead>
            <TableHead className="w-[14%]">Tax</TableHead>
            <TableHead className="w-[10%] text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {lines
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((l) => {
              const isShipping = l.meta?.kind === "shipping";
              const disabledRow = !isDraft || isShipping;

              const edit = draftEdits[l.id] ?? {};

              // quantity
              const quantity = edit.quantity ?? Number(l.quantity ?? 1);

              // rate shown as NGN (major) but saved as kobo
              const defaultUnitPriceMajor = minorToMajor(
                Number(l.unitPriceMinor ?? 0)
              );
              const unitPriceMajor =
                edit.unitPriceMajor ?? defaultUnitPriceMajor;

              // tax
              const taxId = isShipping ? null : edit.taxId ?? l.taxId ?? null;

              return (
                <TableRow
                  key={l.id}
                  className={isShipping ? "bg-muted/30" : ""}
                >
                  {/* Item details read-only */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium leading-snug">
                        {l.description}
                      </div>
                      {isShipping ? (
                        <p className="text-xs text-muted-foreground"></p>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* Quantity: no chevrons (not type=number) */}
                  <TableCell>
                    <Input
                      value={String(quantity)}
                      disabled={disabledRow}
                      className="h-9 bg-white"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={(e) => {
                        const q = Number(e.target.value);

                        setDraftEdits((s) => ({
                          ...s,
                          [l.id]: { ...s[l.id], quantity: q },
                        }));

                        if (!disabledRow) {
                          debouncedSaveLine(l.id, { quantity: q });
                        }
                      }}
                    />
                  </TableCell>

                  {/* Rate (NGN display, kobo save). no chevrons */}
                  <TableCell>
                    {isDraft && !isShipping ? (
                      <Input
                        value={unitPriceMajor}
                        disabled={disabledRow}
                        className="h-9 bg-white"
                        inputMode="decimal"
                        onChange={(e) => {
                          const v = e.target.value;

                          setDraftEdits((s) => ({
                            ...s,
                            [l.id]: { ...s[l.id], unitPriceMajor: v },
                          }));

                          if (!disabledRow) {
                            debouncedSaveLine(l.id, {
                              unitPriceMinor: toMinor(v),
                            });
                          }
                        }}
                      />
                    ) : (
                      <div className="h-9 flex items-center"></div>
                    )}
                  </TableCell>

                  {/* Tax: none on shipping */}
                  <TableCell>
                    {isShipping ? (
                      <div className="h-9 flex items-center text-sm text-muted-foreground"></div>
                    ) : (
                      <Select
                        disabled={!isDraft}
                        value={taxId ?? "none"}
                        onValueChange={(val) => {
                          const nextTaxId = val === "none" ? null : val;

                          setDraftEdits((s) => ({
                            ...s,
                            [l.id]: { ...s[l.id], taxId: nextTaxId },
                          }));

                          if (isDraft) {
                            debouncedSaveLine(l.id, { taxId: nextTaxId });
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 bg-white">
                          <SelectValue placeholder="No tax" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="none">No tax</SelectItem>
                          {taxes.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} ({(t.rateBps / 100).toFixed(2)}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-right">
                    <div className="font-medium">
                      {formatMoneyNGN(
                        minorToMajor(Number(l.lineTotalMinor ?? 0)),
                        inv.currency
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>

      {/* Totals under table */}
      <div className="mt-4 flex justify-end">
        <div className="w-full md:w-[380px] space-y-2 rounded-xl border p-4 bg-white">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatMoneyNGN(minorToMajor(inv.subtotalMinor), inv.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">
              {formatMoneyNGN(minorToMajor(inv.taxMinor), inv.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">
              {formatMoneyNGN(minorToMajor(inv.totalMinor), inv.currency)}
            </span>
          </div>

          <div className="pt-2 border-t flex justify-between text-sm">
            <span className="text-muted-foreground">Balance Due</span>
            <span className="font-semibold">
              {formatMoneyNGN(minorToMajor(inv.balanceMinor), inv.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
