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
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Card className="mx-3 sm:mx-6 mt-4 px-3 py-4 sm:p-4 hover:bg-accent hover:cursor-pointer min-w-0">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-0 gap-3 sm:gap-2 min-w-0">
            <div className="flex sm:shrink justify-between">
              <span className="flex items-center gap-2">
                <LinkIcon className="size-3 stroke-muted-foreground" />
                Relations
              </span>

              <span className="inline-flex sm:hidden items-center gap-1 text-muted-foreground text-xs">
                Manage
                <ChevronRight className="size-4" />
              </span>
            </div>
            <span className="flex flex-1 sm:px-2 gap-1 min-w-0 flex-wrap">
              <Badge variant="outline" className={stageBadgeClass("red")}>
                <OctagonMinusIcon className={stageStrokeClass("red")} />
                <span className="font-semibold">0</span>
                <span className="font-light"> of </span>
                <span className="font-semibold">2</span>
                <span className="font-light">Blockers resolved</span>
              </Badge>
              <Badge variant="outline" className={stageBadgeClass("red")}>
                <OctagonMinusIcon className={stageStrokeClass("red")} />1
                <span className="font-light">Blocked by</span>
              </Badge>
              <Badge variant="outline" className={stageBadgeClass("purple")}>
                <AtSignIcon className={stageStrokeClass("purple")} />2
                <span className="font-light">Mentions</span>
              </Badge>
              <Badge variant="outline" className={stageBadgeClass("purple")}>
                <AtSignIcon className={stageStrokeClass("purple")} />1
                <span className="font-light">Mentioned by</span>
              </Badge>
              <Badge variant="outline" className={stageBadgeClass("emerald")}>
                <ListTodoIcon className={stageStrokeClass("emerald")} />
                <span className="font-semibold">1</span>
                <span className="font-light"> of </span>
                <span className="font-semibold">2</span>
                <span className="font-light">Subtasks done</span>
              </Badge>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground text-xs">
              Manage
              <ChevronRight className="size-4" />
            </span>
          </CardContent>
        </Card>
      </DrawerTrigger>
      <TaskRelationshipsDrawer />
    </Drawer>
  );
}
