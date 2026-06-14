import { useContext } from "react";
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
import { LinkIcon, PlusIcon, SearchIcon } from "lucide-react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import { groupIntoCategories } from "@/features/task/relationships/relationships-grouping";
import { RelationshipCategorySection } from "@/features/task/relationships/task-relationships-drawer/relationship-category";
import { Button } from "@/components/ui/button";

export function TaskRelationshipsDrawer() {
  const { state: task } = useContext(TaskContext);
  const { data, isLoading } = useTaskRelationshipsQuery(task.ID);

  const categories = groupIntoCategories(data ?? []);

  return (
    <DrawerContent className="sm:min-w-2xl p-4 gap-4">
      <DrawerHeader className="p-0">
        <DrawerTitle className="flex gap-2 items-center">
          <LinkIcon className="size-4 stroke-muted-foreground" />
          Linked Tasks
        </DrawerTitle>
        <DrawerDescription className="text-start">
          View and edit linked tasks
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex flex-col">
        <div className="flex gap-2">
          <InputGroup>
            <InputGroupInput placeholder="Search linked tasks..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">7 links</InputGroupAddon>
          </InputGroup>
          <Button className="hover:cursor-pointer">
            <PlusIcon />
            New
          </Button>
        </div>
        <div
          className="flex flex-col gap-3 overflow-y-auto"
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
