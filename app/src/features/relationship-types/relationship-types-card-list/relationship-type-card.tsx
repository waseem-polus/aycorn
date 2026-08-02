import { LockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RelationshipTypeBehaviorCell } from "@/features/relationship-types/relationship-types-data-table/relationship-type-behavior-cell";
import { RelationshipTypeIcon } from "@/features/relationship-types/relationship-types-data-table/relationship-type-icon";
import { RelationshipTypeCardMenu } from "@/features/relationship-types/relationship-types-card-list/relationship-type-card-menu";
import { RelationshipTypeNameInline } from "@/features/relationship-types/relationship-types-card-list/relationship-type-name-inline";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  type: TaskRelationshipType;
};

export function RelationshipTypeCard({ type }: Props) {
  return (
    <Card className="gap-2 rounded-lg p-3 shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <RelationshipTypeIcon type={type} />
          <RelationshipTypeNameInline type={type} />
        </div>
        {type.IsSystem ? (
          <LockIcon className="size-4 shrink-0 text-muted-foreground mt-2" />
        ) : (
          <RelationshipTypeCardMenu type={type} />
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {type.UsageCount} {type.UsageCount === 1 ? "task" : "tasks"}
        </span>
        <RelationshipTypeBehaviorCell type={type} />
      </div>
    </Card>
  );
}
