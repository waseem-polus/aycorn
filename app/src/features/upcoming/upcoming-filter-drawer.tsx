import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { DateRangeSection } from "@/features/upcoming/upcoming-filter-drawer/date-range-section";
import { ProjectSection } from "@/features/upcoming/upcoming-filter-drawer/project-section";
import { StatusSection } from "@/features/upcoming/upcoming-filter-drawer/status-section";
import { TypeSection } from "@/features/upcoming/upcoming-filter-drawer/type-section";
import { AssigneeSection } from "@/features/upcoming/upcoming-filter-drawer/assignee-section";
import { ChecklistSection } from "@/features/upcoming/upcoming-filter-drawer/checklist-section";
import { PrioritySection } from "@/features/upcoming/upcoming-filter-drawer/priority-section";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";
import type { Project, Stage, TaskTypeGlobal } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

type Props = {
  open: boolean;
  filters: UpcomingFilters;
  showEmpty: boolean;
  projects: Project[];
  stages: Stage[];
  taskTypes: TaskTypeGlobal[];
  allTasks: {
    Assignee: string;
    Checklist: number;
    ChecklistName: string;
    ProjectID: number;
  }[];
  onToggle: (dim: string, key: string | number) => void;
  onClearDim: (dim: string) => void;
  onSetDate: (key: string, value: string) => void;
  onToggleEmpty: (v: boolean) => void;
  onReset: () => void;
  onClose: () => void;
  activeCount: number;
};

export function UpcomingFilterDrawer({
  open,
  filters,
  showEmpty,
  projects,
  stages,
  taskTypes,
  allTasks,
  onToggle,
  onClearDim,
  onSetDate,
  onToggleEmpty,
  onReset,
  onClose,
  activeCount,
}: Props) {
  const uniqueAssignees = [
    ...new Set(allTasks.map((t) => t.Assignee).filter(Boolean)),
  ].sort();

  const uniqueChecklists = (() => {
    const seen = new Set<string>();
    const result: { key: number; label: string; sublabel?: string }[] = [];
    allTasks.forEach((t) => {
      const k = `${t.ProjectID}-${t.Checklist}`;
      if (seen.has(k)) return;
      seen.add(k);
      const proj = projects.find((p) => p.ID === t.ProjectID);
      result.push({
        key: t.Checklist,
        label: t.ChecklistName,
        sublabel: proj?.Name,
      });
    });
    return result;
  })();

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DrawerContent className="flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="flex gap-2 items-center">
            <SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary">{activeCount}</Badge>
            )}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col flex-1 overflow-y-auto px-3  pt-2 gap-4 justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">Project</span>
              <ProjectSection
                projects={projects}
                selected={filters.project}
                onToggle={(k) => onToggle("project", k)}
                onClear={() => onClearDim("project")}
              />
              <ChecklistSection
                checklists={uniqueChecklists}
                selected={filters.checklist}
                onToggle={(k) => onToggle("checklist", k)}
                onClear={() => onClearDim("checklist")}
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">Task</span>
              <StatusSection
                stages={stages}
                selected={filters.stage}
                onToggle={(k) => onToggle("stage", k)}
                onClear={() => onClearDim("stage")}
              />
              <TypeSection
                taskTypes={taskTypes}
                selected={filters.type}
                onToggle={(k) => onToggle("type", k)}
                onClear={() => onClearDim("type")}
              />
              <AssigneeSection
                assignees={uniqueAssignees}
                selected={filters.assignee}
                onToggle={(k) => onToggle("assignee", k)}
                onClear={() => onClearDim("assignee")}
              />
              <PrioritySection
                selected={filters.priority}
                onToggle={(k) => onToggle("priority", k)}
                onClear={() => onClearDim("priority")}
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">Dates</span>
              <DateRangeSection
                label="Planned start"
                fromKey="plannedFrom"
                toKey="plannedTo"
                dates={filters.dates}
                onSet={onSetDate}
                onClear={() => {
                  onSetDate("plannedFrom", "");
                  onSetDate("plannedTo", "");
                }}
              />
              <DateRangeSection
                label="Completed"
                fromKey="completedFrom"
                toKey="completedTo"
                dates={filters.dates}
                onSet={onSetDate}
                onClear={() => {
                  onSetDate("completedFrom", "");
                  onSetDate("completedTo", "");
                }}
              />
            </div>
          </div>

          <Alert className="flex justify-between items-center">
            <div>
              <AlertTitle>Show empty groups</AlertTitle>
              <AlertDescription>
                Reveal groups that currently have no tasks
              </AlertDescription>
            </div>
            <Switch
              checked={showEmpty}
              onCheckedChange={onToggleEmpty}
              onClick={(e) => e.stopPropagation()}
            />
          </Alert>
        </div>

        <DrawerFooter>
          <Button
            variant="outline"
            disabled={activeCount === 0}
            onClick={onReset}
          >
            <RotateCcw className="size-3.5" />
            {activeCount > 0
              ? `Reset ${activeCount} filters`
              : "No filters applied"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
