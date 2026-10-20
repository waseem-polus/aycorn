import { PlusIcon, SquareDashedIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";

type Props = {
  groupId: string;
  /** False at the depth cap, where a subgroup would nest too deep. */
  canAddGroup: boolean;
};

export function AddNodeButtons({ groupId, canAddGroup }: Props) {
  const { tree } = useConditionBuilder();
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => tree.addCondition(groupId)}
      >
        <PlusIcon />
        Condition
      </Button>
      {canAddGroup && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => tree.addGroup(groupId)}
        >
          <SquareDashedIcon />
          Group
        </Button>
      )}
    </div>
  );
}
