import { LockIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BEHAVIOR_LABEL } from "@/features/relationship-types/behavior-constants";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import type { RelationshipBehavior, TaskRelationshipType } from "@/types/types";

type Props = {
  type: TaskRelationshipType;
};

export function RelationshipTypeBehaviorCell({ type }: Props) {
  const { updateRelationshipType } = useRelationshipTypeMutation();

  if (type.IsSystem) {
    return (
      <Badge variant="secondary" className="text-xs gap-1">
        <LockIcon className="size-3" />
        {BEHAVIOR_LABEL[type.Behavior]}
      </Badge>
    );
  }

  const handleChange = (behavior: string) => {
    updateRelationshipType.mutate(
      {
        ID: type.ID,
        FromName: type.FromName,
        ToName: type.ToName,
        Behavior: behavior as RelationshipBehavior,
        Icon: type.Icon,
      },
      { onError: () => toast.error("Failed to update behavior.") },
    );
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Select value={type.Behavior} onValueChange={handleChange}>
        <SelectTrigger size="sm" className="w-auto gap-1.5 px-2 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="blocking">Blocking</SelectItem>
          <SelectItem value="subtask">Subtask</SelectItem>
          <SelectItem value="link">Link</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
