import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SquareDashedIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import {
  canWrap,
  findNode,
  fitsAtDepth,
  createGroup,
  groupDepth,
} from "@/features/task-filters/conditions/condition-tree-ops";

type Props = {
  nodeId: string;
  kind: "condition" | "group";
};

/**
 * The ⋯ menu on a condition or group. Move up / down are the keyboard
 * alternative to dragging; nesting actions disappear at the depth cap.
 */
export function NodeActionsMenu({ nodeId, kind }: Props) {
  const { tree } = useConditionBuilder();
  const found = findNode(tree.root, nodeId);
  if (!found?.parent) return null;

  const siblings = found.parent.children.length;
  const canAddSubgroup =
    kind === "group" && fitsAtDepth(createGroup(), groupDepth(tree.root, nodeId));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          aria-label={kind === "group" ? "Group actions" : "Condition actions"}
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-vaul-no-drag>
        {kind === "group" && (
          <>
            <DropdownMenuItem onSelect={() => tree.addCondition(nodeId)}>
              <PlusIcon />
              Add condition
            </DropdownMenuItem>
            {canAddSubgroup && (
              <DropdownMenuItem onSelect={() => tree.addGroup(nodeId)}>
                <SquareDashedIcon />
                Add subgroup
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        {canWrap(tree.root, nodeId) && (
          <DropdownMenuItem onSelect={() => tree.wrapInGroup(nodeId)}>
            <SquareDashedIcon />
            Wrap in group
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => tree.duplicate(nodeId)}>
          <CopyIcon />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={found.index === 0}
          onSelect={() => tree.shift(nodeId, -1)}
        >
          <ArrowUpIcon />
          Move up
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={found.index === siblings - 1}
          onSelect={() => tree.shift(nodeId, 1)}
        >
          <ArrowDownIcon />
          Move down
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => tree.remove(nodeId)}>
          <Trash2Icon />
          {kind === "group" ? "Delete group" : "Delete condition"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
