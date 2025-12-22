/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";

import { useCategories } from "../hooks/use-categories";
import { Category, UpdateCategoryPayload } from "../types/category.type";
import { categoryColumns } from "./category-columns";
import { CreateCategoryCard } from "./create-category-card";
import { CategoryFormModal } from "./category-form-modal";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

export function CategoriesClient() {
  const { categories, isLoading, createCategory } = useCategories();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const parentName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name] as const));
    return (parentId: string | null) =>
      parentId ? map.get(parentId) ?? "—" : "—";
  }, [categories]);

  const cols = useMemo(
    () =>
      categoryColumns({
        onEdit: (row) => {
          setModalError(null);
          setEditing(row);
          setEditOpen(true);
        },
        getParentName: parentName,
      }),
    [parentName]
  );

  const updateCategory = useUpdateMutation<UpdateCategoryPayload>({
    endpoint: `/api/catalog/categories/${editing?.id}`, // (hook probably appends /:id internally OR you pass full in call)
    successMessage: "Category updated successfully",
    refetchKey: "categories",
    method: "PATCH",
  });

  const submitEdit = async (values: any) => {
    if (!editing) return;
    await updateCategory(values, setModalError, () => setEditOpen(false));
  };

  if (isLoading) return <Loading />;

  return (
    <section className="space-y-4">
      <PageHeader
        title="Collections"
        description="Create and manage your product collections."
        tooltip="Collections help organize your catalog and improve navigation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
        {/* LEFT: Create */}
        <div className="lg:col-span-4">
          <CreateCategoryCard
            categories={categories}
            onCreate={createCategory}
          />
        </div>

        {/* RIGHT: Table */}
        <div className="lg:col-span-8">
          <DataTable
            columns={cols}
            data={categories}
            filterKey="name"
            filterPlaceholder="Search "
          />
        </div>
      </div>

      <CategoryFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        initial={editing}
        allCategories={categories}
        onSubmit={submitEdit}
        submitError={modalError}
      />
    </section>
  );
}
