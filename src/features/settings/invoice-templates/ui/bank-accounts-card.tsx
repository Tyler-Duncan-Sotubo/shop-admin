"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormSheet } from "@/shared/ui/form-sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  type BankAccount,
  useListBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
} from "../hooks/use-bank-accounts";

const schema = z.object({
  label: z.string().min(1, "Required").max(64),
  bankName: z.string().min(1, "Required").max(128),
  accountName: z.string().min(1, "Required").max(128),
  accountNumber: z.string().min(1, "Required").max(64),
  tin: z.string().max(64).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function BankAccountsCard() {
  const { data: accounts = [], isLoading } = useListBankAccounts();
  const createMut = useCreateBankAccount();
  const updateMut = useUpdateBankAccount();
  const deleteMut = useDeleteBankAccount();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BankAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", bankName: "", accountName: "", accountNumber: "", tin: "" },
  });

  const openCreate = () => {
    setEditTarget(null);
    form.reset({ label: "", bankName: "", accountName: "", accountNumber: "", tin: "" });
    setSheetOpen(true);
  };

  const openEdit = (acc: BankAccount) => {
    setEditTarget(acc);
    form.reset({
      label: acc.label,
      bankName: acc.bankName,
      accountName: acc.accountName,
      accountNumber: acc.accountNumber,
      tin: acc.tin ?? "",
    });
    setSheetOpen(true);
  };

  const submit = async (values: FormValues) => {
    const payload = {
      label: values.label.trim(),
      bankName: values.bankName.trim(),
      accountName: values.accountName.trim(),
      accountNumber: values.accountNumber.trim(),
      tin: values.tin?.trim() || null,
    };

    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget.id, ...payload });
        toast.success("Bank account updated");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Bank account added");
      }
      setSheetOpen(false);
    } catch {
      toast.error("Failed to save bank account");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success("Bank account removed");
    } catch {
      toast.error("Failed to remove bank account");
    } finally {
      setDeleteTarget(null);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Bank accounts</p>
          <p className="text-sm text-muted-foreground">
            Accounts available to select when issuing an invoice.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add account
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {!isLoading && accounts.length === 0 && (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No bank accounts yet. Add one to use when issuing invoices.
        </div>
      )}

      {accounts.length > 0 && (
        <div className="divide-y rounded-md border">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{acc.label}</span>
                  <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                    {acc.bankName}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {acc.accountName} · {acc.accountNumber}
                  {acc.tin && ` · TIN: ${acc.tin}`}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(acc)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteTarget(acc)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit sheet */}
      <FormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        mode={editTarget ? "edit" : "create"}
        title={editTarget ? "Edit bank account" : "Add bank account"}
        onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(submit)(); }}
        submitLabel={editTarget ? "Save changes" : "Add account"}
        isSubmitting={isSaving}
      >
        <Form {...form}>
          <div className="space-y-3">
            <FormField control={form.control} name="label" render={({ field }) => (
              <FormItem>
                <FormLabel>Label *</FormLabel>
                <FormControl><Input placeholder="e.g. POS, Bank Transfer" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="bankName" render={({ field }) => (
              <FormItem>
                <FormLabel>Bank name *</FormLabel>
                <FormControl><Input placeholder="e.g. First Bank" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="accountName" render={({ field }) => (
              <FormItem>
                <FormLabel>Account name *</FormLabel>
                <FormControl><Input placeholder="e.g. Acme Ltd" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="accountNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Account number *</FormLabel>
                <FormControl><Input placeholder="0123456789" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="tin" render={({ field }) => (
              <FormItem>
                <FormLabel>TIN</FormLabel>
                <FormControl><Input placeholder="Tax Identification Number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </Form>
      </FormSheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove bank account?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.label}</strong> ({deleteTarget?.bankName}) will be removed.
              Already-issued invoices are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
