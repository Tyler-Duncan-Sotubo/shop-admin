"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FaSearch } from "react-icons/fa";
import type { CreateBlogPostValues } from "../schema/create-blog-post.schema";
import { useGetProducts } from "@/features/products/core/hooks/use-product";

export function BlogProductsPicker({
  session,
}: {
  session?: { backendTokens?: { accessToken?: string } } | null;
}) {
  const { watch, setValue } = useFormContext<CreateBlogPostValues>();
  const linked = watch("products") ?? [];

  const [q, setQ] = React.useState("");
  const { data: products } = useGetProducts({ search: q, limit: 10 }, session);

  const add = (productId: string) => {
    if (linked.some((x) => x.productId === productId)) return;
    const next = [...linked, { productId, sortOrder: linked.length }];
    setValue("products", next, { shouldDirty: true, shouldValidate: true });
  };

  const remove = (productId: string) => {
    const next = linked
      .filter((x) => x.productId !== productId)
      .map((x, i) => ({ ...x, sortOrder: i }));
    setValue("products", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search products to link…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        leftIcon={<FaSearch size={15} />}
      />

      {/* Search results */}
      <div className="space-y-2">
        {(products?.rows ?? []).slice(0, 6).map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-md border p-2"
          >
            <div className="text-sm font-medium">{p.name}</div>
            <Button
              type="button"
              variant="clean"
              size="sm"
              onClick={() => add(p.id)}
            >
              Add
            </Button>
          </div>
        ))}
      </div>

      {/* Linked */}
      <div className="flex flex-wrap gap-2">
        {linked.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No linked products yet.
          </div>
        ) : (
          linked.map((x) => (
            <Badge key={x.productId} className="flex items-center gap-2">
              {x.productId.slice(0, 8)}…
              <button
                type="button"
                onClick={() => remove(x.productId)}
                className="ml-1 text-xs opacity-80 hover:opacity-100"
              >
                ✕
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
