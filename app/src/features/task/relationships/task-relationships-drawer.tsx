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
import { Button } from "@/components/ui/button";
import { LinkIcon, PlusIcon, SearchIcon } from "lucide-react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import { useCreateTaskRelationshipMutation } from "@/features/task/relationships/queries/useCreateTaskRelationshipMutation";
import {
  groupRelationshipsByType,
  toRelationshipSections,
} from "@/features/task/relationships/relationships-grouping";
import { RelationshipCategorySection } from "@/features/task/relationships/task-relationships-drawer/relationship-category";
import { SelectRelationshipTask } from "@/features/task/relationships/select-relationship-task";
import { SelectRelationshipTypeAndDirection } from "@/features/task/relationships/select-relationship-type-and-direction";
import type { TaskWithProject } from "@/types/types";

type NewRelState =
  | null
  | { step: "category" }
  | { step: "task"; typeId: number; direction: "from" | "to" };

export function TaskRelationshipsDrawer() {
  const { state: task } = useContext(TaskContext);
  const { data, isLoading } = useTaskRelationshipsQuery(task.ID);
  const createRelationship = useCreateTaskRelationshipMutation();

  const [newRelState, setNewRelState] = useState<NewRelState>(null);
  const [search, setSearch] = useState("");

  const filteredRelationships = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data ?? [];
    return (data ?? []).filter((rel) =>
      rel.Other.Name.toLowerCase().includes(query),
    );
  }, [data, search]);

  const categories = toRelationshipSections(
    groupRelationshipsByType(filteredRelationships),
  );

  // IDs of tasks already linked with the selected type+direction (for dedup),
  // plus the current task itself so it can't be linked to itself.
  const newRelExcludeIds = useMemo(() => {
    if (!newRelState || newRelState.step !== "task") return new Set<number>();
    const { typeId, direction } = newRelState;
    const excluded = new Set<number>([task.ID]);
    for (const rel of data ?? []) {
      if (rel.Type.ID === typeId && rel.Direction === direction) {
        excluded.add(rel.Other.ID);
      }
    }
    return excluded;
  }, [newRelState, data, task.ID]);

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
            <InputGroupInput
              placeholder="Search linked tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
                      <InputGroupAddon align="inline-end">{data?.length ?? 0} link{(data?.length ?? 0) > 1 ? "s" : ""}</InputGroupAddon>
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
            <SelectRelationshipTypeAndDirection
              open={newRelState?.step === "category"}
              onOpenChange={(open) => setNewRelState(open ? { step: "category" } : null)}
              onSelect={handleCategorySelect}
              trigger={
                <Button className="hover:cursor-pointer">
                  <PlusIcon />
                  Link
                </Button>
              }
            />
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
              <p className="text-sm">
                {search.trim() ? "No matching linked tasks" : "No linked tasks yet"}
              </p>
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
