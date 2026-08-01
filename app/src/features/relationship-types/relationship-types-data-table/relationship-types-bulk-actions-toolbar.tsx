import { toast } from "sonner";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  selectedTypes: TaskRelationshipType[];
  onClear: () => void;
};

export function RelationshipTypesBulkActionsToolbar({
  selectedTypes,
  onClear,
}: Props) {
  const { bulkUpdateBehavior, bulkDeleteRelationshipTypes } =
    useRelationshipTypeMutation();
  const count = selectedTypes.length;
  const ids = selectedTypes.map((t) => t.ID);
  const totalUsage = selectedTypes.reduce(
    (sum, t) => sum + (t.UsageCount ?? 0),
    0,
  );
  const busy = bulkUpdateBehavior.isPending || bulkDeleteRelationshipTypes.isPending;

  const handleBehaviorChange = (behavior: string) =>
    bulkUpdateBehavior.mutate(
      { ids, behavior },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Updated ${result.success} relationship type${result.success !== 1 ? "s" : ""}.`,
          );
          onClear();
        },
        onError: () => toast.error("Failed to update relationship types."),
      },
    );

  const handleDelete = () =>
    bulkDeleteRelationshipTypes.mutate(ids, {
      onSuccess: (result) => {
        bulkResultToast(
          result,
          `Deleted ${result.success} relationship type${result.success !== 1 ? "s" : ""}.`,
        );
        onClear();
      },
      onError: () => toast.error("Failed to delete relationship types."),
    });

  return (
    <BulkActionsToolbarBase
      count={count}
      onClear={onClear}
      delete={{
        onConfirm: handleDelete,
        title: `Delete ${count} relationship type${count !== 1 ? "s" : ""}?`,
        description:
          totalUsage > 0
            ? `This will also delete ${totalUsage} existing ${totalUsage === 1 ? "relationship" : "relationships"} of these types. This action cannot be undone.`
            : "This action cannot be undone.",
        busy: bulkDeleteRelationshipTypes.isPending,
      }}
    >
      <Select onValueChange={handleBehaviorChange}>
        <SelectTrigger size="sm" className="w-auto gap-1.5" disabled={busy}>
          <SelectValue placeholder="Set behavior…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="blocking">Blocking</SelectItem>
          <SelectItem value="subtask">Subtask</SelectItem>
          <SelectItem value="link">Link</SelectItem>
        </SelectContent>
      </Select>
    </BulkActionsToolbarBase>
  );
}
