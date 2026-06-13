import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { LinkIcon } from "lucide-react";

export function TaskRelationshipsDrawer() {
  return (
    <DrawerContent className="sm:min-w-2xl">
      <DrawerHeader>
        <DrawerTitle className="flex gap-2 items-center">
          <LinkIcon className="size-4 stroke-muted-foreground" />
          Relations
        </DrawerTitle>
        <DrawerDescription className="text-start">
          Manage relationships between your tasks
        </DrawerDescription>
      </DrawerHeader>
    </DrawerContent>
  );
}
