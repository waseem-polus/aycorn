import React, { useState } from "react";
import { ArrowLeftRightIcon, CircleAlert } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import type { TaskTypeGlobal } from "@/types/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  allTypes: TaskTypeGlobal[];
  typesToDelete: TaskTypeGlobal[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const typeName = (t: TaskTypeGlobal) =>
  t.Name !== "" ? t.Name : "Untitled Type";

function TypeIcon({ type }: { type: TaskTypeGlobal }) {
  return (
    <DynamicIcon
      name={(type.Icon || "circle-dashed") as IconName}
      className={cn("size-4 shrink-0", stageStrokeClass(type.Color))}
      fallback={() => <span className="size-4 shrink-0" />}
    />
  );
}

export function DeleteTaskTypesDialog({
  allTypes,
  typesToDelete,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const { bulkDeleteTaskTypes } = useTaskTypeMutation();

  // Default types can't be deleted — the server skips them. They're excluded
  // from the routing UI but still sent so the result counts them as skipped.
  const deletable = typesToDelete.filter((t) => !t.IsDefault);
  const skippedDefault = typesToDelete.filter((t) => t.IsDefault);
  const withTasks = deletable.filter((t) => t.TaskCount > 0);
  const withoutTasks = deletable.filter((t) => t.TaskCount === 0);
  const orderedTypes = [...withTasks, ...withoutTasks];

  const deletingIds = new Set(deletable.map((t) => t.ID));
  const survivingTypes = allTypes.filter((t) => !deletingIds.has(t.ID));
  const totalTaskCount = withTasks.reduce((sum, t) => sum + t.TaskCount, 0);

  const [mappings, setMappings] = useState<Record<number, number>>({});
  const allMapped = withTasks.every((t) => mappings[t.ID] !== undefined);

  const count = deletable.length;

  const handleOpenChange = (next: boolean) => {
    if (!next) setMappings({});
    onOpenChange(next);
  };

  const handleConfirm = () => {
    const ids = typesToDelete.map((t) => t.ID);
    bulkDeleteTaskTypes.mutate(
      { ids, taskMappings: mappings },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Deleted ${result.success} type${result.success !== 1 ? "s" : ""}.`,
          );
          handleOpenChange(false);
          onSuccess?.();
        },
        onError: (err) => toast.error(err.message || "Failed to delete types."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            Delete {count} type{count !== 1 ? "s" : ""}?
          </DialogTitle>
          <DialogDescription>
            {withTasks.length > 0 ? (
              <>
                <span className="font-bold">
                  {withTasks.length} type{withTasks.length !== 1 ? "s" : ""}
                </span>{" "}
                hold tasks that must be moved to another type before deletion.
                This action cannot be undone.
              </>
            ) : (
              "This action cannot be undone."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1">
          {withTasks.length > 0 ? (
            <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-4 sm:gap-y-2">
              <p className="hidden sm:inline text-xs font-medium text-muted-foreground">
                Types being deleted
              </p>
              <span className="hidden sm:inline" />
              <p className="hidden sm:inline text-xs font-medium text-muted-foreground">
                Move tasks to
              </p>

              {orderedTypes.map((type) => {
                if (type.TaskCount === 0) {
                  return (
                    <div
                      key={type.ID}
                      className="col-span-1 sm:col-span-3 flex items-center gap-2 rounded-md border border-border px-3 py-2"
                    >
                      <TypeIcon type={type} />
                      <span className="text-sm font-medium truncate">
                        {typeName(type)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        No tasks
                      </span>
                    </div>
                  );
                }

                const typeSelector = (
                  <Select
                    value={mappings[type.ID]?.toString() ?? ""}
                    onValueChange={(val) =>
                      setMappings((prev) => ({
                        ...prev,
                        [type.ID]: Number(val),
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pick a type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {survivingTypes.map((dest) => (
                        <SelectItem key={dest.ID} value={dest.ID.toString()}>
                          <span className="flex items-center gap-2">
                            <TypeIcon type={dest} />
                            <span className="truncate">{typeName(dest)}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );

                return (
                  <React.Fragment key={type.ID}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 rounded-md border border-border px-3 py-2">
                      <span className="flex items-center gap-2">
                        <TypeIcon type={type} />
                        <span className="text-sm font-medium truncate">
                          {typeName(type)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {type.TaskCount} task{type.TaskCount !== 1 ? "s" : ""}
                        </span>
                      </span>

                      <div className="flex sm:hidden">{typeSelector}</div>
                    </div>

                    <ArrowLeftRightIcon className="hidden sm:flex text-muted-foreground size-4" />

                    <div className="hidden sm:flex">{typeSelector}</div>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {orderedTypes.map((type) => (
                <div
                  key={type.ID}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                >
                  <TypeIcon type={type} />
                  <span className="text-sm font-medium truncate">
                    {typeName(type)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {(withTasks.length > 0 || skippedDefault.length > 0) && (
          <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <CircleAlert className="size-3.5 mt-0.5 shrink-0" />
            <span>
              {skippedDefault.length > 0 && (
                <>
                  The default type can&apos;t be deleted and will be skipped.{" "}
                </>
              )}
              {withTasks.length > 0 &&
                "You can map several deleted types to the same destination."}
            </span>
          </div>
        )}

        <DialogFooter className="flex flex-row justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={count === 0 || !allMapped || bulkDeleteTaskTypes.isPending}
            onClick={handleConfirm}
          >
            {totalTaskCount > 0
              ? `Delete & move ${totalTaskCount} task${totalTaskCount !== 1 ? "s" : ""}`
              : `Delete ${count} type${count !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
