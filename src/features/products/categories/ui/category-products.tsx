"use client";

import React, {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LuGripHorizontal } from "react-icons/lu";
import { useReorderCategoryProducts } from "@/features/products/categories/hooks/use-reorder-category-products";

type CategoryProductRow = {
  id: string;
  name: string;
  status: "draft" | "active" | "archived" | string;
  imageUrl?: string | null;
  pinned?: boolean | null;
  position?: number | null;
};

function StatusPill({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  if (s === "active") return <Badge>Active</Badge>;
  if (s === "draft") return <Badge variant="outline">Draft</Badge>;
  if (s === "archived") return <Badge variant="secondary">Archived</Badge>;
  return <Badge variant="outline">{status || "—"}</Badge>;
}

const DND_TYPE = "CATEGORY_PRODUCT_ROW";

function moveItem<T>(arr: T[], from: number, to: number) {
  const copy = arr.slice();
  const [picked] = copy.splice(from, 1);
  copy.splice(to, 0, picked);
  return copy;
}

function normalizePositions(items: CategoryProductRow[]) {
  return items.map((it, idx) => ({
    ...it,
    position: idx + 1,
  }));
}

type RowProps = {
  item: CategoryProductRow;
  index: number;
  moveRow: (from: number, to: number) => void;
  canDrag?: boolean;
  onDropSave?: () => void;
};

function ReorderRow({
  item,
  index,
  moveRow,
  canDrag = true,
  onDropSave,
}: RowProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPE,
      item: { index, id: item.id },
      canDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (_dragItem, monitor) => {
        if (monitor.didDrop()) onDropSave?.();
      },
    }),
    [index, item.id, canDrag, onDropSave]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: DND_TYPE,
      hover: (dragItem: { index: number; id: string }) => {
        if (!ref.current) return;
        if (dragItem.index === index) return;

        moveRow(dragItem.index, index);
        dragItem.index = index;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [index, moveRow]
  );

  const dragDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      drag(drop(node));
    },
    [drag, drop]
  );

  return (
    <div
      ref={dragDropRef}
      className={cn(
        "grid grid-cols-12 items-center gap-3 px-3 py-2",
        "hover:bg-muted/20",
        isOver ? "bg-muted/20" : "",
        isDragging ? "opacity-60" : ""
      )}
    >
      {/* Product */}
      <div className="col-span-7 flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "h-8 w-8 flex items-center justify-center",
            canDrag ? "cursor-grab" : "opacity-40 cursor-not-allowed"
          )}
          title={canDrag ? "Drag to reorder" : "Reordering disabled"}
        >
          <LuGripHorizontal size={13} />
        </div>

        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-md object-cover border"
          />
        ) : (
          <div className="h-11 w-11 rounded-md bg-muted border" />
        )}

        <Link href={`/products/${item.id}`} className="min-w-0">
          <div className="text-sm font-medium truncate">{item.name}</div>
        </Link>
      </div>

      {/* Status */}
      <div className="col-span-2 flex justify-center">
        <StatusPill status={item.status} />
      </div>

      {/* Order */}
      <div className="col-span-3 flex justify-end">
        <div className="text-xs text-muted-foreground">
          {item.position ?? "—"} {item.pinned ? <span>• pinned</span> : null}
        </div>
      </div>
    </div>
  );
}

type Props = {
  categoryId: string;
  items: CategoryProductRow[];
  className?: string;
  emptyText?: string;
  productsTotal?: number;
};

export function CategoryProductsTableLite({
  categoryId,
  items,
  className,
  emptyText = "No products in this category.",
  productsTotal,
}: Props) {
  const [localItems, setLocalItems] = useState<CategoryProductRow[]>(() =>
    normalizePositions(items)
  );

  // ✅ use the hook we created (gates on session + store + axios readiness)
  const {
    mutateAsync: reorderAsync,
    isPending,
    canReorder,
  } = useReorderCategoryProducts();

  // last successful server-saved order (for revert)
  const lastGoodRef = useRef<CategoryProductRow[] | null>(null);

  const syncFromItems = useEffectEvent((nextItems: CategoryProductRow[]) => {
    const normalized = normalizePositions(nextItems);
    setLocalItems(normalized);
    lastGoodRef.current = normalized;
  });

  useEffect(() => {
    syncFromItems(items);
  }, [items]);

  const moveRow = useCallback((from: number, to: number) => {
    setLocalItems((prev) => normalizePositions(moveItem(prev, from, to)));
  }, []);

  // prevent duplicate saves
  const lastSavedSigRef = useRef<string>("");
  const signature = useMemo(
    () => localItems.map((x) => x.id).join("|"),
    [localItems]
  );

  useEffect(() => {
    if (!lastSavedSigRef.current && signature) {
      lastSavedSigRef.current = signature;
    }
  }, [signature]);

  const saveOrder = useCallback(
    async (itemsToSave: CategoryProductRow[]) => {
      if (!canReorder) return;

      const sig = itemsToSave.map((x) => x.id).join("|");
      if (sig === lastSavedSigRef.current) return;

      try {
        const payloadItems = itemsToSave.map((p, idx) => ({
          productId: p.id,
          position: idx + 1,
          ...(p.pinned != null ? { pinned: !!p.pinned } : {}),
        }));

        // optimistic snapshot (for revert)
        lastGoodRef.current = itemsToSave;

        await reorderAsync({ categoryId, items: payloadItems });

        lastSavedSigRef.current = sig;
      } catch (e) {
        // revert if API fails
        if (lastGoodRef.current) {
          setLocalItems(normalizePositions(lastGoodRef.current));
        }
        console.error("reorder failed", e);
      }
    },
    [canReorder, reorderAsync, categoryId]
  );

  const handleDropSave = useCallback(() => {
    saveOrder(localItems).catch((e) => console.error(e));
  }, [localItems, saveOrder]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("rounded-lg border overflow-hidden", className)}>
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">
            Products in this category
            {productsTotal !== undefined ? ` (${productsTotal})` : ""}
          </div>

          <div className="text-xs text-muted-foreground">
            {!canReorder
              ? "Reorder disabled (not ready)"
              : isPending
              ? "Saving..."
              : "Drag to reorder"}
          </div>
        </div>

        {localItems.length === 0 ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <div className="divide-y">
            {localItems.map((p, idx) => (
              <ReorderRow
                key={p.id}
                item={p}
                index={idx}
                moveRow={moveRow}
                canDrag={canReorder && !isPending}
                onDropSave={handleDropSave}
              />
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
}
