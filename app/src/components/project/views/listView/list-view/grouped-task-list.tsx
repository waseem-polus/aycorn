import { useContext, useMemo } from "react";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useToday } from "@/features/task-filters/hooks/useToday";
import { GroupHeader } from "@/features/views/grouping/group-header";
import { buildGroups, type GroupingData } from "@/features/views/grouping/task-grouping";
import { useCollapsedGroups } from "@/features/views/hooks/useCollapsedGroups";
import type { BoardView, GroupByKey } from "@/features/views/view-types";
import { useSharedSelection } from "@/hooks/useSelection";
import { ListViewRow } from "./list-view-row";

type Props = {
  view: BoardView;
  groupBy: GroupByKey;
};

/** The project list, bucketed by the view's grouping under collapsible headers. */
export function GroupedTaskList({ view, groupBy }: Props) {
  const { Project, Tasks, Stages, Checklists } = useContext(ProjectContext);
  const { getItemProps } = useSharedSelection();
  const today = useToday();
  const { isCollapsed, toggleCollapsed } = useCollapsedGroups(
    `aycorn.project.${Project.ID}.view.${view.ID}.collapsed`,
  );
  const stagesById = useMemo(() => new Map(Stages.map((s) => [s.ID, s])), [Stages]);
  const granularity = view.GroupOptions.granularity ?? "week";

  const groups = useMemo(() => {
    const data: GroupingData = {
      projectById: { [Project.ID]: Project },
      stageById: Object.fromEntries(Stages.map((s) => [s.ID, s])),
    };
    return buildGroups(Tasks, { groupBy, granularity, today, data });
  }, [Tasks, Stages, Project, groupBy, granularity, today]);

  if (groups.length === 0) {
    return (
      <Empty>
        <EmptyDescription>No Tasks Found</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="rounded-md border border-border">
      {groups.map((group) => {
        const collapsed = isCollapsed(group.key);
        return (
          <section key={group.key}>
            <GroupHeader
              group={group}
              collapsed={collapsed}
              onToggle={() => toggleCollapsed(group.key)}
            />
            {!collapsed && (
              <ItemGroup className="p-1">
                {group.tasks.map((task, i) => (
                  <div key={task.ID}>
                    <ListViewRow
                      task={task}
                      stage={stagesById.get(task.Stage)}
                      showChecklist={Checklists.length > 1}
                      itemProps={getItemProps(task.ID.toString())}
                    />
                    {group.tasks.length - 1 !== i && <ItemSeparator />}
                  </div>
                ))}
              </ItemGroup>
            )}
          </section>
        );
      })}
    </div>
  );
}
