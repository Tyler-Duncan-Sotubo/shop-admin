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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;

  filterKey?: string; // e.g. "name"
  filterPlaceholder?: string; // e.g. "Filter by name..."
  showSearch?: boolean;

  onRowClick?: (row: TData) => void;

  /** Pagination controls */
  defaultPageSize?: number; // default 20
  pageSizeOptions?: number[]; // default [10,20,50,100]
  allowCustomPageSize?: boolean; // default true
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  filterPlaceholder,
  showSearch = true,
  onRowClick,

  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  allowCustomPageSize = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // Used only when allowCustomPageSize is enabled
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState<string>("");

  const table = useReactTable({
    data: data ?? [],
    columns,

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

  return (
    <div className="w-full mt-6">
      {/* Optional filter bar */}
      {filterKey && showSearch && (
        <div className="flex w-full pb-4">
          <div className="ml-auto">
            <Input
              placeholder={filterPlaceholder ?? "Filter..."}
              value={
                (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(filterKey)?.setFilterValue(event.target.value)
              }
              className="w-72 placeholder:text-xs"
              leftIcon={<FaSearch size={15} />}
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
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
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
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
                    <TableCell key={cell.id} className="py-5 font-medium">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} total record(s)
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
          {/* Page size control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows:</span>

            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={customOpen ? "custom" : String(pageSize)}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "custom") {
                  setCustomOpen(true);
                  // keep current pageSize as starting point
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
    </div>
  );
}
