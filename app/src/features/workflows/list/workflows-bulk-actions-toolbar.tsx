import { useMemo } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { useSharedSelection } from "@/hooks/useSelection";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";

export function WorkflowsBulkActionsToolbar() {
  const { selectedIds, clearSelection } = useSharedSelection();
  const { data: workflows } = useAllWorkflowsQuery();
  const { bulkDeleteWorkflows, bulkDuplicateWorkflows } = useWorkflowMutation();

  const selectedWorkflows = useMemo(() => {
    const ids = new Set(Array.from(selectedIds).map((id) => Number(id)));
    return (workflows ?? []).filter((w) => ids.has(w.ID));
  }, [workflows, selectedIds]);

  const count = selectedWorkflows.length;
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
        clearSelection();
      },
      onError: () => toast.error("Failed to delete workflows."),
    });

  return (
    <BulkActionsToolbarBase
      count={count}
      onClear={clearSelection}
      delete={{
        onConfirm: handleDelete,
        title: `Delete ${count} workflow${count !== 1 ? "s" : ""}?`,
        description:
          "Workflows currently used by a project will be skipped. This action cannot be undone.",
        busy: bulkDeleteWorkflows.isPending,
      }}
    >
      <Button variant="ghost" size="sm" onClick={handleDuplicate} disabled={busy}>
        <Copy />
        Duplicate
      </Button>
    </BulkActionsToolbarBase>
  );
}
