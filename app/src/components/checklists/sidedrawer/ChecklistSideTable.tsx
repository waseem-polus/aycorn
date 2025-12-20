import { Empty, EmptyDescription } from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import React, { useContext } from "react";
import { Ellipsis, Goal } from "lucide-react";
import TaskStatusIcon from "@/components/task/taskDrawer/icons/TaskStatusIcon";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function ChecklistsTable() {
  const { Checklists } = useContext(ProjectContext);

  return (
    <ItemGroup className="h-full rounded-md border overflow-auto">
      {Checklists.length > 0 ? (
        Checklists.map((checklist, i) => (
          <React.Fragment key={checklist.ID}>
            <Item asChild>
              <a>
                <ItemMedia className="flex flex-col justify-center h-full">
                  <TaskStatusIcon variant={checklist.Status} />
                </ItemMedia>
                <ItemContent>
                  <span className="inline-flex gap-2">
                    {checklist.Name !== "" ? (
                      <ItemTitle
                        className={
                          checklist.Status === "Done"
                            ? "line-through font-normal"
                            : ""
                        }
                      >
                        {checklist.Name}
                      </ItemTitle>
                    ) : (
                      <ItemTitle className="text-neutral-400">
                        New Checklist
                      </ItemTitle>
                    )}
                  </span>

                  <ItemDescription className="pt-2">
                    <Progress
                      value={(checklist.DoneCount / checklist.TotalCount) * 100}
                      className="w-3xs h-1.5"
                    />
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger>
                      {checklist.IsDefault && <Goal className="size-4" />}
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      This is the default checklist for new tasks
                    </TooltipContent>
                  </Tooltip>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      {!checklist.IsDefault && (
                        <DropdownMenuItem>Make Default</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </a>
            </Item>

            {Checklists.length - 1 != i && <ItemSeparator />}
          </React.Fragment>
        ))
      ) : (
        <Empty>
          <EmptyDescription>No Checklists Found</EmptyDescription>
        </Empty>
      )}
    </ItemGroup>
  );
}
