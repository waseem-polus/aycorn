import { Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";
import type { Project } from "@/types/types";

type BulkActionsToolbarProps = {
  selectedProjects: Project[];
  onClear: () => void;
};

export function BulkActionsToolbar({
  selectedProjects,
  onClear,
}: BulkActionsToolbarProps) {
  const { bulkSetPinned, bulkDelete } = useAllProjectsMutation();
  const count = selectedProjects.length;
  const busy = bulkSetPinned.isPending || bulkDelete.isPending;
  const ids = selectedProjects.map((p) => p.ID);

  const handleSetPinned = (pinned: boolean) =>
    bulkSetPinned.mutate(
      { ids, pinned },
      {
        onSuccess: onClear,
        onError: () => toast("Failed updating projects."),
      },
    );

  const handleDelete = () =>
    bulkDelete.mutate(ids, {
      onSuccess: (result) => {
        const parts = [
          `Deleted ${result.success} project${result.success !== 1 ? "s" : ""}.`,
        ];
        if (result.failed > 0) parts.push(`${result.failed} failed.`);
        toast(parts.join(" "));
        onClear();
      },
      onError: () => toast("Failed deleting projects."),
    });

  return (
    <BulkActionsToolbarBase
      count={count}
      onClear={onClear}
      delete={{
        onConfirm: handleDelete,
        title: `Delete ${count} project${count !== 1 ? "s" : ""}?`,
        description: "This action cannot be undone.",
        busy: bulkDelete.isPending,
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSetPinned(true)}
        disabled={busy}
      >
        <Pin />
        Pin
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSetPinned(false)}
        disabled={busy}
      >
        <PinOff />
        Unpin
      </Button>
    </BulkActionsToolbarBase>
  );
}
