import { useMemo, useState } from "react";
import { Copy, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSharedSelection } from "@/hooks/useSelection";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";

export function WorkflowsBulkActionsToolbar() {
  const { selectedIds, clearSelection } = useSharedSelection();
  const { data: workflows } = useAllWorkflowsQuery();
  const { bulkDeleteWorkflows, bulkDuplicateWorkflows } = useWorkflowMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedWorkflows = useMemo(() => {
    const ids = new Set(Array.from(selectedIds).map((id) => Number(id)));
    return (workflows ?? []).filter((w) => ids.has(w.ID));
  }, [workflows, selectedIds]);

  const count = selectedWorkflows.length;
  if (count === 0) return null;

  const busy = bulkDeleteWorkflows.isPending || bulkDuplicateWorkflows.isPending;
  const ids = selectedWorkflows.map((w) => w.ID);

  const handleDuplicate = () =>
    bulkDuplicateWorkflows.mutate(ids, {
      onSuccess: (result) => {
        const parts = [
          `Duplicated ${result.success} workflow${result.success !== 1 ? "s" : ""}.`,
        ];
        if (result.failed > 0) parts.push(`${result.failed} failed.`);
        toast(parts.join(" "));
        clearSelection();
      },
      onError: () => toast.error("Failed to duplicate workflows."),
    });

  const handleDelete = () =>
    bulkDeleteWorkflows.mutate(ids, {
      onSuccess: (result) => {
        const parts = [
          `Deleted ${result.success} workflow${result.success !== 1 ? "s" : ""}.`,
        ];
        if (result.skipped > 0) parts.push(`${result.skipped} in use.`);
        if (result.failed > 0) parts.push(`${result.failed} failed.`);
        toast(parts.join(" "));
        setDeleteOpen(false);
        clearSelection();
      },
      onError: () => toast.error("Failed to delete workflows."),
    });

  return (
    <>
      <div
        data-keep-selection=""
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-lg border bg-background px-3 py-1.5 shadow-lg"
      >
        <span className="text-sm font-medium px-2">{count} selected</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={clearSelection}
          aria-label="Clear selection"
        >
          <X />
        </Button>
        <Separator orientation="vertical" className="!h-6 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDuplicate}
          disabled={busy}
        >
          <Copy />
          Duplicate
        </Button>
        <Separator orientation="vertical" className="!h-6 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          disabled={busy}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
          Delete
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {count} workflow{count !== 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Workflows currently used by a project will be skipped. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={bulkDeleteWorkflows.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
