import { useMemo, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TaskRelationshipType } from "@/types/types";
import { DataTablePagination } from "@/components/data-table-pagination";
import { SortableHeader } from "@/components/projects/table/sortable-header";
import { RelationshipTypeBehaviorCell } from "@/features/relationship-types/relationship-types-data-table/relationship-type-behavior-cell";
import { RelationshipTypeIcon } from "@/features/relationship-types/relationship-types-data-table/relationship-type-icon";
import { RelationshipTypeNameCell } from "@/features/relationship-types/relationship-types-data-table/relationship-type-name-cell";
import { RelationshipTypeRowActions } from "@/features/relationship-types/relationship-types-data-table/relationship-type-row-actions";
import { RelationshipTypesBulkActionsToolbar } from "@/features/relationship-types/relationship-types-data-table/relationship-types-bulk-actions-toolbar";
import { selectedItemClasses, useSharedSelection } from "@/hooks/useSelection";
import { cn } from "@/lib/utils";

type Props = {
  data: TaskRelationshipType[];
  isLoading: boolean;
  emptyMessage?: string;
};

const COLUMN_WIDTHS: Record<string, string | undefined> = {
  select: "32px",
  FromName: undefined,
  ToName: undefined,
  Behavior: "140px",
  UsageCount: "90px",
  actions: "56px",
};
const NAME_MIN_WIDTH = "22%";
const MOBILE_HIDDEN_COLUMNS = new Set(["ToName", "Behavior", "UsageCount"]);

export function RelationshipTypesDataTable({
  data,
  isLoading,
  emptyMessage = "No relationship types found.",
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { getItemProps, selectedIds, setSelectedIds } = useSharedSelection();

  const rowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries(Array.from(selectedIds).map((id) => [id, true])),
    [selectedIds],
  );

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    const next =
      typeof updater === "function" ? updater(rowSelection) : updater;
    setSelectedIds(new Set(Object.keys(next).filter((id) => next[id])));
  };

  const columns = useMemo<ColumnDef<TaskRelationshipType>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) =>
        row.original.IsSystem ? (
          <Checkbox checked={false} disabled className="invisible" />
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
      enableSorting: false,
    },
    {
      accessorKey: "FromName",
      header: ({ column }) => (
        <SortableHeader label="Link Name" column={column} />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5 min-w-0 py-1">
          <div className="flex items-center gap-2 min-w-0">
            <RelationshipTypeIcon type={row.original} />
            <RelationshipTypeNameCell
              type={row.original}
              field="FromName"
              placeholder="Link…"
            />
          </div>
          <div className="flex items-center gap-2 min-w-0 pl-10 sm:hidden">
            <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground" />
            <RelationshipTypeNameCell
              type={row.original}
              field="ToName"
              placeholder="To…"
            />
          </div>
          <div className="flex items-center gap-2 pl-10 sm:hidden">
            <RelationshipTypeBehaviorCell type={row.original} />
            <span className="text-xs text-muted-foreground">
              {row.original.UsageCount} usages
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ToName",
      header: ({ column }) => (
        <SortableHeader label="Inverse Name" column={column} />
      ),
      cell: ({ row }) => (
        <RelationshipTypeNameCell
          type={row.original}
          field="ToName"
          placeholder="Inverse…"
        />
      ),
    },
    {
      accessorKey: "Behavior",
      id: "Behavior",
      header: () => "Behavior",
      cell: ({ row }) => <RelationshipTypeBehaviorCell type={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "UsageCount",
      id: "UsageCount",
      header: ({ column }) => <SortableHeader label="Usages" column={column} />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.UsageCount}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <RelationshipTypeRowActions type={row.original} />,
      enableSorting: false,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: (row) => !row.original.IsSystem,
    initialState: { pagination: { pageSize: 10 } },
    getRowId: (row) => `${row.ID}`,
  });

  const selectedTypes = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: COLUMN_WIDTHS[header.column.id],
                      minWidth:
                        header.column.id === "FromName" ||
                        header.column.id === "ToName"
                          ? NAME_MIN_WIDTH
                          : undefined,
                    }}
                    className={cn(
                      MOBILE_HIDDEN_COLUMNS.has(header.column.id) &&
                        "hidden sm:table-cell",
                    )}
                  >
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
            {!isLoading && table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const itemProps = row.original.IsSystem
                  ? null
                  : getItemProps(row.id);
                const itemOnClick = itemProps?.onClick as
                  | ((e: React.MouseEvent) => void)
                  | undefined;
                const itemClassName =
                  (itemProps?.className as string | undefined) ?? "";
                return (
                  <TableRow
                    key={row.id}
                    {...(itemProps ?? {})}
                    data-task-card=""
                    data-state={row.getIsSelected() && "selected"}
                    onClick={itemOnClick}
                    className={cn(
                      "group",
                      selectedItemClasses({ ring: false }),
                      itemClassName,
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "align-top sm:align-middle",
                          MOBILE_HIDDEN_COLUMNS.has(cell.column.id) &&
                            "hidden sm:table-cell",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        selectedCount={table.getSelectedRowModel().rows.length}
        totalCount={table.getCoreRowModel().rows.length}
        onPreviousPage={() => table.previousPage()}
        onNextPage={() => table.nextPage()}
      />

      <RelationshipTypesBulkActionsToolbar
        selectedTypes={selectedTypes}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  );
}
