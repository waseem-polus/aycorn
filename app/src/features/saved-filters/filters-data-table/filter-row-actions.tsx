import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CopyIcon, ExternalLinkIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pinToBoard } from "@/features/saved-filters/board";
import { DeleteSavedFiltersDialog } from "@/features/saved-filters/delete-saved-filters-dialog";
import { setActiveFilterOnBoard } from "@/features/saved-filters/open-filter-on-board";
import { useSavedFilterMutations } from "@/features/saved-filters/queries/useSavedFilterMutations";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";

export function FilterRowActions({ filter }: { filter: SavedFilter }) {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { duplicate } = useSavedFilterMutations();
  const firstPin = filter.Pins[0];

  /** Conditions are edited on a board, so "open" means: go to one where it's pinned, with it active. */
  const open = () => {
    if (!firstPin) return;
    const board = pinToBoard(firstPin);
    setActiveFilterOnBoard(board, filter.ID);
    if (board.surface === "upcoming") navigate({ to: "/upcoming", search: { layout: "list" } });
    else navigate({ to: "/project/$projectId", params: { projectId: String(board.projectId) } });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label={`${filter.Name} actions`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem disabled={!firstPin} onSelect={open}>
            <ExternalLinkIcon />
            {firstPin ? "Open on a board" : "Pin to a board to edit"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              duplicate.mutate(filter.ID, {
                onSuccess: (copy) => toast(`Created “${copy.Name}”.`),
                onError: () => toast.error("Couldn't duplicate the filter."),
              })
            }
          >
            <CopyIcon />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(true)}>
            <Trash2Icon />
            Delete…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* A sibling of the menu, not a child: portal'd dialog events bubble through the React tree. */}
      <DeleteSavedFiltersDialog filters={[filter]} open={deleting} onOpenChange={setDeleting} />
    </>
  );
}
