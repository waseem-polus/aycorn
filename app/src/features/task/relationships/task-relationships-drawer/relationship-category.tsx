import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { LinkIcon, PlusIcon } from "lucide-react";
import {
  stageBadgeClass,
  stageStrokeClass,
} from "@/features/stage/stage-palette";
import { RelationshipTaskRow } from "@/features/task/relationships/task-relationships-drawer/relationship-task-row";
import type { RelationshipCategory } from "@/features/task/relationships/relationships-grouping";

export function RelationshipCategorySection({
  category,
}: {
  category: RelationshipCategory;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 py-2">
        <span className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className={stageBadgeClass(category.color)}>
            <DynamicIcon
              name={category.icon as IconName}
              className={stageStrokeClass(category.color)}
              fallback={() => <LinkIcon />}
            />
            {category.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {category.relationships.length}
          </span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:cursor-pointer"
        >
          <PlusIcon />
          Add
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        {category.relationships.map((rel) => (
          <RelationshipTaskRow key={rel.ID} task={rel.Other} />
        ))}
      </div>
    </div>
  );
}
