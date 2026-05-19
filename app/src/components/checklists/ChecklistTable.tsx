import { Empty, EmptyDescription } from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "../ui/progress";
import type { Checklist, Task } from "@/types/types";
import React from "react";
import TaskStatusIcon from "@/features/task/properties/icons/TaskStatusIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";

type ChecklistTableItem = Checklist & {
  CompletedCount: number;
  TaskCount: number;
  Status: Task["Status"];
  Default?: boolean;
};

export function ChecklistsTable() {
  const Checklists: ChecklistTableItem[] = [
    {
      ID: 1,
      Name: "My least favorite checklist",
      TimeCreated: "Dec 13, 2020",
      CompletedCount: 1,
      TaskCount: 3,
      Status: "Blocked",
      IsDefault: false,
    },
    {
      ID: 2,
      Name: "My second least fav checklist",
      TimeCreated: "Dec 14, 2020",
      CompletedCount: 9,
      TaskCount: 10,
      Status: "Doing",
      IsDefault: true,
    },
    {
      ID: 3,
      Name: "Another one",
      TimeCreated: "Dec 10, 2020",
      CompletedCount: 0,
      TaskCount: 4,
      Status: "Todo",
      IsDefault: false,
    },
    {
      ID: 4,
      Name: "This one is done",
      TimeCreated: "Dec 10, 2020",
      CompletedCount: 4,
      TaskCount: 4,
      Status: "Done",
      IsDefault: false,
    },
  ];

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
                      <ItemTitle>{checklist.Name}</ItemTitle>
                    ) : (
                      <ItemTitle className="text-muted-foreground">
                        New Checklist
                      </ItemTitle>
                    )}
                    {checklist.Default && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </span>

                  <ItemDescription>{checklist.TaskCount} tasks</ItemDescription>
                </ItemContent>
                <ItemActions className="flex items-center">
                  <div className="flex flex-col gap-2">
                    <span className="w-full flex justify-end gap-4 items-center">
                      <Progress
                        value={
                          (checklist.CompletedCount / checklist.TaskCount) * 100
                        }
                        className="w-3xs h-1.5"
                      />
                    </span>
                    <ItemDescription className="flex justify-between w-full px-1">
                      <span>{checklist.CompletedCount} done</span>
                      <span>
                        {checklist.TaskCount - checklist.CompletedCount} left
                      </span>
                    </ItemDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Ellipsis />
                  </Button>
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
