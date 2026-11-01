import { toast } from "sonner";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { pinToBoard } from "@/features/saved-filters/board";
import { useSavedFilterMutations } from "@/features/saved-filters/queries/useSavedFilterMutations";
import type { Board, SavedFilter } from "@/features/saved-filters/saved-filter-types";
import type { Project } from "@/types/types";

const boardKey = (board: Board) =>
  board.surface === "upcoming" ? "upcoming" : `project:${board.projectId}`;

const keyToBoard = (key: string): Board =>
  key === "upcoming" ? { surface: "upcoming" } : { surface: "project", projectId: Number(key.split(":")[1]) };

/** Which boards show this filter as a quick filter; toggling a board pins or unpins it there. */
export function FilterPinsCell({ filter, projects }: { filter: SavedFilter; projects: Project[] }) {
  const { setPins } = useSavedFilterMutations();
  const selected = filter.Pins.map((p) => boardKey(pinToBoard(p)));

  const toggle = (key: string | number) => {
    const next = selected.includes(String(key))
      ? selected.filter((k) => k !== key)
      : [...selected, String(key)];
    setPins.mutate(
      { id: filter.ID, boards: next.map(keyToBoard) },
      { onError: () => toast.error("Couldn't update where the filter is pinned.") },
    );
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <MultiSelectCombobox
        label="Boards"
        icon="pin"
        groups={[
          { label: "Pages", options: [{ key: "upcoming", label: "Upcoming" }] },
          {
            label: "Projects",
            options: projects.map((p) => ({
              key: `project:${p.ID}`,
              label: p.Name,
              sublabel: p.Archived ? "Archived" : undefined,
            })),
          },
        ]}
        selected={selected}
        onToggle={toggle}
        onClear={() =>
          setPins.mutate(
            { id: filter.ID, boards: [] },
            { onError: () => toast.error("Couldn't update where the filter is pinned.") },
          )
        }
      />
    </div>
  );
}
