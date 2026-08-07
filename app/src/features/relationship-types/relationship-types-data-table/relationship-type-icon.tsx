import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { toast } from "sonner";
import { IconPicker } from "@/features/icon-picker/icon-picker";
import { BEHAVIOR_COLOR } from "@/features/relationship-types/behavior-constants";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  type: TaskRelationshipType;
};

export function RelationshipTypeIcon({ type }: Props) {
  const { updateRelationshipTypeIcon } = useRelationshipTypeMutation();
  const color = BEHAVIOR_COLOR[type.Behavior] ?? "gray";

  if (type.IsSystem) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center">
        <DynamicIcon
          name={(type.Icon || "link") as IconName}
          className={cn("size-4", stageStrokeClass(color))}
          fallback={() => <span className="size-4" />}
        />
      </div>
    );
  }

  const handleSelect = (icon: string) => {
    updateRelationshipTypeIcon.mutate(
      { id: type.ID, icon },
      { onError: () => toast.error("Failed to update icon.") },
    );
  };

  return (
    <div
      className="flex size-8 shrink-0 items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <IconPicker
        value={type.Icon}
        onSelect={handleSelect}
        iconClassName={stageStrokeClass(color)}
      />
    </div>
  );
}
