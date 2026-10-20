"use client";

import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getRowId,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { EmptyTableState } from "./EmptyTableState";

// ============================================================
// Types
// ============================================================
export interface DataTableRowAction<TData> {
  label: string;
  icon?: ReactNode;
  onSelect: (row: TData) => void;
  /** When true, render with destructive styling. */
  destructive?: boolean;
  /** Hide this action when this returns true. */
  hidden?: (row: TData) => boolean;
}

export interface DataTableBulkAction<TData> {
  label: string;
  icon?: ReactNode;
  onRun: (rows: TData[]) => void;
  /** Hide when no rows are selected. */
  requiresSelection?: boolean;
  destructive?: boolean;
}

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Optional search placeholder; pass null to hide search. */
  searchPlaceholder?: string | null;
  /** Optional global filter accessor. */
  getSearchValue?: (row: TData) => string;
  /** Optional renderer mounted above the table (filters, custom actions). */
  toolbar?: ReactNode;
  /** Optional row actions menu — Edit/Duplicate/Archive/Delete by convention. */
  rowActions?: DataTableRowAction<TData>[];
  /** Optional bulk actions rendered when rows are selected. */
  bulkActions?: DataTableBulkAction<TData>[];
  /** Optional click handler on a row body (not on actions). */
  onRowClick?: (row: TData) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Show pagination control when there are more rows than `pageSize`. */
  pageSize?: number;
  /** Optional id for accessibility. */
  ariaLabel?: string;
  /** Optional function to derive a stable id from a row (defaults to index). */
  getRowId?: getRowId<TData>;
}

// ============================================================
// Component
// ============================================================

/**
 * Reusable data table wrapper around @tanstack/react-table.
 * Phase 3b CRUD tables mount this with their own column definitions.
 *
 * - Sticky header, brand-styled cells.
 * - Search + sort + pagination all client-side.
 * - Optional row selection via checkbox column with a bulk-action toolbar.
 * - Optional per-row dropdown actions menu (Edit / Duplicate / Archive / Delete).
 * - Card-on-mobile (responsive): below the `sm:` breakpoint each row renders
 *   as a stacked card with the same fields — implemented by reading the
 *   visible cells and stacking them.
 */
