"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { useGetCarts } from "../hooks/use-carts";
import { CartsTable } from "./carts-table";
import {
  FaShoppingCart,
  FaExclamationTriangle,
  FaHistory,
} from "react-icons/fa";
import { CreateCartModal } from "./create-cart-modal";

export default function CartsClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [openCreate, setOpenCreate] = useState(false);

  const [status, setStatus] = useState<"active" | "expired">("active");

  const { data, isLoading, error } = useGetCarts(
    { status, limit: 50, offset: 0 },
    session,
    axios
  );

  const rows = data?.rows ?? [];

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────
  if (isLoading) return <Loading />;

  // ─────────────────────────────────────────────
  // Error
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <EmptyState
        icon={<FaExclamationTriangle />}
        title="Unable to load carts"
        description="Something went wrong while fetching carts. Please try again."
        secondaryAction={{
          label: "Retry",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  const hasCarts = rows.length > 0;

  // ─────────────────────────────────────────────
  // Empty (no carts)
  // ─────────────────────────────────────────────
  if (!hasCarts) {
    const isActive = status === "active";

    return (
      <section className="space-y-6">
        <PageHeader
          title="Carts"
          description="Monitor active carts and assist customers before checkout."
          tooltip="Carts are pre-orders. You can inspect items, totals, and shipping selection."
        >
          <Button onClick={() => setOpenCreate(true)}>Create cart</Button>
          <Button
            variant="default"
            onClick={() =>
              setStatus(status === "active" ? "expired" : "active")
            }
          >
            <FaHistory className="mr-2 h-4 w-4" />
            {status === "active" ? "Show expired" : "Show active"}
          </Button>
        </PageHeader>

        <EmptyState
          icon={<FaShoppingCart />}
          title={isActive ? "No active carts" : "No expired carts"}
          description={
            isActive
              ? "Customers haven’t started any carts yet."
              : "There are no expired carts to show."
          }
          secondaryAction={{
            label: isActive ? "View expired carts" : "View active carts",
            onClick: () => setStatus(isActive ? "expired" : "active"),
          }}
        />
        <CreateCartModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
        />
      </section>
    );
  }

  // ─────────────────────────────────────────────
  // Normal render
  // ─────────────────────────────────────────────
  return (
    <section className="space-y-6">
      <PageHeader
        title="Carts"
        description="Monitor active carts and assist customers before checkout."
        tooltip="Carts are pre-orders. You can inspect items, totals, and shipping selection."
      >
        <Button onClick={() => setOpenCreate(true)}>Create cart</Button>
        <Button
          variant="default"
          onClick={() => setStatus(status === "active" ? "expired" : "active")}
        >
          <FaHistory className="mr-2 h-4 w-4" />
          {status === "active" ? "Show expired" : "Show active"}
        </Button>
      </PageHeader>
      <CreateCartModal open={openCreate} onClose={() => setOpenCreate(false)} />

      <CartsTable data={rows} />
    </section>
  );
}
