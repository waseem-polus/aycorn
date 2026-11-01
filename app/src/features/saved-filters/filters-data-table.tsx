import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
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
import { SortableHeader } from "@/components/data-table-sortable-header";
import { definitionRuleCount } from "@/features/saved-filters/filter-definition";
import { FilterNameCell } from "@/features/saved-filters/filters-data-table/filter-name-cell";
import { FilterPinsCell } from "@/features/saved-filters/filters-data-table/filter-pins-cell";
import { FilterRowActions } from "@/features/saved-filters/filters-data-table/filter-row-actions";
import { FiltersBulkActionsToolbar } from "@/features/saved-filters/filters-data-table/filters-bulk-actions-toolbar";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { useDateFormat } from "@/hooks/useDateFormatter";
import { selectedItemClasses, useSharedSelection } from "@/hooks/useSelection";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/types";

type Props = {
  data: SavedFilter[];
  projects: Project[];
  isLoading: boolean;
  emptyMessage: string;
};

const COLUMN_WIDTHS: Record<string, string | undefined> = {
  select: "32px",
  Name: undefined,
  pins: "260px",
  rules: "90px",
  TimeModified: "130px",
  actions: "56px",
};

/** Every saved filter: rename in place, choose its boards, duplicate or delete (bulk too). */
export function FiltersDataTable({ data, projects, isLoading, emptyMessage }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { getItemProps, selectedIds, setSelectedIds } = useSharedSelection();
  const { toFormatted } = useDateFormat();

  const rowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries(Array.from(selectedIds).map((id) => [id, true])),
    [selectedIds],
  );
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    setSelectedIds(new Set(Object.keys(next).filter((id) => next[id])));
  };

  const columns = useMemo<ColumnDef<SavedFilter>[]>(
    () => [
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
        cell: ({ row }) => (
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
        accessorKey: "Name",
        header: ({ column }) => <SortableHeader label="Name" column={column} />,
        cell: ({ row }) => <FilterNameCell filter={row.original} />,
      },
      {
        id: "pins",
        header: () => "Pinned to",
        cell: ({ row }) => <FilterPinsCell filter={row.original} projects={projects} />,
        enableSorting: false,
      },
      {
        id: "rules",
        accessorFn: (f) => definitionRuleCount(f.Definition),
        header: ({ column }) => <SortableHeader label="Rules" column={column} />,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "TimeModified",
        header: ({ column }) => <SortableHeader label="Modified" column={column} />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {toFormatted(row.original.TimeModified)}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => <FilterRowActions filter={row.original} />,
        enableSorting: false,
      },
    ],
    [projects, toFormatted],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => `${row.ID}`,
  });

  const selected = table.getSelectedRowModel().rows.map((r) => r.original);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: COLUMN_WIDTHS[header.column.id] }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isLoading && table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const itemProps = getItemProps(row.id);
                return (
                  <TableRow
                    key={row.id}
                    {...itemProps}
                    data-task-card=""
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "group",
                      selectedItemClasses({ ring: false }),
                      (itemProps.className as string | undefined) ?? "",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {isLoading ? "Loading…" : emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <FiltersBulkActionsToolbar selected={selected} onClear={() => setSelectedIds(new Set())} />
    </div>
  );
}
