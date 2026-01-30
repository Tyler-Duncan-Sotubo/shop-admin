"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/ui/card";
import { useRouter } from "next/navigation";
import { useStores } from "../hooks/use-stores";
import { Store } from "../types/store.type";
import { StoreFormValues } from "../schema/stores.schema";
import { StoreFormModal } from "./store-form-modal";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { CreateStorePayload, UpdateStorePayload } from "../types/store.type";
import { P } from "@/shared/ui/typography";
import { cn } from "@/lib/utils";
import { currencyMap } from "@/shared/config/currency.config";
import { Globe } from "lucide-react";
import PageHeader from "@/shared/ui/page-header";
import Link from "next/link";

export default function StoreSection() {
  const { stores, isLoading, fetchError } = useStores();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Create store mutation (POST /api/stores)
  const createStore = useCreateMutation<CreateStorePayload>({
    endpoint: "/api/stores",
    successMessage: "Store created successfully",
    refetchKey: "stores",
  });

  // Update store mutation (PATCH /api/stores/:id)
  const updateStore = useUpdateMutation<UpdateStorePayload>({
    endpoint: selectedStore
      ? `/api/stores/${selectedStore.id}`
      : "/api/stores/__placeholder", // won't be used when no selectedStore
    successMessage: "Store updated successfully",
    refetchKey: "stores",
    method: "PATCH",
  });

  const openCreateModal = () => {
    setSelectedStore(null);
    setModalMode("create");
    setSubmitError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (values: StoreFormValues) => {
    setSubmitError(null);

    if (modalMode === "create") {
      await createStore(
        {
          name: values.name,
          slug: values.slug,
          defaultCurrency: values.defaultCurrency,
          defaultLocale: values.defaultLocale,
          isActive: values.isActive,
          base64Image: values.base64Image,
          coverImageAltText: values.coverImageAltText,
          removeImage: values.removeImage,
          storeEmail: values.storeEmail,
        },
        setSubmitError,
        undefined, // no form.reset here, modal form handles its own reset on open
        closeModal,
      );
    } else if (modalMode === "edit" && selectedStore) {
      await updateStore(
        {
          name: values.name,
          slug: values.slug,
          defaultCurrency: values.defaultCurrency,
          defaultLocale: values.defaultLocale,
          isActive: values.isActive,
          base64Image: values.base64Image,
          coverImageAltText: values.coverImageAltText,
          removeImage: values.removeImage,
          storeEmail: values.storeEmail,
        },
        setSubmitError,
        closeModal,
      );
    }
  };

  if (isLoading && stores.length === 0) {
    return <Loading />;
  }

  if (fetchError && stores.length === 0) {
    return (
      <p className="text-sm text-destructive">
        Failed to load stores: {fetchError}
      </p>
    );
  }

  const hasStores = stores.length > 0;

  const getStoreDomainLabel = (store: Store) =>
    store.primaryDomain ?? store.domains?.[0] ?? null;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Stores"
        description="Manage your stores"
        tooltip="Stores represent different storefronts for your products and customers."
      >
        <Button onClick={openCreateModal}>
          {hasStores ? "Create another store" : "Create store"}
        </Button>{" "}
      </PageHeader>

      {!hasStores && (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground flex flex-col items-start space-y-2">
          <p>You don&apos;t have any stores yet.</p>
          <Button size="sm" onClick={openCreateModal}>
            Create your first store
          </Button>
        </div>
      )}

      {hasStores && (
        <div className="grid gap-4 md:grid-cols-2">
          {stores.map((store) => {
            const currency = currencyMap[store.defaultCurrency];
            return (
              <Link
                key={store.id}
                href={`/settings/stores/${store.id}?tab=general`}
              >
                <Card
                  key={store.id}
                  className="flex flex-col justify-between border-muted/70 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                            {store.name.charAt(0).toUpperCase()}
                          </span>
                          <span>{store.name}</span>
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Storefront for your products and customers.
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                          store.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                        )}
                      >
                        ● {store.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                      {/* Currency */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[11px]">
                          {currency?.symbol ?? "¤"}
                        </span>
                        <div>
                          <p className="uppercase not-first:mt-0">Currency</p>
                          <p className="font-medium not-first:mt-0">
                            {currency?.label ?? store.defaultCurrency}
                          </p>
                        </div>
                      </div>

                      {/* Locale */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <div>
                          <P className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Locale
                          </P>
                          <p className="font-medium">{store.defaultLocale}</p>
                        </div>
                      </div>

                      {/* ✅ Domain (full width) */}
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <div className="min-w-0">
                          <P className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Domain
                          </P>
                          {getStoreDomainLabel(store) ? (
                            <p className="font-mono text-xs truncate">
                              {getStoreDomainLabel(store)}
                            </p>
                          ) : (
                            <p className="text-xs italic text-muted-foreground">
                              Not configured
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t bg-muted/40 px-4 py-2">
                    <P className="text-[11px] text-muted-foreground">
                      Last updated:{" "}
                      {store.updatedAt
                        ? format(new Date(store.updatedAt), "PPP")
                        : "N/A"}
                    </P>

                    <div className="flex gap-2">
                      <Button
                        variant="clean"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/settings/stores/${store.id}?tab=general`,
                          )
                        }
                      >
                        Open
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <StoreFormModal
        open={modalOpen}
        mode={modalMode}
        store={selectedStore}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {submitError && (
        <p className="text-sm text-destructive mt-2">{submitError}</p>
      )}
    </section>
  );
}
