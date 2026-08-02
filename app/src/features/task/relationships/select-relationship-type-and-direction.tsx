import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { LinkIcon } from "lucide-react";
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
import { useTaskRelationshipTypesQuery } from "@/features/task/relationships/queries/useTaskRelationshipTypesQuery";
import { stageBadgeClass, stageStrokeClass } from "@/features/stage/stage-palette";
import {
  RELATIONSHIP_BEHAVIORS,
  type RelationshipBehavior,
  type TaskRelationshipType,
} from "@/types/types";

const BEHAVIOR_GROUP_LABEL: Record<RelationshipBehavior, string> = {
  blocking: "Blocking",
  subtask: "Subtask",
  link: "Link",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (typeId: number, direction: "from" | "to") => void;
  trigger: React.ReactNode;
};

export function SelectRelationshipTypeAndDirection({
  open,
  onOpenChange,
  onSelect,
  trigger,
}: Props) {
  const { data: relationshipTypes = [] } = useTaskRelationshipTypesQuery();

  const typesByBehavior = useMemo(() => {
    const map = new Map<RelationshipBehavior, TaskRelationshipType[]>();
    for (const t of relationshipTypes) {
      const list = map.get(t.Behavior as RelationshipBehavior) ?? [];
      list.push(t);
      map.set(t.Behavior as RelationshipBehavior, list);
    }
    return map;
  }, [relationshipTypes]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandList>
            {RELATIONSHIP_BEHAVIORS.filter((b) => typesByBehavior.has(b)).map((behavior) => (
              <CommandGroup key={behavior} heading={BEHAVIOR_GROUP_LABEL[behavior]}>
                {typesByBehavior.get(behavior)!.flatMap((type) => [
                  <CommandItem
                    key={`${type.ID}-from`}
                    value={type.FromName}
                    onSelect={() => onSelect(type.ID, "from")}
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
                    onSelect={() => onSelect(type.ID, "to")}
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
  );
}
