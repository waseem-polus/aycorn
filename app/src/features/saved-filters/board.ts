import type { Board, SavedFilter, SavedFilterPin } from "@/features/saved-filters/saved-filter-types";

/** The localStorage scope a board's filter state lives under (unchanged since phase 1). */
export const boardScope = (board: Board) =>
  board.surface === "upcoming" ? "upcoming" : `project.${board.projectId}`;

/** The server's `{surface, projectId}` shape for a board. */
export const boardToWire = (board: Board) => ({
  surface: board.surface,
  projectId: board.surface === "project" ? board.projectId : null,
});

/** Whether a pin is on one of the board's views. */
export const pinIsOnBoard = (pin: SavedFilterPin, board: Board) =>
  pin.Surface === board.surface &&
  (board.surface !== "project" || pin.ProjectID === board.projectId);

/** The filters pinned to a view, in bar order. None while the view is loading. */
export const viewFilters = (filters: SavedFilter[], viewId: number | null): SavedFilter[] =>
  filters
    .flatMap((f) => {
      const pin = viewId === null ? undefined : f.Pins.find((p) => p.ViewID === viewId);
      return pin ? [{ filter: f, position: pin.Position }] : [];
    })
    .sort((a, b) => a.position - b.position || a.filter.ID - b.filter.ID)
    .map(({ filter }) => filter);

export const pinToBoard = (pin: SavedFilterPin): Board =>
  pin.Surface === "project" && pin.ProjectID !== null
    ? { surface: "project", projectId: pin.ProjectID }
    : { surface: "upcoming" };
