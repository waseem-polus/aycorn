import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  stageBadgeClass,
  stageStrokeClass,
} from "@/features/stage/stage-palette";
import { TaskRelationshipsDrawer } from "@/features/task/relationships/task-relationships-drawer";
import {
  AtSignIcon,
  ChevronRight,
  LinkIcon,
  ListTodoIcon,
  OctagonMinusIcon,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

export function TaskRelationshipsCard() {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} handleOnly={!isMobile}>
      <DrawerTrigger asChild>
        <Card className="mx-3 sm:mx-6 mt-2 sm:mt-4 px-3 py-4 sm:p-4 hover:bg-accent hover:cursor-pointer min-w-0">
          <CardContent className="flex flex-col p-0 gap-4 sm:gap-2 min-w-0">
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <LinkIcon className="size-3 stroke-muted-foreground" />
                Linked Tasks
              </span>

              <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                Manage 7 links
                <ChevronRight className="size-4" />
              </span>
            </div>
            <span className="flex flex-1 gap-1 sm:gap-2 min-w-0 flex-wrap">
              <Badge variant="outline" className={stageBadgeClass("red")}>
                <OctagonMinusIcon className={stageStrokeClass("red")} />
                <span className="font-semibold">0</span>
                <span className="font-light"> of </span>
                <span className="font-semibold">2</span>
                <span className="font-light">blockers resolved</span>
              </Badge>
              <Badge variant="outline" className={stageBadgeClass("red")}>
                <OctagonMinusIcon className={stageStrokeClass("red")} />
                <span className="font-light">Blocks</span>1
              </Badge>
              <Badge variant="outline" className={stageBadgeClass("purple")}>
                <AtSignIcon className={stageStrokeClass("purple")} />
                <span className="font-light">Mentions</span> 2
              </Badge>
              <Badge variant="outline" className={stageBadgeClass("purple")}>
                <AtSignIcon className={stageStrokeClass("purple")} />
                <span className="font-light">Mentioned by</span> 1
              </Badge>
              <Badge variant="outline" className={stageBadgeClass("emerald")}>
                <ListTodoIcon className={stageStrokeClass("emerald")} />
                <span className="font-semibold">1</span>
                <span className="font-light"> of </span>
                <span className="font-semibold">2</span>
                <span className="font-light">subtasks done</span>
              </Badge>
            </span>
          </CardContent>
        </Card>
      </DrawerTrigger>
      <TaskRelationshipsDrawer />
    </Drawer>
  );
}