export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  searchPlaceholder = "Search…",
  getSearchValue,
  toolbar,
  rowActions,
  bulkActions,
  onRowClick,
  emptyTitle = "No records",
  emptyDescription = "Try adjusting your filters or search query.",
  emptyAction,
  pageSize = 10,
  ariaLabel,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const globalFilterFn = useCallback(
    (row: { original: TData }, _columnId: string, filterValue: string) => {
      const value = getSearchValue
        ? getSearchValue(row.original)
        : String(
            (row.original as { id?: unknown }).id ??
              (row.original as { slug?: unknown }).slug ??
              ""
          );
      return value.toLowerCase().includes(filterValue.toLowerCase());
    },
    [getSearchValue]
  );

  // Augment columns with a leading checkbox column when bulk actions exist.
  const effectiveColumns = useMemo(() => {
    if (!bulkActions || bulkActions.length === 0) return columns;
    const selectCol: ColumnDef<TData, unknown> = {
      id: "__select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      size: 32,
    };
    return [selectCol, ...columns];
  }, [columns, bulkActions]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: effectiveColumns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    getRowId: getRowId ?? ((_row, i) => String(i)),
  });

  const pageCount = table.getPageCount();
  const rowIndexStart = pageSliceStart(table);
  const rowIndexEnd = pageSliceEnd(table);

  const selectedRows = useMemo(() => {
    const selection = table.getSelectedRowModel().rows;
    return selection.map((r) => r.original);
  }, [table]);

  const showBulkBar =
    bulkActions && bulkActions.length > 0 && selectedRows.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Filter + toolbar row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {searchPlaceholder ? (
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                aria-hidden
              />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
                aria-label="Search rows"
              />
            </div>
          ) : null}
          {toolbar}
        </div>
        {showBulkBar ? (
          <BulkToolbar
            count={selectedRows.length}
            actions={bulkActions!}
            selected={selectedRows}
            onClear={() => {
              setRowSelection({});
              table.resetRowSelection();
            }}
          />
        ) : null}
      </div>

      {/* Desktop table */}
      <div
        className="hidden overflow-hidden rounded-lg border sm:block"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="overflow-x-auto scrollbar-thin">
          <Table aria-label={ariaLabel}>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="hover:bg-transparent"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className="h-9 text-[11px] uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {sorted === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-3" />
                            ) : (
                              <ChevronsUpDown className="size-3 opacity-60" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={effectiveColumns.length} className="p-0">
                    <EmptyTableState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    onClick={() => onRowClick?.(row.original)}
                    className={
                      onRowClick ? "cursor-pointer" : undefined
                    }
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2 text-sm align-middle"
                        style={{ color: "var(--text-primary)" }}
                        onClick={
                          cell.column.id === "__select"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    {rowActions ? (
                      <TableCell
                        className="py-2 text-right align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RowActionsMenu row={row} actions={rowActions} />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile cards */}
      <MobileCardGrid
        table={table}
        onRowClick={onRowClick}
        rowActions={rowActions}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={emptyAction}
      />

      {pageCount > 1 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Showing {rowIndexStart}–{rowIndexEnd} of{" "}
            {table.getFilteredRowModel().rows.length}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[120px]" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label="First page"
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                aria-label="Last page"
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================
function BulkToolbar<TData>({
  count,
  actions,
  selected,
  onClear,
}: {
  count: number;
  actions: DataTableBulkAction<TData>[];
  selected: TData[];
  onClear: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-md border px-2 py-1.5"
      style={{
        borderColor: "var(--accent-bright)",
        backgroundColor: "var(--surface-2)",
      }}
    >
      <span
        className="text-xs font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {count} selected
      </span>
      <div className="flex flex-wrap items-center gap-1">
        {actions.map((a) => (
          <Button
            key={a.label}
            type="button"
            variant={a.destructive ? "destructive" : "outline"}
            size="sm"
            className="h-7"
            onClick={() => a.onRun(selected)}
          >
            {a.icon}
            {a.label}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7"
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
}

function RowActionsMenu<TData>({
  row,
  actions,
}: {
  row: Row<TData>;
  actions: DataTableRowAction<TData>[];
}) {
  const visible = actions.filter((a) => !a.hidden?.(row.original));
  if (visible.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Row actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visible.map((a) => (
          <DropdownMenuItem
            key={a.label}
            onSelect={() => a.onSelect(row.original)}
            className={
              a.destructive
                ? "text-[var(--danger)] focus:text-[var(--danger)] cursor-pointer"
                : "cursor-pointer"
            }
          >
            {a.icon}
            {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileCardGrid<TData>({
  table,
  onRowClick,
  rowActions,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  table: TanstackTable<TData>;
  onRowClick?: (row: TData) => void;
  rowActions?: DataTableRowAction<TData>[];
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
}) {
  const rows = table.getRowModel().rows;
  if (rows.length === 0) {
    return (
      <div className="sm:hidden">
        <EmptyTableState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 sm:hidden">
      {rows.map((row) => (
        <div
          key={row.id}
          onClick={() => onRowClick?.(row.original)}
          className={
            "rounded-md border p-3 " + (onRowClick ? "cursor-pointer" : "")
          }
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--background)",
          }}
        >
          {row.getVisibleCells().map((cell) => {
            if (cell.column.id === "__select") {
              return (
                <div key={cell.id} className="mb-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              );
            }
            return (
              <div
                key={cell.id}
                className="flex items-start justify-between gap-3 py-1"
              >
                <span
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  {typeof cell.column.columnDef.header === "string"
                    ? cell.column.columnDef.header
                    : cell.column.id}
                </span>
                <span
                  className="min-w-0 flex-1 text-right text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              </div>
            );
          })}
          {rowActions ? (
            <div
              className="mt-2 flex justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <RowActionsMenu row={row} actions={rowActions} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function pageSliceStart<TData>(table: TanstackTable<TData>): number {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  if (total === 0) return 0;
  return pageIndex * pageSize + 1;
}

function pageSliceEnd<TData>(table: TanstackTable<TData>): number {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  return Math.min((pageIndex + 1) * pageSize, total);
}
