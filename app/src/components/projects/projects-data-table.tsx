import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Project } from "@/types/types";
import { DataTablePagination } from "@/components/data-table-pagination";
import { BulkActionsToolbar } from "@/components/projects/table/bulk-actions-toolbar";
import { ProjectNameCell } from "@/components/projects/table/project-name-cell";
import { ProjectRowActions } from "@/components/projects/table/project-row-actions";
import { SortableHeader } from "@/components/projects/table/sortable-header";
import { WorkflowCell } from "@/components/projects/table/workflow-cell";
import { selectedItemClasses, useSharedSelection } from "@/hooks/useSelection";
import { cn } from "@/lib/utils";

interface ProjectsDataTableProps {
  data: Project[];
  isFetching: boolean;
}

const COLUMN_WIDTHS: Record<string, string | undefined> = {
  select: "32px",
  Name: undefined,
  Workflow: "20%",
  TimeCreated: "20%",
  TimeModified: "20%",
  actions: "60px",
};
const NAME_MIN_WIDTH = "30%";
const MOBILE_HIDDEN_COLUMNS = new Set([
  "Workflow",
  "TimeCreated",
  "TimeModified",
]);

export function ProjectsDataTable({
  data,
  isFetching,
}: ProjectsDataTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const columns: ColumnDef<Project>[] = [
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
      cell: ({ row }) => (
        <ProjectNameCell
          project={row.original}
          isEditing={editingId === row.original.ID}
          onStartEdit={() => setEditingId(row.original.ID)}
          onStopEdit={() => setEditingId(null)}
        />
      ),
    },
    {
      accessorKey: "WorkflowName",
      id: "Workflow",
      header: ({ column }) => (
        <SortableHeader label="Workflow" column={column} />
      ),
      cell: ({ row }) => (
        <WorkflowCell
          workflowId={row.original.Workflow}
          workflowName={row.original.WorkflowName}
        />
      ),
    },
    {
      accessorKey: "TimeCreated",
      header: ({ column }) => (
        <SortableHeader label="Created" column={column} />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.TimeCreated);
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block max-w-full truncate text-muted-foreground">
                {formatDistanceToNow(date, { addSuffix: true })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {format(date, "MMM d, yyyy (h:mm a)")}
            </TooltipContent>
          </Tooltip>
        );
      },
      sortingFn: (a, b) =>
        new Date(a.original.TimeCreated).getTime() -
        new Date(b.original.TimeCreated).getTime(),
    },
    {
      accessorKey: "TimeModified",
      header: ({ column }) => (
        <SortableHeader label="Modified" column={column} />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.TimeModified);
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block max-w-full truncate text-muted-foreground">
                {formatDistanceToNow(date, { addSuffix: true })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {format(date, "MMM d, yyyy (h:mm a)")}
            </TooltipContent>
          </Tooltip>
        );
      },
      sortingFn: (a, b) =>
        new Date(a.original.TimeModified).getTime() -
        new Date(b.original.TimeModified).getTime(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ProjectRowActions
          project={row.original}
          onRename={() => setEditingId(row.original.ID)}
        />
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
    getRowId: (row) => `${row.ID}`,
  });

  const handleRowClick = (row: Row<Project>) => {
    if (editingId !== null) return;
    navigate({
      to: "/project/$projectId",
      params: { projectId: `${row.original.ID}` },
    });
  };

  const selectedProjects = table
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
                        header.column.id === "Name"
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
            {!isFetching && table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const itemProps = getItemProps(row.id);
                const itemOnClick = (
                  itemProps as {
                    onClick?: (e: React.MouseEvent) => void;
                  }
                ).onClick;
                const itemClassName =
                  (itemProps.className as string | undefined) ?? "";
                return (
                  <TableRow
                    key={row.id}
                    {...itemProps}
                    data-task-card=""
                    data-state={row.getIsSelected() && "selected"}
                    onClick={(e) => {
                      itemOnClick?.(e);
                      if (!e.defaultPrevented) handleRowClick(row);
                    }}
                    className={cn(
                      "group cursor-pointer",
                      selectedItemClasses({ ring: false }),
                      itemClassName,
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          MOBILE_HIDDEN_COLUMNS.has(cell.column.id) &&
                            "hidden sm:table-cell",
                        )}
                        onClick={
                          cell.column.id === "select"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
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
                  No Projects Found
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

      <BulkActionsToolbar
        selectedProjects={selectedProjects}
        onClear={() => table.resetRowSelection()}
      />
    </div>
  );
}
