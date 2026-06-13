import { Button } from "@/components/ui/button";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LinkIcon, PlusIcon, SearchIcon } from "lucide-react";

export function TaskRelationshipsDrawer() {
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
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <InputGroup>
            <InputGroupInput placeholder="Search linked tasks..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">7 tasks</InputGroupAddon>
          </InputGroup>
          <Button className="hover:cursor-pointer">
            <PlusIcon />
            New
          </Button>
        </div>
        <ToggleGroup
          defaultValue="all"
          type="single"
          variant="outline"
          className="self-start"
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="blocking">Blocking</ToggleGroupItem>
          <ToggleGroupItem value="subtasks">Subtasks</ToggleGroupItem>
          <ToggleGroupItem value="mentions">Mentions</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </DrawerContent>
  );
}
