import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { SelectRelationshipTask } from "@/features/task/relationships/select-relationship-task";
import { SelectRelationshipTypeAndDirection } from "@/features/task/relationships/select-relationship-type-and-direction";
import { useBulkCreateTaskRelationshipsMutation } from "@/features/task/relationships/queries/useBulkCreateTaskRelationshipsMutation";
import { pluralize } from "@/utils/pluralize";
import type { TaskWithProject } from "@/types/types";

type State =
  | null
  | { step: "category" }
  | { step: "task"; typeId: number; direction: "from" | "to" };

type Props = {
  taskIds: number[];
};

export function AddRelationshipButton({ taskIds }: Props) {
  const [state, setState] = useState<State>(null);
  const bulkCreate = useBulkCreateTaskRelationshipsMutation();

  const excludeTaskIds = new Set(taskIds);

  const handleCategorySelect = (typeId: number, direction: "from" | "to") => {
    setState({ step: "task", typeId, direction });
  };

  const handleTargetSelect = (targetTask: TaskWithProject) => {
    if (!state || state.step !== "task") return;
    const { typeId, direction } = state;
    bulkCreate.mutate(
      { typeId, direction, targetTaskId: targetTask.ID, taskIds },
      {
        onSuccess: (result) => {
          if (result.success === 0) {
            toast("No links added — all selected tasks were already linked.");
          } else {
            toast(
              `Linked ${pluralize(result.success, "task")}` +
                (result.skipped > 0 ? ` (${result.skipped} skipped).` : "."),
            );
          }
        },
      },
    );
    setState(null);
  };

  const trigger = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Link tasks"
      disabled={bulkCreate.isPending}
    >
      <LinkIcon />
    </Button>
  );

  if (state?.step === "task") {
    return (
      <SelectRelationshipTask
        open={true}
        onOpenChange={(open) => {
          if (!open) setState(null);
        }}
        excludeTaskIds={excludeTaskIds}
        onSelect={handleTargetSelect}
        trigger={trigger}
      />
    );
  }

  return (
    <SelectRelationshipTypeAndDirection
      open={state?.step === "category"}
      onOpenChange={(open) => setState(open ? { step: "category" } : null)}
      onSelect={handleCategorySelect}
      trigger={trigger}
    />
  );
}
