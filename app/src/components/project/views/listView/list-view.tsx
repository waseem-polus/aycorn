import { Empty, EmptyDescription } from "@/components/ui/empty";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { ListViewRow } from "./list-view/list-view-row";
import React, { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { ViewHeader } from "../view-header";
import { useSharedSelection } from "@/hooks/useSelection";

export function ListView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Tasks, Stages, Checklists } = useContext(ProjectContext);
  const stagesById = React.useMemo(
    () => new Map(Stages.map((s) => [s.ID, s])),
    [Stages],
  );
  const { getItemProps } = useSharedSelection();

  return (
    <div className="h-full box-border flex flex-col gap-2 overflow-visible">
      <ViewHeader setTaskDrawerOpen={setTaskDrawerOpen} />

      <div className="h-full min-h-0 overflow-auto">
        <ItemGroup className="h-fit box-border rounded-md overflow-visible p-1">
          {Tasks.length > 0 ? (
            Tasks.map((task, i) => (
              <React.Fragment key={task.ID}>
                <ListViewRow
                  task={task}
                  stage={stagesById.get(task.Stage)}
                  showChecklist={Checklists.length > 1}
                  itemProps={getItemProps(task.ID.toString())}
                />
                {Tasks.length - 1 !== i && <ItemSeparator />}
              </React.Fragment>
            ))
          ) : (
            <Empty>
              <EmptyDescription>No Tasks Found</EmptyDescription>
            </Empty>
          )}
        </ItemGroup>
      </div>
    </div>
  );
}
