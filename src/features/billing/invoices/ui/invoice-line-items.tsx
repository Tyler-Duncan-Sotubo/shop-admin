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

  const lineById = useMemo(() => {
    const m = new Map<string, any>();
    for (const l of lines) m.set(l.id, l);
    return m;
  }, [lines]);

  const { debounced: debouncedSaveLine } = useDebounceCallback(
    async (
      lineId: string,
      payload: {
        quantity?: number;
        unitPriceMinor?: number;
        taxId?: string | null;
      },
    ) => {
      const line = lineById.get(lineId);
      if (!line) return;
      if (line.meta?.kind === "shipping") return;

      await updateLine.mutateAsync({
        invoiceId,
        lineId,
        input: payload,
      });
    },
    500,
  );

  const sortedLines = useMemo(
    () => lines.slice().sort((a, b) => a.position - b.position),
    [lines],
  );

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block">
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
            {sortedLines.map((l) => {
              const isShipping = l.meta?.kind === "shipping";
              const disabledRow = !isDraft || isShipping;

              const edit = draftEdits[l.id] ?? {};

              const quantity = edit.quantity ?? Number(l.quantity ?? 1);

              const defaultUnitPriceMajor = minorToMajor(
                Number(l.unitPriceMinor ?? 0),
              );
              const unitPriceMajor =
                edit.unitPriceMajor ?? defaultUnitPriceMajor;

              const taxId = isShipping ? null : (edit.taxId ?? l.taxId ?? null);

              return (
                <TableRow
                  key={l.id}
                  className={isShipping ? "bg-muted/30" : ""}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium leading-snug">
                        {l.description}
                      </div>
                    </div>
                  </TableCell>

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

                        if (!disabledRow)
                          debouncedSaveLine(l.id, { quantity: q });
                      }}
                    />
                  </TableCell>

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
                      <div className="h-9 flex items-center" />
                    )}
                  </TableCell>

                  <TableCell>
                    {isShipping ? (
                      <div className="h-9 flex items-center text-sm text-muted-foreground" />
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

                          if (isDraft)
                            debouncedSaveLine(l.id, { taxId: nextTaxId });
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

                  <TableCell className="text-right">
                    <div className="font-medium">
                      {formatMoneyNGN(
                        minorToMajor(Number(l.lineTotalMinor ?? 0)),
                        inv.currency,
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile rows */}
      <div className="md:hidden rounded-lg border divide-y">
        {sortedLines.map((l) => {
          const isShipping = l.meta?.kind === "shipping";
          const disabledRow = !isDraft || isShipping;

          const edit = draftEdits[l.id] ?? {};
          const quantity = edit.quantity ?? Number(l.quantity ?? 1);

          const defaultUnitPriceMajor = minorToMajor(
            Number(l.unitPriceMinor ?? 0),
          );
          const unitPriceMajor = edit.unitPriceMajor ?? defaultUnitPriceMajor;

          const taxId = isShipping ? null : (edit.taxId ?? l.taxId ?? null);

          return (
            <div key={l.id} className={isShipping ? "bg-muted/30" : ""}>
              <div className="p-4 space-y-3">
                {/* Title + amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-snug">
                      {l.description}
                    </div>
                    {isShipping ? (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Shipping
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-sm font-semibold whitespace-nowrap">
                    {formatMoneyNGN(
                      minorToMajor(Number(l.lineTotalMinor ?? 0)),
                      inv.currency,
                    )}
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Quantity
                    </div>
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

                        if (!disabledRow)
                          debouncedSaveLine(l.id, { quantity: q });
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Rate</div>
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
                      <div className="h-9 rounded-md border bg-muted/20" />
                    )}
                  </div>

                  <div className="col-span-2 space-y-1">
                    <div className="text-xs text-muted-foreground">Tax</div>
                    {isShipping ? (
                      <div className="h-9 flex items-center text-sm text-muted-foreground">
                        No tax
                      </div>
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

                          if (isDraft)
                            debouncedSaveLine(l.id, { taxId: nextTaxId });
                        }}
                      >
                        <SelectTrigger className="h-9 bg-white w-full">
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
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="flex justify-end">
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
