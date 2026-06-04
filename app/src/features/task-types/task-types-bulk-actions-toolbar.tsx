import { useMemo, useState } from "react";
import { ChevronDown, FolderInput, Palette, Shapes, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TaskTypeCategory, TaskTypeGlobal } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { IconPickerPopover } from "@/features/icon-picker/icon-picker-popover";
import { ColorGrid } from "@/features/color-picker/color-grid";
import { useSharedSelection } from "@/hooks/useSelection";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import { DeleteTaskTypesDialog } from "@/features/task-types/delete-task-types-dialog";

const categoryName = (c: TaskTypeCategory) =>
  c.Name !== "" ? c.Name : "Untitled category";

export function TaskTypesBulkActionsToolbar({
  types,
  categories,
}: {
  types: TaskTypeGlobal[];
  categories: TaskTypeCategory[];
}) {
  const { selectedIds, clearSelection } = useSharedSelection();
  const { bulkUpdateTaskTypes } = useTaskTypeMutation();
  const [colorOpen, setColorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedTypes = useMemo(
    () => types.filter((t) => selectedIds.has(`tt-${t.ID}`)),
    [types, selectedIds],
  );

  const count = selectedTypes.length;
  const ids = selectedTypes.map((t) => t.ID);
  const busy = bulkUpdateTaskTypes.isPending;

  const apply = (
    changes: Partial<Pick<TaskTypeGlobal, "Icon" | "Color" | "Category">>,
    lead: string,
  ) =>
    bulkUpdateTaskTypes.mutate(
      { ids, changes },
      {
        onSuccess: (result) => {
          bulkResultToast(result, lead);
          clearSelection();
        },
        onError: () => toast.error("Failed to update types."),
      },
    );

  const noun = (n: number) => `${n} type${n !== 1 ? "s" : ""}`;

  return (
    <>
      <BulkActionsToolbarBase count={count} onClear={clearSelection}>
        <IconPickerPopover
          value=""
          onSelect={(icon) => apply({ Icon: icon }, `Updated ${noun(count)}.`)}
          align="center"
          trigger={
            <Button variant="outline" disabled={busy}>
              <Shapes />
              Icon
            </Button>
          }
        />

        <Popover open={colorOpen} onOpenChange={setColorOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={busy}>
              <Palette />
              Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="center">
            <ColorGrid
              value=""
              onSelect={(color) => {
                setColorOpen(false);
                apply({ Color: color }, `Updated ${noun(count)}.`);
              }}
            />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={busy}>
              <FolderInput />
              Category
              <ChevronDown className="ml-1 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.ID}
                onClick={() =>
                  apply(
                    { Category: category.ID },
                    `Moved ${noun(count)} to ${categoryName(category)}.`,
                  )
                }
              >
                {categoryName(category)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
          Delete
        </Button>
      </BulkActionsToolbarBase>

      <DeleteTaskTypesDialog
        allTypes={types}
        typesToDelete={selectedTypes}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={clearSelection}
      />
    </>
  );
}
