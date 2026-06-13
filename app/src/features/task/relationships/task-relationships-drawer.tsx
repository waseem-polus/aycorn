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
          Linked Tasks
        </DrawerTitle>
        <DrawerDescription className="text-start">
          7 linked tasks · auto reciprocal
        </DrawerDescription>
      </DrawerHeader>
    </DrawerContent>
  );
}
