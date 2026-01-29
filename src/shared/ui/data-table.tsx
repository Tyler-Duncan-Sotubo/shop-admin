/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  Row,
  Table as TableType,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FaSearch } from "react-icons/fa";
import { SlSocialDropbox } from "react-icons/sl";

export type DataTableMobileRowProps<TData> = {
  row: Row<TData>;
  table: TableType<TData>;
  onRowClick?: (row: TData) => void;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;

  filterKey?: string;
  filterPlaceholder?: string;
  showSearch?: boolean;

  onRowClick?: (row: TData) => void;

  defaultPageSize?: number;
  pageSizeOptions?: number[];
  allowCustomPageSize?: boolean;

  disableRowSelection?: boolean;
  toolbarRight?: React.ReactNode;
  toolbarLeft?: React.ReactNode;

  /** ✅ Plug-in mobile renderer (like columns) */
  mobileRow?: React.ComponentType<DataTableMobileRowProps<TData>>;
  /** optionally hide table on mobile even without mobileRow */
  hideTableOnMobile?: boolean;

  tableMeta?: Record<string, unknown>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  filterPlaceholder,
  showSearch = true,
  onRowClick,

  defaultPageSize = 100,
  pageSizeOptions = [50, 100, 150],
  allowCustomPageSize = true,
  disableRowSelection = false,
  toolbarRight,
  toolbarLeft,

  mobileRow: MobileRow,
  hideTableOnMobile = false,
  tableMeta,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const [customOpen, setCustomOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState<string>("");

  const table = useReactTable({
    data: data ?? [],
    columns,
    meta: tableMeta,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const pageSize = table.getState().pagination.pageSize;

  const applyCustomPageSize = (value: string) => {
    setCustomValue(value);
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) {
      table.setPageSize(n);
    }
  };

  const rows = table.getRowModel().rows;

  return (
    <div className="w-full">
      {/* Optional filter bar */}
      {(filterKey && showSearch) || toolbarRight || toolbarLeft ? (
        <div className="flex w-full flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">{toolbarLeft}</div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            {filterKey && showSearch && (
              <Input
                placeholder={filterPlaceholder ?? "Filter..."}
                value={
                  (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(filterKey)?.setFilterValue(event.target.value)
                }
                className="w-full sm:w-72 placeholder:text-xs"
                leftIcon={<FaSearch size={15} />}
              />
            )}
            {toolbarRight}
          </div>
        </div>
      ) : null}

      <div className="rounded-md border">
        {/* ✅ Mobile view */}
        {MobileRow ? (
          <div className="block sm:hidden">
            {rows.length ? (
              <div className="divide-y">
                {rows.map((row) => (
                  <MobileRow
                    key={row.id}
                    row={row}
                    table={table}
                    onRowClick={onRowClick}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <SlSocialDropbox size={56} />
                  <span className="text-sm">No record found</span>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ✅ Desktop table (and optionally mobile too) */}
        <div
          className={hideTableOnMobile || MobileRow ? "hidden sm:block" : ""}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={
                      onRowClick
                        ? "cursor-pointer hover:bg-muted/50 transition-colors"
                        : ""
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 font-medium">
                        {cell.column.id === "actions" ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <SlSocialDropbox size={70} />
                      <span className="text-sm">No record found</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer */}
      {!disableRowSelection && (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} total record(s)
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows:</span>

              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={customOpen ? "custom" : String(pageSize)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "custom") {
                    setCustomOpen(true);
                    setCustomValue(String(pageSize));
                  } else {
                    setCustomOpen(false);
                    setCustomValue("");
                    table.setPageSize(Number(v));
                  }
                }}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                {allowCustomPageSize && <option value="custom">Custom…</option>}
              </select>

              {allowCustomPageSize && customOpen && (
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="e.g. 25"
                  className="w-24"
                  value={customValue}
                  onChange={(e) => applyCustomPageSize(e.target.value)}
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="clean"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="clean"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
