// features/products/categories/components/categories-client.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { categoryColumns } from "./category-columns";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useCategories } from "../hooks/use-categories";
import { useSession } from "next-auth/react";
import { CategoriesMobileRow } from "./categories-mobile-row";

export function CategoriesClient() {
  const router = useRouter();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session } = useSession();

  const { categories, isLoading } = useCategories(
    session,
    axios,
    activeStoreId,
  );

  const parentName = useMemo(() => {
    const map = new Map((categories ?? []).map((c) => [c.id, c.name] as const));
    return (parentId: string | null) =>
      parentId ? (map.get(parentId) ?? "—") : "—";
  }, [categories]);

  // add parentName for mobile row (so it doesn't need to know getParentName)
  const rows = useMemo(() => {
    return (categories ?? []).map((c) => ({
      ...c,
      parentName: c.parentId ? parentName(c.parentId) : null,
    }));
  }, [categories, parentName]);

  const cols = useMemo(
    () =>
      categoryColumns({
        onEdit: (row) => router.push(`/products/categories/${row.id}`),
        getParentName: parentName,
      }),
    [parentName, router],
  );

  if (isLoading) return <Loading />;

  return (
    <section className="space-y-4">
      <div className="mt-10">
        <DataTable
          columns={cols}
          data={rows}
          filterKey="name"
          filterPlaceholder="Search collections..."
          onRowClick={(row) => router.push(`/products/categories/${row.id}`)}
          mobileRow={CategoriesMobileRow}
          toolbarRight={
            <Button
              onClick={() =>
                router.push("/products/categories/new?tab=collections")
              }
            >
              New collection
            </Button>
          }
        />
      </div>
    </section>
  );
}
