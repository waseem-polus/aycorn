import { ArrowLeftRightIcon } from "lucide-react";
import {
  BEHAVIOR_FROM_NAME_PLACEHOLDER,
  BEHAVIOR_TO_NAME_PLACEHOLDER,
} from "@/features/relationship-types/behavior-constants";
import { RelationshipTypeNameCell } from "@/features/relationship-types/relationship-types-data-table/relationship-type-name-cell";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  type: TaskRelationshipType;
};

export function RelationshipTypeNameInline({ type }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <RelationshipTypeNameCell
        type={type}
        field="FromName"
        placeholder={BEHAVIOR_FROM_NAME_PLACEHOLDER[type.Behavior]}
        showTooltip={false}
        wrap={false}
      />
      <ArrowLeftRightIcon className="size-3 shrink-0 text-muted-foreground" />
      <RelationshipTypeNameCell
        type={type}
        field="ToName"
        placeholder={BEHAVIOR_TO_NAME_PLACEHOLDER[type.Behavior]}
        showTooltip={false}
        wrap={false}
      />
    </div>
  );
}
