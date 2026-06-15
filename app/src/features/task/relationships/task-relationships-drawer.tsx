import { useContext, useMemo, useState } from "react";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkIcon, PlusIcon, SearchIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import { useTaskRelationshipTypesQuery } from "@/features/task/relationships/queries/useTaskRelationshipTypesQuery";
import { useCreateTaskRelationshipMutation } from "@/features/task/relationships/queries/useCreateTaskRelationshipMutation";
import { groupIntoCategories } from "@/features/task/relationships/relationships-grouping";
import { RelationshipCategorySection } from "@/features/task/relationships/task-relationships-drawer/relationship-category";
import { SelectRelationshipTask } from "@/features/task/relationships/task-relationships-drawer/select-relationship-task";
import { stageBadgeClass, stageStrokeClass } from "@/features/stage/stage-palette";
import type { RelationshipBehavior, TaskRelationshipType, TaskWithProject } from "@/types/types";

type NewRelState =
  | null
  | { step: "category" }
  | { step: "task"; typeId: number; direction: "from" | "to" };

const BEHAVIOR_GROUP_LABEL: Record<RelationshipBehavior, string> = {
  blocking: "Blocking",
  subtask: "Subtask",
  link: "Link",
};

const BEHAVIOR_ORDER: RelationshipBehavior[] = ["blocking", "subtask", "link"];

export function TaskRelationshipsDrawer() {
  const { state: task } = useContext(TaskContext);
  const { data, isLoading } = useTaskRelationshipsQuery(task.ID);
  const { data: relationshipTypes = [] } = useTaskRelationshipTypesQuery();
  const createRelationship = useCreateTaskRelationshipMutation();

  const [newRelState, setNewRelState] = useState<NewRelState>(null);

  const categories = groupIntoCategories(data ?? []);

  const typesByBehavior = useMemo(() => {
    const map = new Map<RelationshipBehavior, TaskRelationshipType[]>();
    for (const t of relationshipTypes) {
      const list = map.get(t.Behavior as RelationshipBehavior) ?? [];
      list.push(t);
      map.set(t.Behavior as RelationshipBehavior, list);
    }
    return map;
  }, [relationshipTypes]);

  // IDs of tasks already linked with the selected type+direction (for dedup)
  const newRelExcludeIds = useMemo(() => {
    if (!newRelState || newRelState.step !== "task") return new Set<number>();
    const { typeId, direction } = newRelState;
    const excluded = new Set<number>();
    for (const rel of data ?? []) {
      if (rel.Type.ID === typeId && rel.Direction === direction) {
        excluded.add(rel.Other.ID);
      }
    }
    return excluded;
  }, [newRelState, data]);

  const handleCategorySelect = (typeId: number, direction: "from" | "to") => {
    setNewRelState({ step: "task", typeId, direction });
  };

  const handleNewTaskSelect = (selectedTask: TaskWithProject) => {
    if (!newRelState || newRelState.step !== "task") return;
    const { typeId, direction } = newRelState;
    const fromTaskId = direction === "from" ? task.ID : selectedTask.ID;
    const toTaskId = direction === "from" ? selectedTask.ID : task.ID;
    createRelationship.mutate({ fromTaskId, toTaskId, typeId });
    setNewRelState(null);
  };

  return (
    <DrawerContent className="sm:min-w-2xl p-4 gap-4">
      <DrawerHeader className="p-0 shrink-0">
        <DrawerTitle className="flex gap-2 items-center">
          <LinkIcon className="size-4 stroke-muted-foreground" />
          Linked Tasks
        </DrawerTitle>
        <DrawerDescription className="text-start">
          View and edit linked tasks
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <div className="flex gap-2 shrink-0">
          <InputGroup>
            <InputGroupInput placeholder="Search linked tasks..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">7 links</InputGroupAddon>
          </InputGroup>

          {newRelState?.step === "task" ? (
            <SelectRelationshipTask
              open={true}
              onOpenChange={(open) => { if (!open) setNewRelState(null); }}
              excludeTaskIds={newRelExcludeIds}
              onSelect={handleNewTaskSelect}
              trigger={
                <Button className="hover:cursor-pointer">
                  <PlusIcon />
                  Add
                </Button>
              }
            />
          ) : (
            <Popover
              open={newRelState?.step === "category"}
              onOpenChange={(open) => setNewRelState(open ? { step: "category" } : null)}
            >
              <PopoverTrigger asChild>
                <Button className="hover:cursor-pointer">
                  <PlusIcon />
                  Link
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start">
                <Command>
                  <CommandList>
                    {BEHAVIOR_ORDER.filter((b) => typesByBehavior.has(b)).map((behavior) => (
                      <CommandGroup key={behavior} heading={BEHAVIOR_GROUP_LABEL[behavior]}>
                        {typesByBehavior.get(behavior)!.flatMap((type) => [
                          <CommandItem
                            key={`${type.ID}-from`}
                            value={type.FromName}
                            onSelect={() => handleCategorySelect(type.ID, "from")}
                            className="flex items-center gap-2"
                          >
                            <Badge
                              variant="outline"
                              className={stageBadgeClass(type.Color)}
                            >
                              <DynamicIcon
                                name={type.Icon as IconName}
                                className={stageStrokeClass(type.Color)}
                                fallback={() => <LinkIcon className="size-3" />}
                              />
                              {type.FromName}
                            </Badge>
                          </CommandItem>,
                          <CommandItem
                            key={`${type.ID}-to`}
                            value={type.ToName}
                            onSelect={() => handleCategorySelect(type.ID, "to")}
                            className="flex items-center gap-2"
                          >
                            <Badge
                              variant="outline"
                              className={stageBadgeClass(type.Color)}
                            >
                              <DynamicIcon
                                name={type.Icon as IconName}
                                className={stageStrokeClass(type.Color)}
                                fallback={() => <LinkIcon className="size-3" />}
                              />
                              {type.ToName}
                            </Badge>
                          </CommandItem>,
                        ])}
                      </CommandGroup>
                    ))}
                    <CommandEmpty>No relationship types found.</CommandEmpty>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div
          className="flex flex-col gap-3 overflow-y-auto -mr-2 pr-2"
          onWheel={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-muted-foreground">
              <LinkIcon className="size-6" />
              <p className="text-sm">No linked tasks yet</p>
            </div>
          ) : (
            categories.map((category) => (
              <RelationshipCategorySection
                key={category.key}
                category={category}
              />
            ))
          )}
        </div>
      </div>
    </DrawerContent>
  );
}
