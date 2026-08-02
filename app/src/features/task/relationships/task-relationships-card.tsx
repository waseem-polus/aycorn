import { useContext, useEffect } from "react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import {
  stageBadgeClass,
  stageStrokeClass,
} from "@/features/stage/stage-palette";
import { TaskRelationshipsDrawer } from "@/features/task/relationships/task-relationships-drawer";
import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useIsMobile } from "@/hooks/useMobile";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  groupRelationshipsByType,
  toRelationshipSections,
  type RelationshipSection,
} from "@/features/task/relationships/relationships-grouping";

const sectionLabel = (section: RelationshipSection) => {
  const total = section.relationships.length;

  return (
    <>
      <span className="font-light">{section.label}</span> {total}
    </>
  );
};

export function TaskRelationshipsCard() {
  const isMobile = useIsMobile();
  const { state: task } = useContext(TaskContext);
  const { data, isError } = useTaskRelationshipsQuery(task.ID);

  useEffect(() => {
    if (isError) toast.error("Failed to load linked tasks");
  }, [isError]);

  const relationships = data ?? [];
  const sections = toRelationshipSections(groupRelationshipsByType(relationships));
  const total = relationships.length;

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} handleOnly={!isMobile}>
      <DrawerTrigger asChild>
        <div className="relative flex justify-between items-start gap-3">
            <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground min-w-1/5 sm:min-w-1/7 min-h-9 align-middle">
                Links
            </span>

                  <Button variant="outline" className={cn("flex gap-2 px-3 w-full h-fit min-h-9 justify-start items-start flex-1 min-w-0")}>
                      <LinkIcon className="stroke-muted-foreground size-3.5 shrink mt-1" />
                {total === 0 ? (
                    <>
                        <span className="text-muted-foreground text-sm">
                            Manage links
                        </span>
                    </>
                ) : (
                    <span className="flex shrink gap-1 sm:gap-2 min-w-0 flex-wrap">
                    {sections.map((section) => (
                        <Badge
                            key={section.key}
                            className={stageBadgeClass(section.type.Color)}
                        >
                            <DynamicIcon
                                name={section.type.Icon as IconName}
                                className={stageStrokeClass(section.type.Color)}
                                fallback={() => <LinkIcon />}
                            />
                            {sectionLabel(section)}
                        </Badge>
                    ))}
                    </span>
                )}
            </Button>
        </div>
      </DrawerTrigger>
      <TaskRelationshipsDrawer />
    </Drawer>
  );
}
